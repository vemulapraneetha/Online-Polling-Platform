"""
Poll service — business logic for poll CRUD, lifecycle, feed, and auto-close.
"""

import logging
import math
from datetime import datetime, timezone
from typing import Optional

# pyrefly: ignore [missing-import]
from bson import ObjectId

from app.db.client import get_database
from app.schemas.poll import (
    PollCreate,
    PollOption,
    PollResponse,
    PollUpdate,
    PollListResponse,
)
from app.utils.exceptions import not_found, forbidden, conflict

logger = logging.getLogger(__name__)


def _build_options(labels: list) -> list[dict]:
    """Convert a list of PollOptionCreate into option dicts with auto-IDs."""
    return [
        {"id": f"opt_{i + 1}", "label": opt.label}
        for i, opt in enumerate(labels)
    ]


def _serialize_poll(doc: dict) -> PollResponse:
    """Convert a MongoDB poll document into a PollResponse."""
    doc["_id"] = str(doc["_id"])
    doc["creator_id"] = str(doc["creator_id"])
    doc["options"] = [PollOption(**o) for o in doc.get("options", [])]
    return PollResponse(**doc)


async def create_poll(payload: PollCreate, creator_id: str) -> PollResponse:
    """
    Create a new poll in draft status.

    Auto-generates option IDs (opt_1, opt_2, …).
    """
    db = get_database()
    now = datetime.now(timezone.utc)

    poll_doc = {
        "creator_id": ObjectId(creator_id),
        "title": payload.title,
        "description": payload.description,
        "poll_type": payload.poll_type.value,
        "status": "draft",
        "visibility": payload.visibility.value,
        "options": _build_options(payload.options),
        "results_visibility": payload.results_visibility.value,
        "expires_at": payload.expires_at,
        "created_at": now,
        "updated_at": now,
        "published_at": None,
        "closed_at": None,
    }

    result = await db.polls.insert_one(poll_doc)
    poll_doc["_id"] = result.inserted_id

    return _serialize_poll(poll_doc)


async def get_my_polls(
    user_id: str,
    status_filter: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
) -> PollListResponse:
    """
    Paginated list of polls belonging to the current user.

    Optionally filtered by ``status``.
    """
    db = get_database()

    query: dict = {"creator_id": ObjectId(user_id)}
    if status_filter:
        query["status"] = status_filter

    total = await db.polls.count_documents(query)
    pages = max(1, math.ceil(total / limit))
    skip = (page - 1) * limit

    cursor = db.polls.find(query).sort("created_at", -1).skip(skip).limit(limit)
    docs = await cursor.to_list(length=limit)

    polls = [_serialize_poll(doc) for doc in docs]

    return PollListResponse(
        polls=polls,
        total=total,
        page=page,
        limit=limit,
        pages=pages,
    )


async def get_templates(
    user_id: str,
    page: int = 1,
    limit: int = 20,
) -> dict:
    """
    Get current user's previous polls (open or closed) to use as templates.
    """
    db = get_database()

    query = {
        "creator_id": ObjectId(user_id),
        "status": {"$in": ["open", "closed"]},
    }

    total = await db.polls.count_documents(query)
    skip = (page - 1) * limit

    cursor = db.polls.find(query).sort("created_at", -1).skip(skip).limit(limit)
    docs = await cursor.to_list(length=limit)

    items = []
    for doc in docs:
        items.append({
            "_id": str(doc["_id"]),
            "title": doc["title"],
            "poll_type": doc.get("poll_type", "single_choice"),
            "visibility": doc.get("visibility", "public"),
            "created_at": doc.get("created_at"),
            "options_count": len(doc.get("options", [])),
        })

    has_next = (page * limit) < total

    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit,
        "has_next": has_next,
    }


