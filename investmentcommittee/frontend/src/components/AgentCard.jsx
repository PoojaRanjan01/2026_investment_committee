import styled from "styled-components";
import { Card } from "../primitives";
import { Pill } from "../appPrimitives";
import { NewsHeadlines } from "./NewsHeadlines";
import { RiskShowcase } from "./RiskShowcase";

const StyledCard = styled(Card)`
  opacity: ${(p) => (p.$idle ? 0.55 : 1)};
  transition: opacity 0.2s ease;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
`;

const Title = styled.span`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-weight: 600;
  font-size: 15px;
  color: ${({ theme }) => theme.colors.text};
`;

const ScoreBadge = styled.span`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.accent};
  white-space: nowrap;
`;

const Confidence = styled.p`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 11.5px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0 0 12px;
`;

const Rationale = styled.p`
  font-size: 14px;
  line-height: 155%;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 10px;
`;

const Evidence = styled.ul`
  margin: 0;
  padding-left: 16px;
  font-size: 12.5px;
  color: ${({ theme }) => theme.colors.textMuted};

  li {
    margin-bottom: 4px;
  }
`;

const Placeholder = styled.p`
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

// Technical's chart and Fundamental's metrics grid are shown once, up front,
// by CompanyOverview (above the Committee Summary) — these cards stay to
// their written insight (rationale + evidence) for those two. News and Risk
// have no top-level equivalent, so their showcases stay here.
function Showcase({ agentKey, chartData }) {
  if (!chartData) return null;
  switch (agentKey) {
    case "news":
      return <NewsHeadlines headlines={chartData.headlines} />;
    case "risk":
      return <RiskShowcase chartData={chartData} />;
    default:
      return null;
  }
}

export function AgentCard({ agentKey, label, status, data }) {
  return (
    <StyledCard $idle={status === "idle"}>
      <Header>
        <Title>{label}</Title>
        {status === "idle" && <Pill>Not called</Pill>}
        {status === "pending" && <Pill>Running…</Pill>}
        {data && (
          <ScoreBadge>
            {scoreArrow(data.score)} {data.score > 0 ? "+" : ""}
            {data.score}
          </ScoreBadge>
        )}
      </Header>

      {data ? (
        <>
          <Confidence>Confidence {Math.round(data.confidence * 100)}%</Confidence>
          <Showcase agentKey={agentKey} chartData={data.chartData} />
          <Rationale>{data.rationale}</Rationale>
          <Evidence>
            {data.evidence.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </Evidence>
        </>
      ) : (
        <Placeholder>{status === "pending" ? "Analyzing…" : "Not needed for this question."}</Placeholder>
      )}
    </StyledCard>
  );
}
