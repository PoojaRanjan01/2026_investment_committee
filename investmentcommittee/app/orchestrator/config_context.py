"""Request-scoped analysis configuration.

Set once per /invocations call (main.py) from the request payload's optional
`config` object, then read by specialist/decision tools further down the same
call. Uses a ContextVar rather than a module-level global so concurrent
requests on this server never see each other's settings — Strands dispatches
our sync tool functions via `asyncio.to_thread`, which explicitly propagates
the current contextvars.Context into the worker thread, so this works
correctly across the tool-call boundary, not just within the entrypoint itself.
"""

from contextvars import ContextVar

DEFAULT_CONFIG = {
    "weights": {"fundamental": 0.35, "technical": 0.25, "news": 0.15, "risk": 0.25},
    "buyThreshold": 25,
    "avoidThreshold": -25,
    "newsHeadlineCount": 10,
    "technicalHistoryPeriod": "6mo",
}

_config_var: ContextVar[dict] = ContextVar("analysis_config", default=DEFAULT_CONFIG)


def get_analysis_config() -> dict:
    return _config_var.get()


def set_analysis_config(overrides: dict | None) -> None:
    merged = {**DEFAULT_CONFIG, **(overrides or {})}
    merged["weights"] = {**DEFAULT_CONFIG["weights"], **(overrides or {}).get("weights", {})}
    _config_var.set(merged)
