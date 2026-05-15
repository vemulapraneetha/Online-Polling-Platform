"""
Application factory for the Online Polling Platform backend.

- FastAPI app with async lifespan (MongoDB connect/disconnect)
- CORS middleware (permissive for development)
- Health-check endpoint
- All v1 API routes mounted
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import router as v1_router
from app.core.config import settings
from app.db.client import get_database, lifespan

app = FastAPI(
    title="Online Polling Platform",
    description="Production-style REST API for creating and managing polls.",
    version="1.0.0",
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
