"""
Motor async MongoDB client with FastAPI lifespan management.

Usage in main.py::

    from app.db.client import lifespan

    app = FastAPI(lifespan=lifespan)

Anywhere else::

    from app.db.client import get_database
    db = get_database()
    users = await db.users.find_one({"email": "..."})
"""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.core.config import settings

# Module-level references — populated during lifespan startup.
_client: AsyncIOMotorClient | None = None
_database: AsyncIOMotorDatabase | None = None


def get_database() -> AsyncIOMotorDatabase:
    """Return the active database handle. Raises if called before startup."""
    if _database is None:
        raise RuntimeError("Database not initialised — is the app running?")
    return _database


async def _create_indexes(db: AsyncIOMotorDatabase) -> None:
    """
    Ensure all required indexes exist.

    Motor's ``create_index`` is idempotent — safe to call on every startup.
    """
    from pymongo import ASCENDING, DESCENDING, IndexModel

    # ── users ────────────────────────────────────────────────────────────
    await db.users.create_indexes(
        [
            IndexModel([("email", ASCENDING)], unique=True),
            IndexModel([("username", ASCENDING)], unique=True),
        ]
    )

    # ── polls ────────────────────────────────────────────────────────────
    await db.polls.create_indexes(
        [
            IndexModel([("creator_id", ASCENDING)]),
            IndexModel([("status", ASCENDING), ("visibility", ASCENDING)]),
            IndexModel([("created_at", DESCENDING)]),
        ]
    )

    # ── votes ────────────────────────────────────────────────────────────
    await db.votes.create_indexes(
        [
            IndexModel(
                [("poll_id", ASCENDING), ("user_id", ASCENDING)],
                unique=True,
            ),
            IndexModel([("poll_id", ASCENDING)]),
        ]
    )

    # ── invitations ──────────────────────────────────────────────────────
    await db.invitations.create_indexes(
        [
            IndexModel(
                [("poll_id", ASCENDING), ("invitee_id", ASCENDING)],
                unique=True,
            ),
            IndexModel([("invitee_id", ASCENDING), ("status", ASCENDING)]),
        ]
    )


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Async lifespan manager: connect to MongoDB on startup, disconnect on
    shutdown.
    """
    global _client, _database

    # ── Startup ──────────────────────────────────────────────────────────
    _client = AsyncIOMotorClient(settings.MONGODB_URL)
    _database = _client[settings.DATABASE_NAME]

    # Verify connectivity
    await _client.admin.command("ping")
    print(f"✅ Connected to MongoDB → {settings.DATABASE_NAME}")

    # Create indexes (idempotent)
    await _create_indexes(_database)
    print("✅ Database indexes ensured")

    yield

    # ── Shutdown ─────────────────────────────────────────────────────────
    if _client is not None:
        _client.close()
        print("🔌 MongoDB connection closed")
