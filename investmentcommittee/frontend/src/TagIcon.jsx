// The brand mark — from Finance/.claude/skills/undervalued-design/SKILL.md.
export function TagIcon({ size = 40, color = "currentColor", holeColor, className }) {
  return (
    <svg
      className={className}
      width={size}
      height={size * 0.72}
      viewBox="0 0 100 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g transform="rotate(-8 50 36)">
        <path
          d="M10 10 L62 10 L92 36 L62 62 L10 62 Z"
          stroke={color}
          strokeWidth="7"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <circle cx="26" cy="36" r="7" stroke={holeColor || color} strokeWidth="5" />
      </g>
    </svg>
  );
}
