"""
Invitation API endpoints.

Routes:
- POST   /{poll_id}/invitations              — invite a user
- DELETE /{poll_id}/invitations/{invitee_id}  — revoke an invitation
- GET    /{poll_id}/invitations               — list all invitations
- GET    /shared                              — polls shared with me
"""

from fastapi import APIRouter, Depends, Query

from app.core.security import get_current_user
from app.schemas.invitation import (
    InviteRequest,
    InvitationResponse,
    InvitationListResponse,
)
from app.schemas.poll import PollListResponse
from app.services.invitation_service import (
    create_invitation,
    revoke_invitation,
    list_invitations,
    get_shared_polls,
)

router = APIRouter(prefix="/polls", tags=["Invitations"])


@router.post(
    "/{poll_id}/invitations",
    response_model=InvitationResponse,
    summary="Invite a user to a poll",
    description=(
        "Send an invitation to a user by email. "
        "Only the poll creator can send invitations."
    ),
)
async def invite_user(
    poll_id: str,
    payload: InviteRequest,
    current_user: dict = Depends(get_current_user),
) -> InvitationResponse:
    return await create_invitation(
        poll_id=poll_id,
        inviter_id=current_user["_id"],
        email=payload.email,
    )


@router.delete(
    "/{poll_id}/invitations/{invitee_id}",
    response_model=InvitationResponse,
    summary="Revoke an invitation",
    description=(
        "Revoke an active invitation. Sets status to 'revoked'. "
        "Does NOT delete existing votes. Creator only."
    ),
)
async def revoke_invite(
    poll_id: str,
    invitee_id: str,
    current_user: dict = Depends(get_current_user),
) -> InvitationResponse:
    return await revoke_invitation(
        poll_id=poll_id,
        invitee_id=invitee_id,
        user_id=current_user["_id"],
    )


@router.get(
    "/{poll_id}/invitations",
    response_model=InvitationListResponse,
    summary="List invitations",
    description="List all invitations (active + revoked) for a poll. Creator only.",
)
async def list_poll_invitations(
    poll_id: str,
    current_user: dict = Depends(get_current_user),
) -> InvitationListResponse:
    return await list_invitations(
        poll_id=poll_id,
        user_id=current_user["_id"],
    )


@router.get(
    "/shared",
    response_model=PollListResponse,
    summary="Polls shared with me",
    description="Returns polls where the current user has an active invitation.",
)
async def shared_polls(
    current_user: dict = Depends(get_current_user),
    page: int = Query(1, ge=1, description="Page number."),
    limit: int = Query(20, ge=1, le=100, description="Items per page."),
) -> PollListResponse:
    return await get_shared_polls(
        user_id=current_user["_id"],
        page=page,
        limit=limit,
    )
