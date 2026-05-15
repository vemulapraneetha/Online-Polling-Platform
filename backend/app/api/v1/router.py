"""
Aggregated v1 API router.

Includes all sub-routers (auth, polls, invitations, votes, results)
under the ``/api/v1`` prefix.
"""

from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.polls import router as polls_router
from app.api.v1.invitations import router as invitations_router
from app.api.v1.votes import router as votes_router
from app.api.v1.results import router as results_router

router = APIRouter(prefix="/api/v1")

router.include_router(auth_router)
router.include_router(polls_router)
# Invitations must come before votes/results so /shared doesn't
# conflict with /{poll_id} routes
router.include_router(invitations_router)
router.include_router(votes_router)
router.include_router(results_router)
