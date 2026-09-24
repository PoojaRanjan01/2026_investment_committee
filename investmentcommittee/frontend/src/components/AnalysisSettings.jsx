import styled from "styled-components";
import { useAnalysisSettings } from "../hooks/useAnalysisSettings";
import { Grid, Select } from "../appPrimitives";
import { ButtonSecondary } from "../primitives";

const WEIGHT_AGENTS = [
  { key: "fundamental", label: "Fundamental" },
  { key: "technical", label: "Technical" },
  { key: "news", label: "News" },
  { key: "risk", label: "Risk" },
];

const HISTORY_PERIODS = ["1mo", "3mo", "6mo", "1y", "2y"];

const Section = styled.div`
  max-width: 560px;
  display: flex;
  flex-direction: column;
  gap: 28px;
`;

const BlockTitle = styled.h3`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 6px;
`;

const Hint = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textMuted};
  line-height: 150%;
  margin: 0 0 14px;
`;

const WeightRow = styled.div`
  display: grid;
  grid-template-columns: 100px 1fr 44px;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
`;

const WeightLabel = styled.label`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text};
`;

const RangeInput = styled.input`
  accent-color: ${({ theme }) => theme.colors.accent};
`;

const WeightValue = styled.span`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textMuted};
  text-align: right;
`;

const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const NumberInput = styled.input`
  font-family: ${({ theme }) => theme.fonts.sans};
  font-size: 14px;
  text-transform: none;
  letter-spacing: normal;
  padding: 8px 10px;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
`;

export function AnalysisSettings() {
  const { settings, updateWeight, update, reset } = useAnalysisSettings();
  const weightTotal = Object.values(settings.weights).reduce((sum, w) => sum + Number(w), 0);

  return (
    <Section>
      <div>
        <BlockTitle>Decision weights</BlockTitle>
        <Hint>
          How much each specialist's score counts toward the final BUY/HOLD/AVOID decision. These don't need to sum
          to 100% — whichever specialists actually run for a given question are automatically renormalized against
          each other. Current total: {Math.round(weightTotal * 100)}%.
        </Hint>
        {WEIGHT_AGENTS.map((a) => (
          <WeightRow key={a.key}>
            <WeightLabel htmlFor={`weight-${a.key}`}>{a.label}</WeightLabel>
            <RangeInput
              id={`weight-${a.key}`}
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.weights[a.key]}
              onChange={(e) => updateWeight(a.key, Number(e.target.value))}
            />
            <WeightValue>{Math.round(settings.weights[a.key] * 100)}%</WeightValue>
          </WeightRow>
        ))}
      </div>

      <div>
        <BlockTitle>Decision thresholds</BlockTitle>
        <Hint>Where the weighted score (-100..+100) crosses into a BUY or AVOID label.</Hint>
        <Grid $min="180px">
          <Field>
            BUY at or above
            <NumberInput
              type="number"
              min="0"
              max="100"
              value={settings.buyThreshold}
              onChange={(e) => update("buyThreshold", Number(e.target.value))}
            />
          </Field>
          <Field>
            AVOID at or below
            <NumberInput
              type="number"
              min="-100"
              max="0"
              value={settings.avoidThreshold}
              onChange={(e) => update("avoidThreshold", Number(e.target.value))}
            />
          </Field>
        </Grid>
      </div>

      <div>
        <BlockTitle>Data inputs</BlockTitle>
        <Grid $min="180px">
          <Field>
            News headlines considered
            <NumberInput
              type="number"
              min="1"
              max="20"
              value={settings.newsHeadlineCount}
              onChange={(e) => update("newsHeadlineCount", Number(e.target.value))}
            />
          </Field>
          <Field>
            Technical history window
            <Select value={settings.technicalHistoryPeriod} onChange={(e) => update("technicalHistoryPeriod", e.target.value)}>
              {HISTORY_PERIODS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Select>
          </Field>
        </Grid>
      </div>

      <ButtonSecondary onClick={reset} style={{ alignSelf: "flex-start" }}>
        Reset to defaults
      </ButtonSecondary>
    </Section>
  );
}
