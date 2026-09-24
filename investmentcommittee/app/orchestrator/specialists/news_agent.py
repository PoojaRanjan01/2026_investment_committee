import logging

import yfinance as yf
from strands import Agent, tool

from config_context import get_analysis_config
from model.load import load_model
from model_retry import new_resilient_retry_hook
from specialists.schemas import SpecialistVerdict

log = logging.getLogger(__name__)

SYSTEM_PROMPT = """
You are the News Analyst on an AI investment committee. You judge what has
changed recently for a company based ONLY on the headlines and summaries
provided to you.

Some headlines in the feed may be about the broader market or a different
company rather than this specific ticker — ignore those and note in your
rationale if the feed was mostly irrelevant to this company.

Do not use outside knowledge beyond the provided headlines. Every item in
`evidence` must be a specific headline or summary phrase you were given, not
a paraphrase or invented fact.

Score from -100 (strongly negative news) to +100 (strongly positive news).
If there is no relevant recent news, score near 0 with low confidence.
"""


def _fetch_news(ticker: str) -> list[dict]:
    count = get_analysis_config()["newsHeadlineCount"]
    items = yf.Ticker(ticker).news or []
    headlines = []
    for item in items[:count]:
        content = item.get("content", {})
        headlines.append({
            "title": content.get("title"),
            "summary": content.get("summary"),
            "publishedAt": content.get("pubDate"),
        })
    return headlines


@tool
def news_analysis(ticker: str) -> dict:
    """Assess recent news sentiment and what has changed lately for a company.

    Use this when the question is about recent events, sentiment, or "what's
    new" / "why did it move today" — not for long-term fundamentals.

    Args:
        ticker: Stock ticker symbol, e.g. "AAPL".

    Returns:
        A structured verdict: agent, score (-100..100), confidence (0..1),
        rationale, and evidence grounded in the actual headlines retrieved.
    """
    headlines = _fetch_news(ticker)
    analyst = Agent(model=load_model(), system_prompt=SYSTEM_PROMPT, hooks=[new_resilient_retry_hook()])
    verdict = analyst.structured_output(
        SpecialistVerdict,
        prompt=f"Ticker: {ticker}\nRecent headlines:\n{headlines}",
    )
    result = {**verdict.model_dump(), "chartData": {"headlines": headlines}}
    log.info("news_analysis(%s) -> %s", ticker, verdict.model_dump())
    return result
