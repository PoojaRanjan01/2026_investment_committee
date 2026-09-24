import styled from "styled-components";
import { formatMetric } from "../formatters";

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 10px;
`;

const Tile = styled.div`
  background: ${({ theme }) => theme.colors.surfaceAlt};
  border-radius: 4px;
  padding: 8px 10px;
`;

const Value = styled.div`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const Label = styled.div`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 10.5px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: 2px;
`;

export function FundamentalMetrics({ metrics }) {
  if (!metrics?.length) return null;
  return (
    <Grid>
      {metrics.map((m) => (
        <Tile key={m.label}>
          <Value>{formatMetric(m.value, m.format)}</Value>
          <Label>{m.label}</Label>
        </Tile>
      ))}
    </Grid>
  );
}
