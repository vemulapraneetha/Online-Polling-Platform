"""
Results service — aggregation pipeline for poll results.
"""

from bson import ObjectId

from app.db.client import get_database
from app.schemas.results import ResultsResponse, OptionResult
from app.services.vote_service import can_access_poll
from app.utils.exceptions import not_found, forbidden


async def get_poll_results(poll_id: str, user_id: str) -> ResultsResponse:
    """
    Compute and return aggregated poll results.

    Access rules same as viewing a poll.

    Results visibility enforcement:
    - "always" → return results to anyone with access.
    - "after_voting" → only if user has voted (or is creator).
    - "creator_only" → only creator (unless poll is closed, then always).
    """
    db = get_database()

    try:
        poll_oid = ObjectId(poll_id)
    except Exception:
        raise not_found("Poll")

    poll = await db.polls.find_one({"_id": poll_oid})
    if poll is None:
        raise not_found("Poll")

    # Access check
    has_access = await can_access_poll(poll, user_id)
    if not has_access:
        raise forbidden("You do not have access to this poll")

    is_creator = str(poll["creator_id"]) == user_id
    poll_status = poll.get("status", "draft")
    results_visibility = poll.get("results_visibility", "always")

    # Check if user has voted
    user_oid = ObjectId(user_id)
    user_vote = await db.votes.find_one({
        "poll_id": poll_oid,
        "user_id": user_oid,
    })
    user_has_voted = user_vote is not None

    # Determine if results should be visible
    results_visible = False

    if results_visibility == "always":
        results_visible = True
    elif results_visibility == "after_voting":
        results_visible = user_has_voted or is_creator
    elif results_visibility == "creator_only":
        if is_creator:
            results_visible = True
        elif poll_status == "closed":
            results_visible = True
        else:
            results_visible = False

    # Build option map from poll
    option_map = {}
    for opt in poll.get("options", []):
        option_map[opt["id"]] = {
            "id": opt["id"],
            "label": opt["label"],
            "votes": 0,
            "percentage": 0.0,
        }

    if results_visible:
        # Aggregation pipeline on votes collection
        pipeline = [
            {"$match": {"poll_id": poll_oid}},
            {"$unwind": "$selected_options"},
            {
                "$group": {
                    "_id": "$selected_options",
                    "count": {"$sum": 1},
                }
            },
        ]

        cursor = db.votes.aggregate(pipeline)
        agg_results = await cursor.to_list(length=100)

        # Count total unique voters
        total_pipeline = [
            {"$match": {"poll_id": poll_oid}},
            {
                "$group": {
                    "_id": None,
                    "total": {"$sum": 1},
                }
            },
        ]
        total_cursor = db.votes.aggregate(total_pipeline)
        total_results = await total_cursor.to_list(length=1)
        total_respondents = total_results[0]["total"] if total_results else 0

        # Merge aggregation results with poll options
        for agg in agg_results:
            option_id = agg["_id"]
            if option_id in option_map:
                option_map[option_id]["votes"] = agg["count"]
                if total_respondents > 0:
                    option_map[option_id]["percentage"] = round(
                        (agg["count"] / total_respondents) * 100, 1
                    )
    else:
        total_respondents = 0

    options = [OptionResult(**data) for data in option_map.values()]

    return ResultsResponse(
        poll_id=str(poll_oid),
        poll_status=poll_status,
        total_respondents=total_respondents,
        options=options,
        user_has_voted=user_has_voted,
        results_visible=results_visible,
    )
