import { useEffect, useState } from "react";

const STORAGE_PREFIX = "watchlist:";

const DEFAULTS = {
  us: ["AAPL", "MSFT", "NVDA"],
  india: ["RELIANCE.NS", "TCS.NS", "INFY.NS"],
};

function loadLocalList(market) {
  const raw = localStorage.getItem(STORAGE_PREFIX + market);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // fall through to defaults on corrupt storage
    }
  }
  return DEFAULTS[market] ?? [];
}

function saveLocalList(market, tickers) {
  localStorage.setItem(STORAGE_PREFIX + market, JSON.stringify(tickers));
}

/** Per-market watchlist, backed by localStorage.
 * Give the caller a fresh instance per market (e.g. via `key={market}` on
 * the consuming component) rather than switching `market` on one instance. */
export function useWatchlist(market) {
  const [tickers, setTickers] = useState(() => loadLocalList(market));

  useEffect(() => {
    setTickers(loadLocalList(market));
  }, [market]);

  useEffect(() => {
    saveLocalList(market, tickers);
  }, [market, tickers]);

  function addTicker(raw) {
    const ticker = raw.trim().toUpperCase();
    if (!ticker) return;
    setTickers((prev) => (prev.includes(ticker) ? prev : [...prev, ticker]));
  }

  function removeTicker(ticker) {
    setTickers((prev) => prev.filter((t) => t !== ticker));
  }

  return { tickers, addTicker, removeTicker, loading: false };
}