async def duplicate_poll(poll_id: str, user_id: str) -> PollResponse:
    """
    Duplicate an existing poll to create a new draft poll.
    Only the creator can duplicate their own poll.
    """
    db = get_database()

    try:
        oid = ObjectId(poll_id)
    except Exception:
        raise not_found("Poll")

    doc = await db.polls.find_one({"_id": oid})
    if doc is None:
        raise not_found("Poll")

    if str(doc["creator_id"]) != user_id:
        raise forbidden("Only the poll creator can duplicate this poll")

    now = datetime.now(timezone.utc)
    new_title = doc.get("title", "")
    if not new_title.startswith("Copy of "):
        new_title = f"Copy of {new_title}"

    poll_doc = {
        "creator_id": ObjectId(user_id),
        "title": new_title,
        "description": doc.get("description"),
        "poll_type": doc.get("poll_type"),
        "status": "draft",
        "visibility": doc.get("visibility"),
        "options": doc.get("options", []),
        "results_visibility": doc.get("results_visibility"),
        "expires_at": doc.get("expires_at"),
        "created_at": now,
        "updated_at": now,
        "published_at": None,
        "closed_at": None,
    }

    result = await db.polls.insert_one(poll_doc)
    poll_doc["_id"] = result.inserted_id

    return _serialize_poll(poll_doc)


async def get_poll_by_id(poll_id: str, user_id: str) -> PollResponse:
    """
    Fetch a single poll by ID.

    Access rules:
    - Creator can always see their own poll.
    - Public + open polls are visible to anyone.
    - Private polls require an active invitation.
    """
    db = get_database()

    try:
        oid = ObjectId(poll_id)
    except Exception:
        raise not_found("Poll")

    doc = await db.polls.find_one({"_id": oid})
    if doc is None:
        raise not_found("Poll")

    is_creator = str(doc["creator_id"]) == user_id
    is_public_and_open = (
        doc.get("visibility") == "public" and doc.get("status") == "open"
    )

    if not is_creator and not is_public_and_open:
        # Check for an active invitation
        invitation = await db.invitations.find_one({
            "poll_id": oid,
            "invitee_id": ObjectId(user_id),
            "status": "active",
        })
        if invitation is None:
            raise forbidden("You do not have access to this poll")

    return _serialize_poll(doc)


async def update_poll(
    poll_id: str,
    payload: PollUpdate,
    user_id: str,
) -> PollResponse:
    """
    Update a poll — creator only, draft status only.
    """
    db = get_database()

    try:
        oid = ObjectId(poll_id)
    except Exception:
        raise not_found("Poll")

    doc = await db.polls.find_one({"_id": oid})
    if doc is None:
        raise not_found("Poll")

    if str(doc["creator_id"]) != user_id:
        raise forbidden("Only the poll creator can update this poll")

    if doc.get("status") != "draft":
        raise conflict("Only polls in draft status can be updated")

    # Build the $set dict from non-None fields
    update_data: dict = {}
    if payload.title is not None:
        update_data["title"] = payload.title
    if payload.description is not None:
        update_data["description"] = payload.description
    if payload.poll_type is not None:
        update_data["poll_type"] = payload.poll_type.value
    if payload.visibility is not None:
        update_data["visibility"] = payload.visibility.value
    if payload.results_visibility is not None:
        update_data["results_visibility"] = payload.results_visibility.value
    if payload.expires_at is not None:
        update_data["expires_at"] = payload.expires_at
    if payload.options is not None:
        update_data["options"] = _build_options(payload.options)

    if not update_data:
        return _serialize_poll(doc)

    update_data["updated_at"] = datetime.now(timezone.utc)

    await db.polls.update_one({"_id": oid}, {"$set": update_data})

    updated = await db.polls.find_one({"_id": oid})
    return _serialize_poll(updated)


async def delete_poll(poll_id: str, user_id: str) -> None:
    """
    Hard-delete a poll — creator only, draft status only.
    """
    db = get_database()

    try:
        oid = ObjectId(poll_id)
    except Exception:
        raise not_found("Poll")

    doc = await db.polls.find_one({"_id": oid})
    if doc is None:
        raise not_found("Poll")

    if str(doc["creator_id"]) != user_id:
        raise forbidden("Only the poll creator can delete this poll")

    if doc.get("status") != "draft":
        raise conflict("Only polls in draft status can be deleted")

    await db.polls.delete_one({"_id": oid})


