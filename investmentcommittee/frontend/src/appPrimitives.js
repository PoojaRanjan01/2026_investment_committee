// App-chrome primitives that extend the brand skill (Card/Tag/Button/etc in
// primitives.js) to cover things the skill doesn't define — layout, form
// controls, stat tiles. Built from the same theme tokens throughout, no
// colors introduced outside the verified palette.
import styled from "styled-components";

export const Shell = styled.div`
  display: flex;
  min-height: 100svh;
`;

export const Main = styled.main`
  flex: 1;
  min-width: 0;
  max-width: 1100px;
  padding: 24px 32px 48px;
`;

export const PageHeader = styled.header`
  margin-bottom: 20px;
`;

export const PageTitle = styled.h1`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 4px;
`;

export const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 14px;
  margin: 0;
`;

export const Input = styled.input`
  font-family: ${({ theme }) => theme.fonts.sans};
  font-size: 14px;
  padding: 10px 14px;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  width: 100%;
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent};
  }
  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

export const Select = styled.select`
  font-family: ${({ theme }) => theme.fonts.sans};
  font-size: 14px;
  padding: 8px 10px;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
`;

export const Row = styled.div`
  display: flex;
  gap: 12px;
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(${(p) => p.$min || "300px"}, 1fr));
  gap: 12px;
`;

// Neutral state pill ("running…", "not called") — deliberately border/muted,
// not accent, so it never competes with the brand's one true accent color.
export const Pill = styled.span`
  display: inline-block;
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 10.5px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 2px 8px;
  border-radius: 3px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.textMuted};
  white-space: nowrap;
`;

export const StatTile = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  padding: 12px 16px;
`;

export const StatValue = styled.div`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-size: 22px;
  font-weight: 600;
  color: ${(p) => (p.$muted ? p.theme.colors.textMuted : p.theme.colors.text)};
`;

export const StatLabel = styled.div`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: 2px;
`;

export const Disclaimer = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-style: italic;
`;
