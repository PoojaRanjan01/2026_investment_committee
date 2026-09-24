import styled, { useTheme } from "styled-components";
import { formatMetric } from "../formatters";

const Wrap = styled.div``;

const OwnershipBar = styled.div`
  display: flex;
  height: 10px;
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 6px;
  background: ${({ theme }) => theme.colors.border};
`;

const Segment = styled.div`
  background: ${(p) => p.$color};
`;

const Legend = styled.div`
  display: flex;
  gap: 14px;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-bottom: 12px;
`;

const Dot = styled.i`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 4px;
  background: ${(p) => p.$color};
`;

const RangeBar = styled.div`
  margin-bottom: 12px;
`;

const RangeTrack = styled.div`
  position: relative;
  height: 4px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.border};
  margin-bottom: 4px;
`;

const RangeMarker = styled.div`
  position: absolute;
  top: -3px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.accent};
  transform: translateX(-50%);
  border: 2px solid ${({ theme }) => theme.colors.surface};
`;

const RangeLabels = styled.div`
  display: flex;
  justify-content: space-between;
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const MetricGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
`;

const MetricTile = styled.div`
  background: ${({ theme }) => theme.colors.surfaceAlt};
  border-radius: 4px;
  padding: 8px 10px;
`;

const MetricValue = styled.div`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const MetricLabel = styled.div`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 10.5px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: 2px;
`;

export function RiskShowcase({ chartData }) {
  const theme = useTheme();
  if (!chartData) return null;
  const { ownership, beta, shortPercentOfFloat, fiftyTwoWeekLow, fiftyTwoWeekHigh, currentPrice } = chartData;

  const rangePct =
    fiftyTwoWeekLow != null && fiftyTwoWeekHigh != null && currentPrice != null
      ? ((currentPrice - fiftyTwoWeekLow) / (fiftyTwoWeekHigh - fiftyTwoWeekLow)) * 100
      : null;

  return (
    <Wrap>
      {ownership && (
        <>
          <OwnershipBar>
            <Segment $color={theme.colors.accent} style={{ width: `${ownership.insiders * 100}%` }} />
            <Segment $color={theme.colors.accentAlt} style={{ width: `${ownership.institutions * 100}%` }} />
            <Segment $color="transparent" style={{ width: `${ownership.other * 100}%` }} />
          </OwnershipBar>
          <Legend>
            <span>
              <Dot $color={theme.colors.accent} /> Insiders {formatMetric(ownership.insiders, "percent")}
            </span>
            <span>
              <Dot $color={theme.colors.accentAlt} /> Institutions {formatMetric(ownership.institutions, "percent")}
            </span>
          </Legend>
        </>
      )}

      {rangePct != null && (
        <RangeBar>
          <RangeTrack>
            <RangeMarker style={{ left: `${Math.min(100, Math.max(0, rangePct))}%` }} />
          </RangeTrack>
          <RangeLabels>
            <span>52w low ${fiftyTwoWeekLow}</span>
            <span>52w high ${fiftyTwoWeekHigh}</span>
          </RangeLabels>
        </RangeBar>
      )}

      <MetricGrid>
        {beta != null && (
          <MetricTile>
            <MetricValue>{beta.toFixed(2)}</MetricValue>
            <MetricLabel>Beta</MetricLabel>
          </MetricTile>
        )}
        {shortPercentOfFloat != null && (
          <MetricTile>
            <MetricValue>{formatMetric(shortPercentOfFloat, "percent")}</MetricValue>
            <MetricLabel>Short % of float</MetricLabel>
          </MetricTile>
        )}
      </MetricGrid>
    </Wrap>
  );
}
