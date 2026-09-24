import logging

import pandas as pd
import yfinance as yf
from strands import Agent, tool

from config_context import get_analysis_config
from model.load import load_model
from model_retry import new_resilient_retry_hook
from specialists.schemas import SpecialistVerdict

log = logging.getLogger(__name__)

SYSTEM_PROMPT = """
You are the Technical Analyst on an AI investment committee. You judge what
price and volume momentum indicate — trend direction, moving-average
positioning, and volume confirmation — using ONLY the market data provided to you.

Do not use outside knowledge about the company's business or financials.
Every item in `evidence` must be a specific figure taken from the data you
were given (e.g. "price is 4.2% above its 50-day moving average"), not a paraphrase.

Score from -100 (strongly bearish) to +100 (strongly bullish).
"""


def _fetch_technical(ticker: str) -> dict:
    period = get_analysis_config()["technicalHistoryPeriod"]
    history = yf.Ticker(ticker).history(period=period)
    if history.empty:
        raise ValueError(f"No price history found for ticker '{ticker}'")

    close = history["Close"]
    current_price = close.iloc[-1]
    sma_20_series = close.rolling(window=20).mean()
    sma_20 = sma_20_series.iloc[-1]
    sma_50 = close.tail(50).mean() if len(close) >= 50 else None
    recent_volume = history["Volume"].tail(10).mean()
    prior_volume = history["Volume"].tail(30).head(20).mean() if len(history) >= 30 else None

    chart_points = min(60, len(close))
    series = [
        {
            "date": index.strftime("%Y-%m-%d"),
            "close": round(value, 2),
            "sma20": None if pd.isna(sma_20_series.loc[index]) else round(sma_20_series.loc[index], 2),
        }
        for index, value in close.tail(chart_points).items()
    ]

    return {
        "currentPrice": round(current_price, 2),
        "sma20": round(sma_20, 2),
        "sma50": round(sma_50, 2) if sma_50 is not None else None,
        "priceChange1mo": round((current_price / close.tail(21).iloc[0] - 1) * 100, 2) if len(close) >= 21 else None,
        "priceChange3mo": round((current_price / close.tail(63).iloc[0] - 1) * 100, 2) if len(close) >= 63 else None,
        "recentAvgVolume10d": round(recent_volume, 0),
        "priorAvgVolume20d": round(prior_volume, 0) if prior_volume is not None else None,
        "series": series,
    }


@tool
def technical_analysis(ticker: str) -> dict:
    """Assess price and volume momentum from recent trading data.

    Use this when the question involves price trend, momentum, or "why did
    the stock move" — not for questions purely about business fundamentals.

    Args:
        ticker: Stock ticker symbol, e.g. "AAPL".

    Returns:
        A structured verdict: agent, score (-100..100), confidence (0..1),
        rationale, and evidence grounded in the underlying price/volume data.
    """
    data = _fetch_technical(ticker)
    series = data.pop("series")  # the analyst reasons from summary stats, not the raw series
    analyst = Agent(model=load_model(), system_prompt=SYSTEM_PROMPT, hooks=[new_resilient_retry_hook()])
    verdict = analyst.structured_output(
        SpecialistVerdict,
        prompt=f"Ticker: {ticker}\nMarket data:\n{data}",
    )
    result = {**verdict.model_dump(), "chartData": {"series": series}}
    log.info("technical_analysis(%s) -> %s", ticker, verdict.model_dump())
    return result
