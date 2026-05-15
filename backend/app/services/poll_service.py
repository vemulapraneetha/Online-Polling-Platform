"""
Poll service — business logic for poll CRUD operations.
"""

import math
from datetime import datetime, timezone
from typing import Optional

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


async def get_poll_by_id(poll_id: str, user_id: str) -> PollResponse:
    """
    Fetch a single poll by ID.

    Access rules:
    - Creator can always see their own poll.
    - Public + open polls are visible to anyone.
    - Private polls require an active invitation (checked here naively;
      full invitation logic comes in Phase 2).
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
            "status": "pending",
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
