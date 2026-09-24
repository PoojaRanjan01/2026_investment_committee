import { useEffect, useState } from "react";
import styled from "styled-components";
import { streamAnalysis } from "../api";
import { useAnalysisSettings } from "../hooks/useAnalysisSettings";
import { CompanyOverview } from "./CompanyOverview";
import { Tag } from "../primitives";

const Wrap = styled.div`
  border-top: 1px dashed ${({ theme }) => theme.colors.border};
  margin-top: 10px;
  padding-top: 14px;
`;

const DecisionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
`;

const DecisionScore = styled.span`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-weight: 600;
  font-size: 15px;
  color: ${({ theme }) => theme.colors.accent};
`;

const Muted = styled.span`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const StatusLine = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-style: italic;
  margin: 0;
`;

function scoreArrow(score) {
  if (score > 15) return "▲";
  if (score < -15) return "▼";
  return "–";
}

const TOOL_TO_KEY = {
  technical_analysis: "technical",
  fundamental_analysis: "fundamental",
  risk_analysis: "risk",
};

export function WatchlistCompanyDetail({ ticker }) {
  const { settings } = useAnalysisSettings();
  const [status, setStatus] = useState("loading");
  const [data, setData] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");
    setData({});
    setError(null);

    streamAnalysis(`Should I invest in ${ticker}?`, {
      config: settings,
      signal: controller.signal,
      onEvent(evt) {
        if (evt.error) {
          setError(evt.error);
          return;
        }
        if (evt.specialistResult) {
          const { tool, output } = evt.specialistResult;
          if (tool === "decision_synthesis") {
            setData((prev) => ({ ...prev, decision: output }));
            return;
          }
          const key = TOOL_TO_KEY[tool];
          if (key) setData((prev) => ({ ...prev, [key]: output }));
        }
      },
    })
      .then(() => setStatus("done"))
      .catch((e) => {
        if (controller.signal.aborted) return;
        setError(e.message || String(e));
        setStatus("error");
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticker]);

  const { technical, fundamental, risk, decision } = data;

  return (
    <Wrap>
      <CompanyOverview technical={technical} fundamental={fundamental} risk={risk} variant="inline" />

      {decision && (
        <DecisionRow>
          <Tag>{decision.label}</Tag>
          <DecisionScore>
            {scoreArrow(decision.weighted_score)} {decision.weighted_score}
          </DecisionScore>
          <Muted>Confidence {Math.round(decision.confidence * 100)}%</Muted>
        </DecisionRow>
      )}

      {status === "loading" && <StatusLine>Loading trends & fundamentals…</StatusLine>}
      {status === "error" && <StatusLine>Couldn't load details: {error}</StatusLine>}
    </Wrap>
  );
}
