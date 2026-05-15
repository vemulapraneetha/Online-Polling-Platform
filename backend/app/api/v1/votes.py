"""
Voting API endpoints.

Routes:
- POST   /{poll_id}/vote    — submit or update a vote
- DELETE /{poll_id}/vote    — withdraw a vote
- GET    /{poll_id}/my-vote — get current user's vote
"""

from fastapi import APIRouter, Depends, status

from app.core.security import get_current_user
from app.schemas.vote import VoteSubmit, VoteResponse, MyVoteResponse
from app.services.vote_service import upsert_vote, withdraw_vote, get_my_vote

router = APIRouter(prefix="/polls", tags=["Votes"])


@router.post(
    "/{poll_id}/vote",
    response_model=VoteResponse,
    status_code=status.HTTP_200_OK,
    summary="Submit or update a vote",
    description=(
        "Vote on an open poll. If a vote already exists for this user, "
        "it will be replaced (upsert). Access requires the poll to be "
        "open and the user to have access (public, creator, or invited)."
    ),
)
async def submit_vote(
    poll_id: str,
    payload: VoteSubmit,
    current_user: dict = Depends(get_current_user),
) -> VoteResponse:
    return await upsert_vote(
        poll_id=poll_id,
        user_id=current_user["_id"],
        selected_options=payload.selected_options,
    )


@router.delete(
    "/{poll_id}/vote",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Withdraw a vote",
    description="Delete the current user's vote on an open poll.",
)
async def delete_vote(
    poll_id: str,
    current_user: dict = Depends(get_current_user),
) -> None:
    await withdraw_vote(poll_id=poll_id, user_id=current_user["_id"])


@router.get(
    "/{poll_id}/my-vote",
    response_model=MyVoteResponse,
    summary="Get my vote",
    description="Returns the current user's vote on a poll, or null if not voted.",
)
async def my_vote(
    poll_id: str,
    current_user: dict = Depends(get_current_user),
) -> MyVoteResponse:
    return await get_my_vote(poll_id=poll_id, user_id=current_user["_id"])
