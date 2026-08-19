import yfinance as yf
from strands import Agent, tool

from model.load import load_model
from specialists.schemas import SpecialistVerdict

SYSTEM_PROMPT = """
You are the Fundamental Analyst on an AI investment committee. You judge whether a
business is fundamentally healthy — revenue growth, margins, profitability, cash
generation, and balance-sheet strength — using ONLY the financial data provided to you.

Do not use outside knowledge about the company. Do not speculate about price
or news. Every item in `evidence` must be a specific figure taken from the data
you were given (e.g. "revenue growth 16.4%"), not a paraphrase.

Score from -100 (fundamentally weak) to +100 (fundamentally strong).
"""

_FIELDS = [
    "longName", "sector", "totalRevenue", "revenueGrowth", "earningsGrowth",
    "grossMargins", "profitMargins", "returnOnEquity", "debtToEquity",
    "currentRatio", "operatingCashflow", "freeCashflow", "marketCap",
]


def _fetch_fundamentals(ticker: str) -> dict:
    info = yf.Ticker(ticker).info
    if not info or not info.get("longName"):
        raise ValueError(f"No fundamental data found for ticker '{ticker}'")
    return {field: info.get(field) for field in _FIELDS}


@tool
def fundamental_analysis(ticker: str) -> dict:
    """Assess a company's fundamental financial health from its financial statements.

    Use this when the question is about business quality, financial health, or
    whether a company is a good long-term investment on the fundamentals.

    Args:
        ticker: Stock ticker symbol, e.g. "AAPL".

    Returns:
        A structured verdict: agent, score (-100..100), confidence (0..1),
        rationale, and evidence grounded in the underlying financial data.
    """
    data = _fetch_fundamentals(ticker)
    analyst = Agent(model=load_model(), system_prompt=SYSTEM_PROMPT)
    verdict = analyst.structured_output(
        SpecialistVerdict,
        prompt=f"Ticker: {ticker}\nFinancial data:\n{data}",
    )
    return verdict.model_dump()
