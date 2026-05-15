"""
Pydantic v2 schemas for vote operations.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class VoteSubmit(BaseModel):
    """Payload for ``POST /api/v1/polls/:id/vote``."""

    selected_options: list[str] = Field(
        ...,
        min_length=1,
        description="List of option IDs the user is voting for.",
    )


class VoteResponse(BaseModel):
    """Returned after a successful vote upsert."""

    vote_id: str
    poll_id: str
    user_id: str
    selected_options: list[str]
    voted_at: datetime
    updated_at: datetime


class MyVoteResponse(BaseModel):
    """Returned by ``GET /api/v1/polls/:id/my-vote``."""

    vote_id: Optional[str] = None
    poll_id: Optional[str] = None
    user_id: Optional[str] = None
    selected_options: Optional[list[str]] = None
    voted_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    has_voted: bool = False
