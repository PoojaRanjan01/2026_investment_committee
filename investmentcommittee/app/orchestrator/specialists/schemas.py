from typing import Literal

from pydantic import BaseModel, Field


class SpecialistVerdict(BaseModel):
    """Structured output every specialist analyst agent must return.

    Shared shape so the Decision Agent (Phase 1) can compute a weighted score
    and the Debate Agent (Phase 2) can detect disagreement across agents.
    """

    agent: Literal["fundamental", "technical", "news", "risk", "valuation", "earnings", "industry", "portfolio"]
    score: int = Field(ge=-100, le=100, description="Bearish (-100) to bullish (+100)")
    confidence: float = Field(ge=0.0, le=1.0)
    rationale: str = Field(description="One to three sentences explaining the score")
    evidence: list[str] = Field(description="Specific figures/facts the rationale is grounded in")


class DecisionVerdict(BaseModel):
    """Final committee decision, synthesized from whichever specialist verdicts
    the orchestrator gathered for the question at hand."""

    label: Literal["BUY", "HOLD", "AVOID"]
    weighted_score: int = Field(ge=-100, le=100)
    confidence: float = Field(ge=0.0, le=1.0)
    rationale: str = Field(description="Synthesis explaining how the contributing verdicts led to this decision")
    contributing_agents: list[str] = Field(description="Which specialists' verdicts fed into this decision")
