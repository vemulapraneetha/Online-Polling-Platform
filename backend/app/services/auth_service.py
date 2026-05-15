"""
Authentication service — business logic for register, login, and user lookup.
"""

from datetime import datetime, timezone

from bson import ObjectId

from app.core.security import hash_password, verify_password, create_access_token
from app.core.config import settings
from app.db.client import get_database
from app.schemas.auth import RegisterRequest, LoginRequest, UserResponse, TokenResponse
from app.utils.exceptions import conflict, unauthorized


async def register_user(payload: RegisterRequest) -> UserResponse:
    """
    Register a new user.

    1. Check uniqueness of email and username.
    2. Hash the password with bcrypt (cost 12).
    3. Insert the user document.
    4. Return a public ``UserResponse`` (no password hash).
    """
    db = get_database()

    # ── Uniqueness checks ────────────────────────────────────────────────
    existing_email = await db.users.find_one({"email": payload.email})
    if existing_email:
        raise conflict("A user with this email already exists")

    existing_username = await db.users.find_one({"username": payload.username})
    if existing_username:
        raise conflict("A user with this username already exists")

    # ── Build document ───────────────────────────────────────────────────
    now = datetime.now(timezone.utc)
    user_doc = {
        "email": payload.email,
        "username": payload.username,
        "hashed_password": hash_password(payload.password),
        "created_at": now,
        "is_active": True,
    }

    result = await db.users.insert_one(user_doc)

    return UserResponse(
        user_id=str(result.inserted_id),
        email=payload.email,
        username=payload.username,
        created_at=now,
        is_active=True,
    )


async def login_user(payload: LoginRequest) -> TokenResponse:
    """
    Authenticate a user and return a JWT.

    1. Look up user by email.
    2. Verify bcrypt hash.
    3. Issue a signed JWT with ``sub = str(user_id)``.
    """
    db = get_database()

    user = await db.users.find_one({"email": payload.email})
    if user is None:
        raise unauthorized("Invalid email or password")

    if not verify_password(payload.password, user["hashed_password"]):
        raise unauthorized("Invalid email or password")

    if not user.get("is_active", True):
        raise unauthorized("User account is deactivated")

    access_token = create_access_token(subject=str(user["_id"]))
    expires_in = settings.JWT_EXPIRE_MINUTES * 60  # seconds

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=expires_in,
    )
