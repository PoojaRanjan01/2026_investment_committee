import logging

from strands import Agent, tool

from config_context import get_analysis_config
from model.load import load_model
from model_retry import new_resilient_retry_hook
from specialists.schemas import DecisionVerdict

log = logging.getLogger(__name__)

# Default relative importance of each specialist in the final decision —
# overridable per-request via config_context (Settings > Analysis in the
# frontend). Renormalized across whichever specialists actually reported, so
# dynamic routing (e.g. skipping News for a pure fundamentals question)
# doesn't break the math. Phase 2 will add valuation/earnings/industry/
# portfolio and rebalance these.
# risk's score convention is high=safe, same "pushes toward BUY" direction as the others.

RATIONALE_SYSTEM_PROMPT = """
You are the Decision voice of an AI investment committee. You are given the
specialist verdicts that fed into a decision, plus the committee's
already-computed weighted score and label. Write a 2-4 sentence synthesis
explaining how the specialists agreed or disagreed and why that led to this
decision. Reference specific specialist scores. Do not restate the label or
score as your own conclusion — explain the one you were given.
"""


def _weighted_decision(verdicts: list[dict], weights: dict) -> tuple[int, float, list[str]]:
    contributing = [v["agent"] for v in verdicts if v["agent"] in weights]
    if not contributing:
        raise ValueError("No recognized specialist verdicts to synthesize a decision from")

    base_total = sum(weights[a] for a in contributing)
    norm_weight = {a: weights[a] / base_total for a in contributing}

    score_weight_sum = sum(norm_weight[v["agent"]] * v["confidence"] for v in verdicts if v["agent"] in norm_weight)
    weighted_score = sum(
        v["score"] * norm_weight[v["agent"]] * v["confidence"] for v in verdicts if v["agent"] in norm_weight
    ) / score_weight_sum
    confidence = sum(v["confidence"] * norm_weight[v["agent"]] for v in verdicts if v["agent"] in norm_weight)

    return round(weighted_score), round(confidence, 2), contributing


def _label_for(weighted_score: int, buy_threshold: float, avoid_threshold: float) -> str:
    if weighted_score >= buy_threshold:
        return "BUY"
    if weighted_score <= avoid_threshold:
        return "AVOID"
    return "HOLD"


@tool
def decision_synthesis(verdicts: list[dict]) -> dict:
    """Combine specialist verdicts into a final BUY/HOLD/AVOID investment decision.

    Call this AFTER gathering verdicts from the relevant specialist tools for
    a "should I invest" style question. Do not call this for narrower
    questions (e.g. "why did it move today") that don't need a full decision.

    Args:
        verdicts: The specialist verdict dicts already returned by the
            specialist tools you called (fundamental_analysis,
            technical_analysis, news_analysis, risk_analysis, ...).

    Returns:
        The final decision: label (BUY/HOLD/AVOID), weighted_score,
        confidence, rationale, and which agents contributed.
    """
    config = get_analysis_config()
    weighted_score, confidence, contributing = _weighted_decision(verdicts, config["weights"])
    label = _label_for(weighted_score, config["buyThreshold"], config["avoidThreshold"])

    writer = Agent(model=load_model(), system_prompt=RATIONALE_SYSTEM_PROMPT, hooks=[new_resilient_retry_hook()])
    rationale_result = writer(
        f"Verdicts: {verdicts}\nComputed weighted_score: {weighted_score}\nComputed label: {label}"
    )

    decision = DecisionVerdict(
        label=label,
        weighted_score=weighted_score,
        confidence=confidence,
        rationale=str(rationale_result).strip(),
        contributing_agents=contributing,
    )
    log.info("decision_synthesis(%s) -> %s", contributing, decision.model_dump())
    return decision.model_dump()
