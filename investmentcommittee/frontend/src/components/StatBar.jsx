import styled from "styled-components";
import { Grid, StatTile, StatValue, StatLabel } from "../appPrimitives";

const StatGrid = styled(Grid)`
  margin-bottom: 24px;
`;

export function StatBar({ decision, consultedCount, totalCount }) {
  return (
    <StatGrid $min="140px">
      <StatTile>
        <StatValue $muted={!decision}>{decision ? decision.label : "—"}</StatValue>
        <StatLabel>Decision</StatLabel>
      </StatTile>
      <StatTile>
        <StatValue $muted={!decision}>{decision ? decision.weighted_score : "—"}</StatValue>
        <StatLabel>Weighted score</StatLabel>
      </StatTile>
      <StatTile>
        <StatValue $muted={!decision}>{decision ? `${Math.round(decision.confidence * 100)}%` : "—"}</StatValue>
        <StatLabel>Confidence</StatLabel>
      </StatTile>
      <StatTile>
        <StatValue>
          {consultedCount}/{totalCount}
        </StatValue>
        <StatLabel>Specialists consulted</StatLabel>
      </StatTile>
    </StatGrid>
  );
}
