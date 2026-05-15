"""
Results API endpoint.

Routes:
- GET /{poll_id}/results — get aggregated poll results
"""

from fastapi import APIRouter, Depends

from app.core.security import get_current_user
from app.schemas.results import ResultsResponse
from app.services.results_service import get_poll_results

router = APIRouter(prefix="/polls", tags=["Results"])


@router.get(
    "/{poll_id}/results",
    response_model=ResultsResponse,
    summary="Get poll results",
    description=(
        "Returns aggregated results for a poll. "
        "Access and results visibility rules are enforced."
    ),
)
async def poll_results(
    poll_id: str,
    current_user: dict = Depends(get_current_user),
) -> ResultsResponse:
    return await get_poll_results(
        poll_id=poll_id,
        user_id=current_user["_id"],
    )
