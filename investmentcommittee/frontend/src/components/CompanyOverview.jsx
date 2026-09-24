import styled from "styled-components";
import { Card, Eyebrow } from "../primitives";
import { TechnicalChart } from "./TechnicalChart";
import { FundamentalMetrics } from "./FundamentalMetrics";

const CardWrap = styled(Card)`
  margin-bottom: 20px;
`;

const InlineWrap = styled.div`
  border-top: 1px dashed ${({ theme }) => theme.colors.border};
  margin-top: 10px;
  padding-top: 14px;
`;

const PriceRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 10px;
`;

const Price = styled.span`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-size: 24px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const Muted = styled.span`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const SectionLabel = styled.div`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 10.5px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 14px 0 6px;

  &:first-of-type {
    margin-top: 0;
  }
`;

/**
 * The price/trend/fundamentals header shared by the Analyze page (above the
 * Committee Summary) and the Settings > Watchlist expand panel — same data
 * shape either way (raw technical/fundamental/risk specialist results, keyed
 * the way `agents.<key>.data` already stores them).
 */
export function CompanyOverview({ technical, fundamental, risk, variant = "card" }) {
  const hasContent =
    technical?.chartData?.series?.length > 0 ||
    fundamental?.chartData?.metrics?.length > 0 ||
    risk?.chartData?.currentPrice != null;

  if (!hasContent) return null;

  const price = risk?.chartData?.currentPrice ?? technical?.chartData?.series?.at(-1)?.close;
  const range = risk?.chartData;
  const Wrap = variant === "inline" ? InlineWrap : CardWrap;

  return (
    <Wrap>
      {variant === "card" && <Eyebrow>Overview</Eyebrow>}

      {price != null && (
        <PriceRow>
          <Price>${price}</Price>
          {range?.fiftyTwoWeekLow != null && range?.fiftyTwoWeekHigh != null && (
            <Muted>
              52w range ${range.fiftyTwoWeekLow}–${range.fiftyTwoWeekHigh}
            </Muted>
          )}
        </PriceRow>
      )}

      {technical?.chartData?.series && (
        <>
          <SectionLabel>Price trend</SectionLabel>
          <TechnicalChart series={technical.chartData.series} />
        </>
      )}

      {fundamental?.chartData?.metrics && (
        <>
          <SectionLabel>Fundamentals</SectionLabel>
          <FundamentalMetrics metrics={fundamental.chartData.metrics} />
        </>
      )}
    </Wrap>
  );
}
