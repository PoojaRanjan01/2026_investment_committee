import logging

import yfinance as yf
from strands import Agent, tool

from model.load import load_model
from model_retry import new_resilient_retry_hook
from specialists.schemas import SpecialistVerdict

log = logging.getLogger(__name__)

SYSTEM_PROMPT = """
You are the Risk Analyst on an AI investment committee. You judge what could
invalidate an otherwise-positive investment thesis — volatility, short
interest, ownership concentration, and business-description red flags
(regulatory exposure, geographic concentration, single-customer dependence)
— using ONLY the data provided to you.

Unlike the other analysts, a HIGH score here means LOW risk (safe), and a
LOW score means HIGH risk (dangerous) — score from -100 (very high risk) to
+100 (very low risk).

Do not use outside knowledge about the company. Every item in `evidence`
must be a specific figure or phrase taken from the data you were given.
"""

_INFO_FIELDS = [
    "beta", "shortPercentOfFloat", "shortRatio",
    "heldPercentInsiders", "heldPercentInstitutions",
    "sector", "industry", "fiftyTwoWeekHigh", "fiftyTwoWeekLow", "currentPrice",
]


def _fetch_risk_factors(ticker: str) -> dict:
    info = yf.Ticker(ticker).info
    if not info or not info.get("longName"):
        raise ValueError(f"No risk data found for ticker '{ticker}'")
    data = {field: info.get(field) for field in _INFO_FIELDS}
    data["businessSummary"] = (info.get("longBusinessSummary") or "")[:600]
    return data


def _risk_chart_data(data: dict) -> dict:
    insiders = data.get("heldPercentInsiders") or 0
    institutions = data.get("heldPercentInstitutions") or 0
    return {
        "ownership": {
            "insiders": insiders,
            "institutions": institutions,
            "other": max(0.0, 1 - insiders - institutions),
        },
        "beta": data.get("beta"),
        "shortPercentOfFloat": data.get("shortPercentOfFloat"),
        "fiftyTwoWeekLow": data.get("fiftyTwoWeekLow"),
        "fiftyTwoWeekHigh": data.get("fiftyTwoWeekHigh"),
        "currentPrice": data.get("currentPrice"),
    }


@tool
def risk_analysis(ticker: str) -> dict:
    """Assess what could invalidate an investment thesis — volatility, short
    interest, ownership concentration, and qualitative business risk factors.

    Use this for "should I invest" questions or any question about downside
    risk — not for pure momentum or news-sentiment questions.

    Args:
        ticker: Stock ticker symbol, e.g. "AAPL".

    Returns:
        A structured verdict: agent, score (-100 very risky..+100 very safe),
        confidence (0..1), rationale, and evidence grounded in the given data.
    """
    data = _fetch_risk_factors(ticker)
    analyst = Agent(model=load_model(), system_prompt=SYSTEM_PROMPT, hooks=[new_resilient_retry_hook()])
    verdict = analyst.structured_output(
        SpecialistVerdict,
        prompt=f"Ticker: {ticker}\nRisk data:\n{data}",
    )
    result = {**verdict.model_dump(), "chartData": _risk_chart_data(data)}
    log.info("risk_analysis(%s) -> %s", ticker, verdict.model_dump())
    return result
