import styled from "styled-components";
import { Card, Eyebrow } from "../primitives";
import { parseNarrative } from "../formatters";

const Wrap = styled(Card)`
  margin-bottom: 20px;
`;

const Verdict = styled.p`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  line-height: 145%;
  margin: 6px 0 12px;
`;

const Bullets = styled.ul`
  margin: 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Bullet = styled.li`
  font-size: 14px;
  line-height: 150%;
  color: ${({ theme }) => theme.colors.text};

  &::marker {
    color: ${({ theme }) => theme.colors.accent};
  }
`;

const Paragraph = styled.p`
  font-size: 14px;
  line-height: 155%;
  color: ${({ theme }) => theme.colors.text};
  margin: 8px 0 0;
`;

export function OrchestratorSummary({ narrative, decision }) {
  const parsed = parseNarrative(narrative);
  if (!parsed && !decision) return null;
  const { verdict, bullets = [], paragraphs = [] } = parsed || {};

  // Prefer the actual decision_synthesis result over the model's own
  // freeform first line — they can disagree if the model wrote a verdict
  // without calling the tool (see main.py's deterministic fallback for that
  // case), and the computed weighted score is the trustworthy one.
  const headline = decision
    ? `${decision.label} — weighted score ${decision.weighted_score}, confidence ${Math.round(decision.confidence * 100)}%`
    : verdict;

  return (
    <Wrap>
      <Eyebrow>Committee summary</Eyebrow>
      {headline && <Verdict>{headline}</Verdict>}
      {bullets.length > 0 && (
        <Bullets>
          {bullets.map((bullet, i) => (
            <Bullet key={i}>{bullet}</Bullet>
          ))}
        </Bullets>
      )}
      {paragraphs.map((paragraph, i) => (
        <Paragraph key={i}>{paragraph}</Paragraph>
      ))}
    </Wrap>
  );
}
