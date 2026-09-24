// Core brand primitives — from Finance/.claude/skills/undervalued-design/SKILL.md.
import styled from "styled-components";

export const Eyebrow = styled.span`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.accent};
`;

// Only number sections that are a real sequence (steps, weeks) — not decoration.
export const SectionHead = styled.h2`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-size: 22px;
  font-weight: 600;
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin: 0 0 6px;

  .num {
    font-family: ${({ theme }) => theme.fonts.mono};
    font-size: 13px;
    color: ${({ theme }) => theme.colors.accent};
  }
`;

export const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  padding: 18px 20px;
`;

export const Tag = styled.span`
  display: inline-block;
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 10.5px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${({ theme }) => theme.colors.accent};
  border: 1px solid ${({ theme }) => theme.colors.accent};
  border-radius: 3px;
  padding: 2px 7px;
  margin-bottom: 10px;
`;

export const Callout = styled.div`
  border-left: 3px solid ${({ theme }) => theme.colors.accentAlt};
  background: ${({ theme }) => theme.colors.surface};
  padding: 14px 18px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textMuted};

  strong {
    color: ${({ theme }) => theme.colors.text};
  }
`;

export const TableWrap = styled.div`
  overflow-x: auto;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
`;

export const Table = styled.table`
  border-collapse: collapse;
  width: 100%;
  min-width: 560px;
  font-size: 13.5px;
  background: ${({ theme }) => theme.colors.surface};

  th, td {
    text-align: left;
    padding: 10px 14px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    vertical-align: top;
  }
  thead th {
    font-family: ${({ theme }) => theme.fonts.mono};
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: ${({ theme }) => theme.colors.textMuted};
    background: ${({ theme }) => theme.colors.surfaceAlt};
  }
  tbody tr:last-child td { border-bottom: none; }
`;

// Fixed brand color, not theme-dependent — see "the one rule" in the skill.
export const Button = styled.button`
  font-family: ${({ theme }) => theme.fonts.sans};
  font-weight: 600;
  font-size: 14px;
  padding: 10px 18px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  background: #f2650c;
  color: #12294b;
  transition: filter 0.15s ease;
  &:hover { filter: brightness(1.08); }
  &:active { filter: brightness(0.95); }
  &:disabled { opacity: 0.5; cursor: default; filter: none; }
`;

export const ButtonSecondary = styled.button`
  font-family: ${({ theme }) => theme.fonts.sans};
  font-weight: 600;
  font-size: 14px;
  padding: 9px 17px;
  border-radius: 4px;
  border: 1.5px solid ${({ theme }) => theme.colors.text};
  background: transparent;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  &:disabled { opacity: 0.5; cursor: default; }
`;
