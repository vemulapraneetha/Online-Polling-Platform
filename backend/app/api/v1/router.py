"""
Aggregated v1 API router.

Includes all sub-routers (auth, polls) under the ``/api/v1`` prefix.
"""

from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.polls import router as polls_router

router = APIRouter(prefix="/api/v1")

router.include_router(auth_router)
router.include_router(polls_router)
