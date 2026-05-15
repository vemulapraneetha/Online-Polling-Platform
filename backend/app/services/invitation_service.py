"""
Invitation service — business logic for inviting, revoking, and listing invitations.
"""

import math
from datetime import datetime, timezone

from bson import ObjectId

from app.db.client import get_database
from app.schemas.invitation import InvitationResponse, InvitationListResponse
from app.schemas.poll import PollResponse, PollOption, PollListResponse
from app.utils.exceptions import not_found, conflict, forbidden


async def _serialize_invitation(doc: dict, db) -> InvitationResponse:
    """Convert a MongoDB invitation document into an InvitationResponse."""
    # Look up invitee user info
    invitee = await db.users.find_one({"_id": doc["invitee_id"]})
    invitee_email = invitee["email"] if invitee else "unknown"
    invitee_username = invitee["username"] if invitee else "unknown"

    return InvitationResponse(
        invitation_id=str(doc["_id"]),
        poll_id=str(doc["poll_id"]),
        inviter_id=str(doc["inviter_id"]),
        invitee_id=str(doc["invitee_id"]),
        invitee_email=invitee_email,
        invitee_username=invitee_username,
        status=doc["status"],
        created_at=doc["created_at"],
        revoked_at=doc.get("revoked_at"),
    )


async def create_invitation(
    poll_id: str,
    inviter_id: str,
    email: str,
) -> InvitationResponse:
    """
    Invite a user to a poll.

    Requirements:
    - Only the poll creator can invite.
    - Look up user by email; 404 if not found.
    - Cannot invite yourself.
    - Cannot create duplicate active invitation.
    """
    db = get_database()

    try:
        poll_oid = ObjectId(poll_id)
    except Exception:
        raise not_found("Poll")

    poll = await db.polls.find_one({"_id": poll_oid})
    if poll is None:
        raise not_found("Poll")

    if str(poll["creator_id"]) != inviter_id:
        raise forbidden("Only the poll creator can send invitations")

    # Find invitee by email
    invitee = await db.users.find_one({"email": email})
    if invitee is None:
        raise not_found("User with this email")

    invitee_id_str = str(invitee["_id"])

    # Cannot invite yourself
    if invitee_id_str == inviter_id:
        raise conflict("You cannot invite yourself")

    # Check for existing active invitation
    existing = await db.invitations.find_one({
        "poll_id": poll_oid,
        "invitee_id": invitee["_id"],
        "status": "active",
    })
    if existing:
        raise conflict("An active invitation already exists for this user")

    now = datetime.now(timezone.utc)
    invitation_doc = {
        "poll_id": poll_oid,
        "inviter_id": ObjectId(inviter_id),
        "invitee_id": invitee["_id"],
        "status": "active",
        "created_at": now,
        "revoked_at": None,
    }

    # If a revoked invitation exists, replace it with a new active one
    revoked = await db.invitations.find_one({
        "poll_id": poll_oid,
        "invitee_id": invitee["_id"],
        "status": "revoked",
    })
    if revoked:
        await db.invitations.update_one(
            {"_id": revoked["_id"]},
            {
                "$set": {
                    "status": "active",
                    "created_at": now,
                    "revoked_at": None,
                }
            },
        )
        updated = await db.invitations.find_one({"_id": revoked["_id"]})
        return await _serialize_invitation(updated, db)

    result = await db.invitations.insert_one(invitation_doc)
    invitation_doc["_id"] = result.inserted_id
    return await _serialize_invitation(invitation_doc, db)


async def revoke_invitation(
    poll_id: str,
    invitee_id: str,
    user_id: str,
) -> InvitationResponse:
    """
    Revoke an invitation — creator only.

    Sets status="revoked" and revoked_at=now.
    Does NOT delete existing votes.
    """
    db = get_database()

    try:
        poll_oid = ObjectId(poll_id)
        invitee_oid = ObjectId(invitee_id)
    except Exception:
        raise not_found("Invitation")

    poll = await db.polls.find_one({"_id": poll_oid})
    if poll is None:
        raise not_found("Poll")

    if str(poll["creator_id"]) != user_id:
        raise forbidden("Only the poll creator can revoke invitations")

    invitation = await db.invitations.find_one({
        "poll_id": poll_oid,
        "invitee_id": invitee_oid,
        "status": "active",
    })
    if invitation is None:
        raise not_found("Invitation")

    now = datetime.now(timezone.utc)
    await db.invitations.update_one(
        {"_id": invitation["_id"]},
        {
            "$set": {
                "status": "revoked",
                "revoked_at": now,
            }
        },
    )

    updated = await db.invitations.find_one({"_id": invitation["_id"]})
    return await _serialize_invitation(updated, db)


async def list_invitations(
    poll_id: str,
    user_id: str,
) -> InvitationListResponse:
    """
    List all invitations (active + revoked) for a poll — creator only.
    """
    db = get_database()

    try:
        poll_oid = ObjectId(poll_id)
    except Exception:
        raise not_found("Poll")

    poll = await db.polls.find_one({"_id": poll_oid})
    if poll is None:
        raise not_found("Poll")

    if str(poll["creator_id"]) != user_id:
        raise forbidden("Only the poll creator can view invitations")

    cursor = db.invitations.find({"poll_id": poll_oid}).sort("created_at", -1)
    docs = await cursor.to_list(length=500)

    invitations = []
    for doc in docs:
        inv = await _serialize_invitation(doc, db)
        invitations.append(inv)

    return InvitationListResponse(
        invitations=invitations,
        total=len(invitations),
    )


def _serialize_poll(doc: dict) -> PollResponse:
    """Convert a MongoDB poll document into a PollResponse."""
    doc["_id"] = str(doc["_id"])
    doc["creator_id"] = str(doc["creator_id"])
    doc["options"] = [PollOption(**o) for o in doc.get("options", [])]
    return PollResponse(**doc)


async def get_shared_polls(
    user_id: str,
    page: int = 1,
    limit: int = 20,
) -> PollListResponse:
    """
    Get polls where the current user has an active invitation.
    """
    db = get_database()
    user_oid = ObjectId(user_id)

    # Find all active invitations for this user
    inv_cursor = db.invitations.find({
        "invitee_id": user_oid,
        "status": "active",
    })
    inv_docs = await inv_cursor.to_list(length=1000)
    poll_ids = [inv["poll_id"] for inv in inv_docs]

    if not poll_ids:
        return PollListResponse(
            polls=[],
            total=0,
            page=page,
            limit=limit,
            pages=1,
        )

    query = {"_id": {"$in": poll_ids}}
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
