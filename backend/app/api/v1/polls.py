"""
Poll CRUD + Lifecycle API endpoints.

Routes:
- POST   /             — create a new poll (draft)
- GET    /my           — list current user's polls (paginated)
- GET    /feed         — public poll feed (paginated, filterable)
- GET    /{poll_id}    — get a single poll
- PATCH  /{poll_id}    — update a draft poll
- DELETE /{poll_id}    — delete a draft poll
- POST   /{poll_id}/publish — publish a draft poll (draft → open)
- POST   /{poll_id}/close   — close an open poll (open → closed)
"""

from typing import Optional

from fastapi import APIRouter, Depends, Query, status

from app.core.security import get_current_user
from app.schemas.poll import (
    PollCreate,
    PollListResponse,
    PollResponse,
    PollUpdate,
)
from app.services.poll_service import (
    create_poll,
    delete_poll,
    get_my_polls,
    get_poll_by_id,
    update_poll,
    publish_poll,
    close_poll,
    get_public_feed,
    get_templates,
    duplicate_poll,
)

router = APIRouter(prefix="/polls", tags=["Polls"])


@router.post(
    "",
    response_model=PollResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new poll",
    description="Create a poll in draft status. Requires authentication.",
)
async def create(
    payload: PollCreate,
    current_user: dict = Depends(get_current_user),
) -> PollResponse:
    return await create_poll(payload, creator_id=current_user["_id"])


@router.get(
    "/my",
    response_model=PollListResponse,
    summary="List my polls",
    description="Paginated list of polls created by the current user.",
)
async def list_my_polls(
    current_user: dict = Depends(get_current_user),
    status_filter: Optional[str] = Query(
        None,
        alias="status",
        description="Filter by poll status: draft, open, closed.",
    ),
    page: int = Query(1, ge=1, description="Page number."),
    limit: int = Query(20, ge=1, le=100, description="Items per page."),
) -> PollListResponse:
    return await get_my_polls(
        user_id=current_user["_id"],
        status_filter=status_filter,
        page=page,
        limit=limit,
    )


@router.get(
    "/feed",
    response_model=PollListResponse,
    summary="Public poll feed",
    description=(
        "Paginated list of public, open polls. "
        "Supports filtering by poll_type and sorting."
    ),
)
async def public_feed(
    current_user: dict = Depends(get_current_user),
    poll_type: str = Query("all", description="Filter: single_choice, multi_choice, all."),
    sort_by: str = Query("created_at", description="Sort field: created_at or expires_at."),
    sort_order: str = Query("desc", description="Sort order: asc or desc."),
    page: int = Query(1, ge=1, description="Page number."),
    limit: int = Query(20, ge=1, le=50, description="Items per page (max 50)."),
) -> PollListResponse:
    return await get_public_feed(
        poll_type=poll_type,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        limit=limit,
    )


@router.get(
    "/templates",
    response_model=dict,
    summary="List poll templates",
    description="Get current user's previous open/closed polls to use as templates.",
)
async def templates(
    current_user: dict = Depends(get_current_user),
    page: int = Query(1, ge=1, description="Page number."),
    limit: int = Query(20, ge=1, le=100, description="Items per page."),
) -> dict:
    return await get_templates(
        user_id=current_user["_id"],
        page=page,
        limit=limit,
    )


@router.get(
    "/{poll_id}",
    response_model=PollResponse,
    summary="Get a poll",
    description="Retrieve a poll by ID. Access control enforced.",
)
async def get_poll(
    poll_id: str,
    current_user: dict = Depends(get_current_user),
) -> PollResponse:
    return await get_poll_by_id(poll_id, user_id=current_user["_id"])


@router.patch(
    "/{poll_id}",
    response_model=PollResponse,
    summary="Update a draft poll",
    description="Update a poll. Only allowed in draft status by the creator.",
)
async def update(
    poll_id: str,
    payload: PollUpdate,
    current_user: dict = Depends(get_current_user),
) -> PollResponse:
    return await update_poll(poll_id, payload, user_id=current_user["_id"])


@router.delete(
    "/{poll_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a draft poll",
    description="Hard-delete a poll. Only allowed in draft status by the creator.",
)
async def delete(
    poll_id: str,
    current_user: dict = Depends(get_current_user),
) -> None:
    await delete_poll(poll_id, user_id=current_user["_id"])


@router.post(
    "/{poll_id}/publish",
    response_model=PollResponse,
    summary="Publish a poll",
    description=(
        "Transition a poll from draft → open. "
        "After publishing, title, options, poll_type, and visibility become immutable."
    ),
)
async def publish(
    poll_id: str,
    current_user: dict = Depends(get_current_user),
) -> PollResponse:
    return await publish_poll(poll_id, user_id=current_user["_id"])


@router.post(
    "/{poll_id}/close",
    response_model=PollResponse,
    summary="Close a poll",
    description="Transition a poll from open → closed. Creator only.",
)
async def close(
    poll_id: str,
    current_user: dict = Depends(get_current_user),
) -> PollResponse:
    return await close_poll(poll_id, user_id=current_user["_id"])


@router.post(
    "/{poll_id}/duplicate",
    response_model=PollResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Duplicate a poll",
    description="Create a new draft poll using an existing poll as a template. Creator only.",
)
async def duplicate(
    poll_id: str,
    current_user: dict = Depends(get_current_user),
) -> PollResponse:
    return await duplicate_poll(poll_id, user_id=current_user["_id"])
