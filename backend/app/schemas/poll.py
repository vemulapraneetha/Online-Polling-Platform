"""
Pydantic v2 schemas for poll CRUD operations.
"""

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


# ── Enums ────────────────────────────────────────────────────────────────────

class PollType(str, Enum):
    SINGLE_CHOICE = "single_choice"
    MULTI_CHOICE = "multi_choice"


class PollStatus(str, Enum):
    DRAFT = "draft"
    OPEN = "open"
    CLOSED = "closed"


class PollVisibility(str, Enum):
    PUBLIC = "public"
    PRIVATE = "private"


class ResultsVisibility(str, Enum):
    ALWAYS = "always"
    AFTER_VOTING = "after_voting"
    CREATOR_ONLY = "creator_only"


# ── Sub-models ───────────────────────────────────────────────────────────────

class PollOption(BaseModel):
    """A single poll option with an auto-generated ID and label."""

    id: str = Field(
        ...,
        description="Auto-generated option ID, e.g. opt_1, opt_2.",
    )
    label: str = Field(
        ...,
        min_length=1,
        max_length=200,
        description="Display text for this option.",
    )


class PollOptionCreate(BaseModel):
    """Input for creating a poll option — only the label is required."""

    label: str = Field(
        ...,
        min_length=1,
        max_length=200,
        description="Display text for this option.",
    )


# ── Requests ─────────────────────────────────────────────────────────────────

class PollCreate(BaseModel):
    """Payload for ``POST /api/v1/polls``."""

    title: str = Field(..., min_length=1, max_length=300)
    description: Optional[str] = Field(None, max_length=2000)
    poll_type: PollType = PollType.SINGLE_CHOICE
    visibility: PollVisibility = PollVisibility.PUBLIC
    options: list[PollOptionCreate] = Field(
        ...,
        min_length=2,
        max_length=10,
        description="Between 2 and 10 options.",
    )
    results_visibility: ResultsVisibility = ResultsVisibility.ALWAYS
    expires_at: Optional[datetime] = None


class PollUpdate(BaseModel):
    """
    Payload for ``PATCH /api/v1/polls/:id``.

    All fields optional — only supplied fields are updated.
    """

    title: Optional[str] = Field(None, min_length=1, max_length=300)
    description: Optional[str] = Field(None, max_length=2000)
    poll_type: Optional[PollType] = None
    visibility: Optional[PollVisibility] = None
    options: Optional[list[PollOptionCreate]] = Field(
        None,
        min_length=2,
        max_length=10,
    )
    results_visibility: Optional[ResultsVisibility] = None
    expires_at: Optional[datetime] = None


# ── Responses ────────────────────────────────────────────────────────────────

class PollResponse(BaseModel):
    """Full poll representation returned by the API."""

    id: str = Field(..., alias="_id")
    creator_id: str
    title: str
    description: Optional[str] = None
    poll_type: PollType
    status: PollStatus
    visibility: PollVisibility
    options: list[PollOption]
    results_visibility: ResultsVisibility
    expires_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime] = None
    closed_at: Optional[datetime] = None

    model_config = {"populate_by_name": True}


class PollListResponse(BaseModel):
    """Paginated list of polls."""

    polls: list[PollResponse]
    total: int
    page: int
    limit: int
    pages: int
