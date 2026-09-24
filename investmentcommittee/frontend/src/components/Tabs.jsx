import styled from "styled-components";

const TabBar = styled.div`
  display: flex;
  gap: 6px;
  margin-bottom: ${(p) => (p.$inner ? "16px" : "20px")};
`;

const TabButton = styled.button`
  font-family: ${({ theme }) => theme.fonts.sans};
  font-size: ${(p) => (p.$inner ? "13px" : "14px")};
  padding: ${(p) => (p.$inner ? "6px 14px" : "8px 18px")};
  border-radius: 4px;
  border: 1px solid ${(p) => (p.$active ? p.theme.colors.accent : p.theme.colors.border)};
  background: transparent;
  color: ${(p) => (p.$active ? p.theme.colors.accent : p.theme.colors.textMuted)};
  cursor: pointer;
`;

export function Tabs({ tabs, active, onChange, inner = false }) {
  return (
    <TabBar $inner={inner}>
      {tabs.map((t) => (
        <TabButton key={t.key} $active={active === t.key} $inner={inner} onClick={() => onChange(t.key)}>
          {t.label}
        </TabButton>
      ))}
    </TabBar>
  );
}
