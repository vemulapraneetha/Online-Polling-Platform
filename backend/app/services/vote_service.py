"""
Vote service — business logic for vote upsert, withdrawal, and lookup.
"""

from datetime import datetime, timezone

from bson import ObjectId

from app.db.client import get_database
from app.schemas.vote import VoteResponse, MyVoteResponse
from app.utils.exceptions import not_found, conflict, forbidden


async def can_access_poll(poll_doc: dict, user_id: str) -> bool:
    """
    Check if a user can access a poll for voting/viewing.

    Access rules:
    - Creator can always access.
    - Public + open polls are accessible to any authenticated user.
    - Private polls require an active invitation.
    """
    is_creator = str(poll_doc["creator_id"]) == user_id

    if is_creator:
        return True

    if poll_doc.get("visibility") == "public" and poll_doc.get("status") == "open":
        return True

    # Check for active invitation
    db = get_database()
    invitation = await db.invitations.find_one({
        "poll_id": poll_doc["_id"],
        "invitee_id": ObjectId(user_id),
        "status": "active",
    })
    if invitation is not None:
        return True

    return False


def _serialize_vote(doc: dict) -> VoteResponse:
    """Convert a MongoDB vote document into a VoteResponse."""
    return VoteResponse(
        vote_id=str(doc["_id"]),
        poll_id=str(doc["poll_id"]),
        user_id=str(doc["user_id"]),
        selected_options=doc["selected_options"],
        voted_at=doc["voted_at"],
        updated_at=doc["updated_at"],
    )


async def upsert_vote(
    poll_id: str,
    user_id: str,
    selected_options: list[str],
) -> VoteResponse:
    """
    Create or update a vote for a user on a poll.

    Validates:
    - Poll exists and is open.
    - User has access (public, creator, or invited).
    - Selected options exist in poll.options.
    - single_choice: exactly 1 option.
    - multi_choice: 1 or more options.
    """
    db = get_database()

    try:
        poll_oid = ObjectId(poll_id)
    except Exception:
        raise not_found("Poll")

    poll = await db.polls.find_one({"_id": poll_oid})
    if poll is None:
        raise not_found("Poll")

    # Poll must be open
    if poll.get("status") != "open":
        raise conflict("Poll is not open for voting")

    # Access check
    has_access = await can_access_poll(poll, user_id)
    if not has_access:
        raise forbidden("You do not have access to vote on this poll")

    # Validate selected options exist in poll
    valid_option_ids = {opt["id"] for opt in poll.get("options", [])}
    for opt_id in selected_options:
        if opt_id not in valid_option_ids:
            raise not_found(f"Option '{opt_id}'")

    # Validate count based on poll type
    poll_type = poll.get("poll_type", "single_choice")
    if poll_type == "single_choice" and len(selected_options) != 1:
        raise conflict("Single choice polls require exactly 1 option")
    if poll_type == "multi_choice" and len(selected_options) < 1:
        raise conflict("Multi choice polls require at least 1 option")

    now = datetime.now(timezone.utc)
    user_oid = ObjectId(user_id)

    # Check if vote already exists (upsert)
    existing_vote = await db.votes.find_one({
        "poll_id": poll_oid,
        "user_id": user_oid,
    })

    if existing_vote:
        # Update existing vote
        await db.votes.update_one(
            {"_id": existing_vote["_id"]},
            {
                "$set": {
                    "selected_options": selected_options,
                    "updated_at": now,
                }
            },
        )
        updated = await db.votes.find_one({"_id": existing_vote["_id"]})
        return _serialize_vote(updated)
    else:
        # Create new vote
        vote_doc = {
            "poll_id": poll_oid,
            "user_id": user_oid,
            "selected_options": selected_options,
            "voted_at": now,
            "updated_at": now,
        }
        result = await db.votes.insert_one(vote_doc)
        vote_doc["_id"] = result.inserted_id
        return _serialize_vote(vote_doc)


async def withdraw_vote(poll_id: str, user_id: str) -> None:
    """
    Delete the current user's vote on a poll.

    Errors:
    - 409 if poll is not open.
    - 404 if no vote exists.
    """
    db = get_database()

    try:
        poll_oid = ObjectId(poll_id)
    except Exception:
        raise not_found("Poll")

    poll = await db.polls.find_one({"_id": poll_oid})
    if poll is None:
        raise not_found("Poll")

    if poll.get("status") != "open":
        raise conflict("Cannot withdraw vote — poll is not open")

    user_oid = ObjectId(user_id)
    vote = await db.votes.find_one({
        "poll_id": poll_oid,
        "user_id": user_oid,
    })
    if vote is None:
        raise not_found("Vote")

    await db.votes.delete_one({"_id": vote["_id"]})


async def get_my_vote(poll_id: str, user_id: str) -> MyVoteResponse:
    """
    Return the current user's vote on a poll, or a null-like response.
    """
    db = get_database()

    try:
        poll_oid = ObjectId(poll_id)
    except Exception:
        raise not_found("Poll")

    poll = await db.polls.find_one({"_id": poll_oid})
    if poll is None:
        raise not_found("Poll")

    user_oid = ObjectId(user_id)
    vote = await db.votes.find_one({
        "poll_id": poll_oid,
        "user_id": user_oid,
    })

    if vote is None:
        return MyVoteResponse(has_voted=False)

    return MyVoteResponse(
        vote_id=str(vote["_id"]),
        poll_id=str(vote["poll_id"]),
        user_id=str(vote["user_id"]),
        selected_options=vote["selected_options"],
        voted_at=vote["voted_at"],
        updated_at=vote["updated_at"],
        has_voted=True,
    )
