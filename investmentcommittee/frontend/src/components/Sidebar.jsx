import { useState } from "react";
import styled, { useTheme } from "styled-components";
import { NavLink } from "react-router-dom";
import { TagIcon } from "../TagIcon";
import { ThemeToggle } from "./ThemeToggle";

const COLLAPSE_KEY = "undervalued:sidebar-collapsed";

function loadCollapsed() {
  return localStorage.getItem(COLLAPSE_KEY) === "1";
}

// Positioned (not overflow-clipped) so the edge-anchored CollapseHandle below
// isn't cut off by the inner ScrollArea's own overflow clipping.
const SidebarShell = styled.aside`
  width: ${(p) => (p.$collapsed ? "64px" : "220px")};
  flex-shrink: 0;
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  position: sticky;
  top: 0;
  height: 100svh;
  transition: width 0.15s ease;
`;

const ScrollArea = styled.div`
  height: 100%;
  padding: 24px ${(p) => (p.$collapsed ? "10px" : "16px")};
  display: flex;
  flex-direction: column;
  gap: 24px;
  overflow-y: auto;
  overflow-x: hidden;
  transition: padding 0.15s ease;
`;

const Brand = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  justify-content: ${(p) => (p.$collapsed ? "center" : "flex-start")};
  padding: 0 ${(p) => (p.$collapsed ? "0" : "8px")};
`;

const BrandName = styled.div`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-weight: 600;
  font-size: 17px;
  color: ${({ theme }) => theme.colors.text};
  line-height: 120%;
  white-space: nowrap;
`;

const BrandTagline = styled.div`
  font-family: ${({ theme }) => theme.fonts.sans};
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: 3px;
  line-height: 135%;
  white-space: nowrap;
`;

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Link = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: ${(p) => (p.$collapsed ? "center" : "flex-start")};
  text-decoration: none;
  font-family: ${({ theme }) => theme.fonts.sans};
  font-size: 14px;
  padding: 9px 10px;
  border-radius: 4px;
  color: ${({ theme }) => theme.colors.textMuted};
  white-space: nowrap;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceAlt};
  }
  &.active {
    background: ${({ theme }) => theme.colors.surfaceAlt};
    color: ${({ theme }) => theme.colors.accent};
  }
`;

const Footer = styled.div`
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

// A small edge-anchored handle (GitHub-sidebar style) rather than a full
// button with a border/label — it should read as part of the sidebar's
// frame, not as another action in the nav list.
const CollapseHandle = styled.button`
  position: absolute;
  top: 50%;
  right: -11px;
  transform: translateY(-50%);
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textMuted};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  cursor: pointer;
  z-index: 1;

  &:hover {
    color: ${({ theme }) => theme.colors.accent};
    border-color: ${({ theme }) => theme.colors.accent};
  }
`;

function ChevronIcon({ $collapsed }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0, transform: $collapsed ? "rotate(180deg)" : "none" }}
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function AnalyzeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <line x1="4" y1="6" x2="20" y2="6" />
      <circle cx="14" cy="6" r="2" fill="currentColor" stroke="none" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <circle cx="8" cy="12" r="2" fill="currentColor" stroke="none" />
      <line x1="4" y1="18" x2="20" y2="18" />
      <circle cx="16" cy="18" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}

const LINKS = [
  { to: "/", end: true, label: "Analyze", Icon: AnalyzeIcon },
  { to: "/settings", end: false, label: "Settings", Icon: SettingsIcon },
];

export function Sidebar({ mode, onModeChange }) {
  const theme = useTheme();
  const [collapsed, setCollapsed] = useState(loadCollapsed);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      return next;
    });
  }

  return (
    <SidebarShell $collapsed={collapsed}>
      <ScrollArea $collapsed={collapsed}>
        <Brand $collapsed={collapsed}>
          <TagIcon size={26} color={theme.colors.text} holeColor={theme.colors.accent} style={{ flexShrink: 0, marginTop: 2 }} />
          {!collapsed && (
            <div>
              <BrandName>The Undervalued</BrandName>
              <BrandTagline>
                Undervalued moves.
                <br />
                Underrated ideas.
              </BrandTagline>
            </div>
          )}
        </Brand>

        <Nav>
          {LINKS.map(({ to, end, label, Icon }) => (
            <Link key={to} to={to} end={end} $collapsed={collapsed} title={collapsed ? label : undefined}>
              <Icon />
              {!collapsed && label}
            </Link>
          ))}
        </Nav>

        <Footer>
          <ThemeToggle mode={mode} onChange={onModeChange} collapsed={collapsed} />
        </Footer>
      </ScrollArea>

      <CollapseHandle
        type="button"
        onClick={toggleCollapsed}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <ChevronIcon $collapsed={collapsed} />
      </CollapseHandle>
    </SidebarShell>
  );
}
