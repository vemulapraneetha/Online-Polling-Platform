"""
Authentication API endpoints.

Routes:
- POST /register   — create a new user
- POST /login      — authenticate and receive a JWT
- GET  /me         — retrieve the current user's profile
"""

from fastapi import APIRouter, Depends, status

from app.core.security import get_current_user
from app.schemas.auth import (
    LoginRequest,
    MeResponse,
    RegisterRequest,
    TokenResponse,
    UserResponse,
)
from app.services.auth_service import login_user, register_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description="Create a new account with email, username, and password.",
)
async def register(payload: RegisterRequest) -> UserResponse:
    return await register_user(payload)


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Log in",
    description="Authenticate with email and password to receive a JWT.",
)
async def login(payload: LoginRequest) -> TokenResponse:
    return await login_user(payload)


@router.get(
    "/me",
    response_model=MeResponse,
    summary="Current user profile",
    description="Returns the authenticated user's profile information.",
)
async def me(current_user: dict = Depends(get_current_user)) -> MeResponse:
    return MeResponse(
        user_id=current_user["_id"],
        email=current_user["email"],
        username=current_user["username"],
        created_at=current_user["created_at"],
        is_active=current_user.get("is_active", True),
    )
