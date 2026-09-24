export function formatCurrency(value) {
  const abs = Math.abs(value);
  if (abs >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

export function formatMetric(value, format) {
  if (value == null) return "—";
  switch (format) {
    case "percent":
      return `${(value * 100).toFixed(1)}%`;
    case "ratio":
      return value.toFixed(2);
    case "currency":
      return formatCurrency(value);
    default:
      return String(value);
  }
}

// Parses the orchestrator's freeform closing narrative into a leading verdict
// line, "- " bullet points, and any leftover prose — see the structured
// format the backend's DEFAULT_SYSTEM_PROMPT asks for (main.py). The
// disclaimer line is dropped here since it's always shown separately as a
// persistent footer regardless of narrative content.
export function parseNarrative(text) {
  const lines = (text || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/not licensed financial advice/i.test(line));

  if (!lines.length) return null;

  const bulletRe = /^[-•]\s+/;
  let verdict = null;
  const bullets = [];
  const paragraphs = [];

  for (const line of lines) {
    if (bulletRe.test(line)) {
      bullets.push(line.replace(bulletRe, ""));
    } else if (!verdict && bullets.length === 0) {
      verdict = line;
    } else {
      paragraphs.push(line);
    }
  }

  return { verdict, bullets, paragraphs };
}

export function timeAgo(iso) {
  if (!iso) return "";
  const hours = Math.round((Date.now() - new Date(iso).getTime()) / 3600000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}
