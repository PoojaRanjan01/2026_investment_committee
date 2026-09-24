// The Undervalued — brand tokens.
// Mirrors Finance/.claude/skills/undervalued-design/SKILL.md. If the brand
// palette changes there, update here too — this file doesn't read it live.

export const lightTheme = {
  mode: "light",
  colors: {
    bg: "#f1ece2",
    surface: "#ffffff",
    surfaceAlt: "#e4dfd3",
    text: "#12294b",
    textMuted: "#5b6470",
    accent: "#c2410c", // rust-orange — for THIS theme's surfaces only
    accentAlt: "#d9540f",
    border: "#dad2c2",
  },
  fonts: {
    serif: `ui-serif, Georgia, Cambria, "Times New Roman", Times, serif`,
    sans: `ui-sans-serif, system-ui, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif`,
    mono: `ui-monospace, "SF Mono", Menlo, Consolas, monospace`,
  },
};

export const darkTheme = {
  mode: "dark",
  colors: {
    bg: "#0a1730",
    surface: "#12294b",
    surfaceAlt: "#1b3760",
    text: "#f5f1e6",
    textMuted: "#aeb4c2",
    accent: "#f2650c", // bright orange — for THIS theme's surfaces only
    accentAlt: "#ff8a3d",
    border: "#23385c",
  },
  fonts: lightTheme.fonts,
};

// Fixed brand color, independent of theme — see "the one rule" in the skill.
export const BRAND_ORANGE = "#f2650c";
export const BRAND_NAVY = "#12294b";
