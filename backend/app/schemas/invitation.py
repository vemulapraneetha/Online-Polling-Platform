"""
Pydantic v2 schemas for invitation operations.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class InviteRequest(BaseModel):
    """Payload for ``POST /api/v1/polls/:id/invitations``."""

    email: EmailStr = Field(
        ...,
        description="Email address of the user to invite.",
    )


class InvitationResponse(BaseModel):
    """Single invitation representation."""

    invitation_id: str
    poll_id: str
    inviter_id: str
    invitee_id: str
    invitee_email: str
    invitee_username: str
    status: str  # "active" or "revoked"
    created_at: datetime
    revoked_at: Optional[datetime] = None


class InvitationListResponse(BaseModel):
    """List of invitations for a poll."""

    invitations: list[InvitationResponse]
    total: int
