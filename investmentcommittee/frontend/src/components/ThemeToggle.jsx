import styled from "styled-components";

const Wrap = styled.div`
  display: flex;
  flex-direction: ${(p) => (p.$collapsed ? "column" : "row")};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  overflow: hidden;
`;

const OptionButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: ${(p) => (p.$collapsed ? "8px 0" : "6px 4px")};
  background: ${(p) => (p.$active ? p.theme.colors.surfaceAlt : "transparent")};
  color: ${(p) => (p.$active ? p.theme.colors.accent : p.theme.colors.textMuted)};
  border: none;
  border-right: ${(p) => (p.$collapsed ? "none" : `1px solid ${p.theme.colors.border}`)};
  border-bottom: ${(p) => (p.$collapsed ? `1px solid ${p.theme.colors.border}` : "none")};
  cursor: pointer;
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;

  &:last-child {
    border-right: none;
    border-bottom: none;
  }
  &:hover {
    background: ${({ theme }) => theme.colors.surfaceAlt};
  }
`;

function SunIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="4" />
      <line x1="12" y1="20" x2="12" y2="22" />
      <line x1="4" y1="12" x2="2" y2="12" />
      <line x1="22" y1="12" x2="20" y2="12" />
      <line x1="19.07" y1="4.93" x2="17.66" y2="6.34" />
      <line x1="6.34" y1="17.66" x2="4.93" y2="19.07" />
      <line x1="19.07" y1="19.07" x2="17.66" y2="17.66" />
      <line x1="6.34" y1="6.34" x2="4.93" y2="4.93" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function AutoIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="12" rx="1.5" />
      <line x1="8" y1="20" x2="16" y2="20" />
      <line x1="12" y1="16" x2="12" y2="20" />
    </svg>
  );
}

const OPTIONS = [
  { key: "light", label: "Light", Icon: SunIcon },
  { key: "dark", label: "Dark", Icon: MoonIcon },
  { key: "system", label: "Auto", Icon: AutoIcon },
];

export function ThemeToggle({ mode, onChange, collapsed }) {
  return (
    <Wrap role="radiogroup" aria-label="Color theme" $collapsed={collapsed}>
      {OPTIONS.map(({ key, label, Icon }) => (
        <OptionButton
          key={key}
          type="button"
          role="radio"
          aria-checked={mode === key}
          $active={mode === key}
          $collapsed={collapsed}
          title={label}
          onClick={() => onChange(key)}
        >
          <Icon />
          {!collapsed && label}
        </OptionButton>
      ))}
    </Wrap>
  );
}