# ── Lifecycle ────────────────────────────────────────────────────────────────


async def publish_poll(poll_id: str, user_id: str) -> PollResponse:
    """
    Publish a poll: draft → open.

    Sets published_at = now.
    After publishing, title, options, poll_type, and visibility are immutable.

    Errors:
    - 403 if not creator.
    - 409 if not in draft status.
    """
    db = get_database()

    try:
        oid = ObjectId(poll_id)
    except Exception:
        raise not_found("Poll")

    doc = await db.polls.find_one({"_id": oid})
    if doc is None:
        raise not_found("Poll")

    if str(doc["creator_id"]) != user_id:
        raise forbidden("Only the poll creator can publish this poll")

    if doc.get("status") != "draft":
        raise conflict("Only polls in draft status can be published")

    now = datetime.now(timezone.utc)
    await db.polls.update_one(
        {"_id": oid},
        {
            "$set": {
                "status": "open",
                "published_at": now,
                "updated_at": now,
            }
        },
    )

    updated = await db.polls.find_one({"_id": oid})
    return _serialize_poll(updated)


async def close_poll(poll_id: str, user_id: str) -> PollResponse:
    """
    Close a poll: open → closed.

    Sets closed_at = now.

    Errors:
    - 403 if not creator.
    - 409 if not in open status.
    """
    db = get_database()

    try:
        oid = ObjectId(poll_id)
    except Exception:
        raise not_found("Poll")

    doc = await db.polls.find_one({"_id": oid})
    if doc is None:
        raise not_found("Poll")

    if str(doc["creator_id"]) != user_id:
        raise forbidden("Only the poll creator can close this poll")

    if doc.get("status") != "open":
        raise conflict("Only polls in open status can be closed")

    now = datetime.now(timezone.utc)
    await db.polls.update_one(
        {"_id": oid},
        {
            "$set": {
                "status": "closed",
                "closed_at": now,
                "updated_at": now,
            }
        },
    )

    updated = await db.polls.find_one({"_id": oid})
    return _serialize_poll(updated)


# ── Auto-close (called by APScheduler) ──────────────────────────────────────


async def auto_close_expired_polls() -> None:
    """
    Query for polls where status="open" and expires_at <= now.
    Set status="closed" and closed_at=now for each.

    Called by APScheduler every 60 seconds.
    """
    db = get_database()
    now = datetime.now(timezone.utc)

    query = {
        "status": "open",
        "expires_at": {"$lte": now, "$ne": None},
    }

    result = await db.polls.update_many(
        query,
        {
            "$set": {
                "status": "closed",
                "closed_at": now,
                "updated_at": now,
            }
        },
    )

    if result.modified_count > 0:
        logger.info(f"Auto-closed {result.modified_count} expired poll(s)")
    else:
        logger.debug("Auto-close check: no expired polls found")


# ── Public Feed ──────────────────────────────────────────────────────────────


async def get_public_feed(
    poll_type: str = "all",
    sort_by: str = "created_at",
    sort_order: str = "desc",
    page: int = 1,
    limit: int = 20,
) -> PollListResponse:
    """
    Public feed of open polls.

    Filters: poll_type (single_choice, multi_choice, all).
    Sort: created_at or expires_at.
    Order: asc or desc.
    """
    db = get_database()

    query: dict = {
        "status": "open",
        "visibility": "public",
    }

    if poll_type != "all":
        query["poll_type"] = poll_type

    # Validate sort field
    if sort_by not in ("created_at", "expires_at"):
        sort_by = "created_at"

    sort_direction = -1 if sort_order == "desc" else 1

    total = await db.polls.count_documents(query)
    skip = (page - 1) * limit

    cursor = (
        db.polls.find(query)
        .sort(sort_by, sort_direction)
        .skip(skip)
        .limit(limit)
    )
    docs = await cursor.to_list(length=limit)

    polls = [_serialize_poll(doc) for doc in docs]
    pages = max(1, math.ceil(total / limit))

    return PollListResponse(
        polls=polls,
        total=total,
        page=page,
        limit=limit,
        pages=pages,
    )
