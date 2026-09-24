import { useTheme } from "styled-components";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function TechnicalChart({ series }) {
  const theme = useTheme();
  if (!series?.length) return null;
  const tickInterval = Math.max(0, Math.floor(series.length / 6) - 1);

  return (
    <div style={{ marginBottom: 10 }}>
      <ResponsiveContainer width="100%" height={140}>
        <LineChart data={series} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border} />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: theme.colors.textMuted }} interval={tickInterval} />
          <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10, fill: theme.colors.textMuted }} width={46} />
          <Tooltip
            contentStyle={{ background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, fontSize: 12 }}
            labelStyle={{ color: theme.colors.text }}
          />
          <Line type="monotone" dataKey="close" stroke={theme.colors.accent} dot={false} strokeWidth={2} name="Close" />
          <Line
            type="monotone"
            dataKey="sma20"
            stroke={theme.colors.textMuted}
            dot={false}
            strokeWidth={1.5}
            strokeDasharray="4 3"
            name="SMA20"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
