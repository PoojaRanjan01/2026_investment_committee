import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import { streamAnalysis } from "../api";
import { AgentCard } from "../components/AgentCard";
import { DecisionCard } from "../components/DecisionCard";
import { StatBar } from "../components/StatBar";
import { CompanyOverview } from "../components/CompanyOverview";
import { OrchestratorSummary } from "../components/OrchestratorSummary";
import { useAnalysisSettings } from "../hooks/useAnalysisSettings";
import { PageHeader, PageTitle, Subtitle, Row, Input, Grid, Disclaimer } from "../appPrimitives";
import { Button, Callout } from "../primitives";

const SPECIALISTS = [
  { tool: "fundamental_analysis", key: "fundamental", label: "Fundamental" },
  { tool: "technical_analysis", key: "technical", label: "Technical" },
  { tool: "news_analysis", key: "news", label: "News" },
  { tool: "risk_analysis", key: "risk", label: "Risk" },
];
const DECISION_TOOL = "decision_synthesis";

const toolKey = (toolName) => SPECIALISTS.find((s) => s.tool === toolName)?.key;

function initialAgents() {
  return Object.fromEntries(SPECIALISTS.map((s) => [s.key, { status: "idle", data: null }]));
}

const PromptRow = styled(Row)`
  margin-bottom: 24px;
`;

const ErrorBanner = styled(Callout)`
  border-left-color: ${({ theme }) => theme.colors.accent};
  margin-bottom: 20px;
`;

const CardGrid = styled(Grid)`
  margin-bottom: 20px;
`;

export default function AnalyzePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const autoRunFired = useRef(false);
  const { settings } = useAnalysisSettings();

  const [prompt, setPrompt] = useState(location.state?.prompt || "Should I invest in AAPL?");
  const [running, setRunning] = useState(false);
  const [agents, setAgents] = useState(initialAgents);
  const [decisionPending, setDecisionPending] = useState(false);
  const [decision, setDecision] = useState(null);
  const [narrative, setNarrative] = useState("");
  const [error, setError] = useState(null);

  async function handleAnalyze(promptOverride) {
    const effectivePrompt = promptOverride ?? prompt;
    if (running) return;
    setRunning(true);
    setAgents(initialAgents());
    setDecision(null);
    setDecisionPending(false);
    setNarrative("");
    setError(null);

    try {
      await streamAnalysis(effectivePrompt, {
        config: settings,
        onEvent(evt) {
          if (evt.error) {
            // The backend hit a mid-stream failure (e.g. a Bedrock
            // modelStreamErrorException) — it reports this as a clean
            // {"error": ...} event rather than just cutting the connection,
            // so surface it instead of leaving cards stuck on "running…"
            // with no explanation.
            setError(evt.error);
            setDecisionPending(false);
            setAgents((prev) =>
              Object.fromEntries(
                Object.entries(prev).map(([key, agent]) => [
                  key,
                  agent.status === "pending" ? { status: "idle", data: null } : agent,
                ])
              )
            );
            return;
          }
          if (evt.specialistResult) {
            const { tool, output } = evt.specialistResult;
            if (tool === DECISION_TOOL) {
              setDecisionPending(false);
              setDecision(output);
              return;
            }
            const key = toolKey(tool);
            if (key) setAgents((prev) => ({ ...prev, [key]: { status: "done", data: output } }));
            return;
          }

          const toolUseStart = evt.event?.contentBlockStart?.start?.toolUse;
          if (toolUseStart) {
            if (toolUseStart.name === DECISION_TOOL) {
              setDecisionPending(true);
              return;
            }
            const key = toolKey(toolUseStart.name);
            if (key) setAgents((prev) => ({ ...prev, [key]: { status: "pending", data: null } }));
            return;
          }

          const text = evt.event?.contentBlockDelta?.delta?.text;
          if (text) setNarrative((prev) => prev + text);
        },
      });
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setRunning(false);
    }
  }

  // Arriving here from the Watchlist's "Analyze" action: run immediately with
  // the prompt it prefilled, then clear the nav state so back/forward or a
  // refresh doesn't re-trigger it. Guarded with a ref because React 18
  // StrictMode double-invokes effects in dev.
  useEffect(() => {
    if (location.state?.autoRun && !autoRunFired.current) {
      autoRunFired.current = true;
      handleAnalyze(location.state.prompt);
      navigate(location.pathname, { replace: true, state: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayNarrative = narrative.replace(/<thinking>[\s\S]*?<\/thinking>/g, "").trim();

  return (
    <div>
      <PageHeader>
        <PageTitle>Analyze a stock</PageTitle>
        <Subtitle>Ask a question — the orchestrator decides which analysts to consult.</Subtitle>
      </PageHeader>

      <StatBar
        decision={decision}
        consultedCount={Object.values(agents).filter((a) => a.status !== "idle").length}
        totalCount={SPECIALISTS.length}
      />

      <PromptRow>
        <Input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
          placeholder='e.g. "Should I invest in NVDA?" or "Why did AAPL move today?"'
          disabled={running}
        />
        <Button onClick={() => handleAnalyze()} disabled={running || !prompt.trim()}>
          {running ? "Analyzing…" : "Analyze"}
        </Button>
      </PromptRow>

      {error && (
        <ErrorBanner>
          <strong>Analysis failed:</strong> {error}
        </ErrorBanner>
      )}

      <CompanyOverview technical={agents.technical.data} fundamental={agents.fundamental.data} risk={agents.risk.data} />

      <OrchestratorSummary narrative={displayNarrative} decision={decision} />

      <CardGrid $min="300px">
        {SPECIALISTS.map((s) => (
          <AgentCard key={s.key} agentKey={s.key} label={s.label} status={agents[s.key].status} data={agents[s.key].data} />
        ))}
      </CardGrid>

      <DecisionCard decision={decision} pending={decisionPending} />

      <Disclaimer>This is not licensed financial advice.</Disclaimer>
    </div>
  );
}
