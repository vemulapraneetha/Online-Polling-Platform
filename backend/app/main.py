"""
Application factory for the Online Polling Platform backend.

- FastAPI app with async lifespan (MongoDB connect/disconnect)
- APScheduler for auto-closing expired polls
- CORS middleware (permissive for development)
- Health-check endpoint
- All v1 API routes mounted
"""

import asyncio
import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import router as v1_router
from app.core.config import settings
from app.db.client import get_database

# ── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ── APScheduler instance ────────────────────────────────────────────────────
scheduler = AsyncIOScheduler()


async def _auto_close_job() -> None:
    """Wrapper that imports and runs the auto-close logic."""
    from app.services.poll_service import auto_close_expired_polls

    await auto_close_expired_polls()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Async lifespan manager:
    - Connect to MongoDB on startup.
    - Start APScheduler for auto-closing expired polls.
    - Disconnect on shutdown.
    """
    # ── Import and run the original DB lifespan startup ───────────────────
    from app.db.client import lifespan as db_lifespan

    # We use the db lifespan as a nested context manager
    async with db_lifespan(app):
        # ── Start APScheduler ────────────────────────────────────────────
        scheduler.add_job(
            _auto_close_job,
            "interval",
            seconds=60,
            id="auto_close_expired_polls",
            replace_existing=True,
        )
        scheduler.start()
        logger.info("⏰ APScheduler started — auto-close job running every 60s")

        yield

        # ── Shutdown APScheduler ─────────────────────────────────────────
        scheduler.shutdown(wait=False)
        logger.info("⏰ APScheduler shut down")


app = FastAPI(
    title="Online Polling Platform",
    description="Production-style REST API for creating and managing polls.",
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # permissive for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ───────────────────────────────────────────────────────────────────
app.include_router(v1_router)


@app.get(
    "/health",
    tags=["Health"],
    summary="Health check",
    description="Returns API and database connectivity status.",
)
async def health_check() -> dict:
    """Verify the API is running and MongoDB is reachable."""
    try:
        db = get_database()
        await db.command("ping")
        db_status = "connected"
    except Exception:
        db_status = "disconnected"

    return {"status": "ok", "database": db_status}
