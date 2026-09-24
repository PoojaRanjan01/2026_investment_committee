import { useState, useMemo, useEffect } from "react";
import { lightTheme, darkTheme } from "./theme";

const STORAGE_KEY = "undervalued:theme-mode";

function loadStoredMode() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw === "light" || raw === "dark" || raw === "system" ? raw : "system";
}

export function useUndervaluedTheme() {
  const [mode, setModeState] = useState(loadStoredMode); // 'system' | 'light' | 'dark'
  const [prefersDark, setPrefersDark] = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e) => setPrefersDark(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  function setMode(next) {
    setModeState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }

  const resolved = mode === "system" ? (prefersDark ? "dark" : "light") : mode;
  const theme = useMemo(() => (resolved === "dark" ? darkTheme : lightTheme), [resolved]);
  return { theme, mode, setMode, resolved };
}
