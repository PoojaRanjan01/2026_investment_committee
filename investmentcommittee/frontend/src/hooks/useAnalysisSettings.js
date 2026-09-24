import { useEffect, useState } from "react";

const STORAGE_KEY = "settings:analysis";

// Mirrors config_context.DEFAULT_CONFIG on the backend — this is what the
// server falls back to if the frontend sends nothing, so keep the two in sync.
export const DEFAULT_ANALYSIS_SETTINGS = {
  weights: { fundamental: 0.35, technical: 0.25, news: 0.15, risk: 0.25 },
  buyThreshold: 25,
  avoidThreshold: -25,
  newsHeadlineCount: 10,
  technicalHistoryPeriod: "6mo",
};

function load() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_ANALYSIS_SETTINGS, ...parsed, weights: { ...DEFAULT_ANALYSIS_SETTINGS.weights, ...parsed.weights } };
    } catch {
      // fall through to defaults on corrupt storage
    }
  }
  return DEFAULT_ANALYSIS_SETTINGS;
}

export function useAnalysisSettings() {
  const [settings, setSettings] = useState(load);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  function updateWeight(agent, value) {
    setSettings((prev) => ({ ...prev, weights: { ...prev.weights, [agent]: value } }));
  }

  function update(field, value) {
    setSettings((prev) => ({ ...prev, [field]: value }));
  }

  function reset() {
    setSettings(DEFAULT_ANALYSIS_SETTINGS);
  }

  return { settings, updateWeight, update, reset };
}
