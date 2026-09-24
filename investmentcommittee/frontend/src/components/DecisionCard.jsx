import styled from "styled-components";
import { Card, Tag } from "../primitives";

const StyledCard = styled(Card)`
  border-left: 3px solid ${({ theme }) => theme.colors.accent};
  margin-bottom: 28px;
`;

const DecisionLabel = styled.div`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-size: 24px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 2px 0 6px;
`;

const Meta = styled.p`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0 0 12px;
`;

const Rationale = styled.p`
  font-size: 14px;
  line-height: 155%;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 8px;
`;

const Contributors = styled.p`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0;
`;

const Pending = styled.p`
  font-family: ${({ theme }) => theme.fonts.sans};
  color: ${({ theme }) => theme.colors.accent};
  margin: 0;
`;

export function DecisionCard({ decision, pending }) {
  if (!decision && !pending) return null;

  return (
    <StyledCard>
      {decision ? (
        <>
          <Tag>Committee decision</Tag>
          <DecisionLabel>{decision.label}</DecisionLabel>
          <Meta>
            Weighted score {decision.weighted_score} · Confidence {Math.round(decision.confidence * 100)}%
          </Meta>
          <Rationale>{decision.rationale}</Rationale>
          <Contributors>Based on: {decision.contributing_agents.join(", ")}</Contributors>
        </>
      ) : (
        <Pending>Synthesizing committee decision…</Pending>
      )}
    </StyledCard>
  );
}
