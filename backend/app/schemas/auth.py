"""
Pydantic v2 schemas for authentication: register, login, token responses.
"""

from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


# ── Requests ─────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    """Payload for ``POST /api/v1/auth/register``."""

    email: EmailStr
    username: str = Field(
        ...,
        min_length=3,
        max_length=50,
        pattern=r"^[a-zA-Z0-9_-]+$",
        description="Alphanumeric, underscores, hyphens. 3-50 chars.",
    )
    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
        description="Minimum 8 characters.",
    )


class LoginRequest(BaseModel):
    """Payload for ``POST /api/v1/auth/login``."""

    email: EmailStr
    password: str


# ── Responses ────────────────────────────────────────────────────────────────

class UserResponse(BaseModel):
    """Public user representation — never includes ``hashed_password``."""

    user_id: str
    email: str
    username: str
    created_at: datetime
    is_active: bool = True


class TokenResponse(BaseModel):
    """JWT token returned after successful login."""

    access_token: str
    token_type: str = "bearer"
    expires_in: int = Field(
        ...,
        description="Token lifetime in seconds.",
    )


class MeResponse(BaseModel):
    """Response for ``GET /api/v1/auth/me``."""

    user_id: str
    email: str
    username: str
    created_at: datetime
    is_active: bool = True
