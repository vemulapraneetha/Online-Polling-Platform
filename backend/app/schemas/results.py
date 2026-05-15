"""
Pydantic v2 schemas for poll results.
"""

from pydantic import BaseModel, Field


class OptionResult(BaseModel):
    """Aggregated result for a single poll option."""

    id: str = Field(..., description="Option ID, e.g. opt_1.")
    label: str = Field(..., description="Display text for this option.")
    votes: int = Field(0, description="Number of votes for this option.")
    percentage: float = Field(
        0.0,
        description="Percentage of total respondents who chose this option.",
    )


class ResultsResponse(BaseModel):
    """Full results representation for a poll."""

    poll_id: str
    poll_status: str
    total_respondents: int
    options: list[OptionResult]
    user_has_voted: bool
    results_visible: bool
