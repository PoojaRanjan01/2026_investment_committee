# AWS Community Day Proposal — "From Data to Decisions"

## Title options
1. **"The Investment Committee: Multi-Agent Financial Analysis on Bedrock AgentCore"**
2. **"From Data to Decisions: Building an AI Investment Committee with Strands and AgentCore"**
3. **"Agents-as-Tools: One Orchestrator, Four Analysts, Zero Per-Agent Deployments"**

## Short abstract (~450 chars, for CFP listing pages)
What if "should I invest in this stock?" got answered by a committee, not a chatbot? This talk walks through building The Undervalued — a multi-agent investment analysis system on Amazon Bedrock AgentCore, where a single orchestrator agent dynamically delegates to Fundamental, Technical, News, and Risk specialists using the Strands Agents-as-Tools pattern, then synthesizes their verdicts into a weighted BUY/HOLD/AVOID decision — live, in front of the audience.

## Long abstract
Multi-agent systems are everywhere in the demo reel and nowhere in production — mostly because "just spin up N agents" doesn't answer the real questions: how do they share a decision format, how do you avoid deploying and paying for four separate runtimes, and what happens when the model itself misbehaves mid-stream?

This talk builds an AI investment committee to answer those questions concretely:

- **One Runtime, four specialists.** Using the Strands **Agents-as-Tools** pattern, the Fundamental, Technical, News, and Risk analysts are just `@tool`-decorated functions the orchestrator can call — no separate AgentCore Runtime per agent, no inter-agent network hops.
- **Dynamic routing, not a fixed pipeline.** A full "should I invest in AAPL?" pulls all four specialists; "why did it move today?" pulls only Technical + News. The orchestrator decides at inference time based on the question, not a hardcoded DAG.
- **A shared verdict contract.** Every specialist returns the same `SpecialistVerdict` shape (score, confidence, rationale, evidence) — a Pydantic schema — so a deterministic `decision_synthesis` tool can compute a confidence-weighted score across whichever subset of specialists actually reported, with per-specialist weights renormalized on the fly.
- **Designing for a model that doesn't always comply.** Nova Pro occasionally gathers all four verdicts and then narrates its own BUY/HOLD/AVOID conclusion instead of calling the synthesis tool. Rather than trust prompt compliance alone, the orchestrator detects that gap server-side and runs the deterministic synthesis itself — a pattern for keeping agentic systems honest when "just tell it to" isn't enough.
- **Streaming resilience.** Bedrock occasionally emits a malformed tool-use block mid-stream (`modelStreamErrorException`) — a stochastic glitch, not a real failure. We'll look at extending Strands' retry hook to treat it as retryable instead of fatal, and why that's the AWS-recommended mitigation.

Attendees will see the system running live: a React frontend visualizes each specialist agent's card populating in real time as the orchestrator calls it — a direct, visual demonstration of dynamic multi-agent routing, not just an architecture diagram.

## Key takeaways
1. How the **Agents-as-Tools** pattern lets you ship multi-agent systems as one deployable unit on Bedrock AgentCore, instead of N separate runtimes.
2. A concrete pattern for **shared structured-output contracts** across heterogeneous agents, so downstream synthesis/aggregation logic doesn't need per-agent special-casing.
3. Practical resilience techniques for production agentic systems: detecting when a model silently skips an instructed tool call, and extending retry logic for transient Bedrock streaming errors.

## Target audience & level
Intermediate. Best for developers who've built a single-agent app and are wondering how to scale to multiple specialized agents without the deployment/orchestration complexity exploding. Some familiarity with LLM tool-calling/function-calling helps but isn't required — the talk builds the concepts up from a single agent.

## Suggested track
AI/ML — Generative AI, Agents

## Format
40–45 min talk with live demo (architecture walkthrough + live "Should I invest in X?" query against the running system), leaving time for Q&A.

## Speaker bio
Pooja is a Lead Data Scientist at IQM with 11+ years of experience across automation, optimization, AI, strategy, and innovation. Recognized as the "Data Demystifier" in the Media and Ad Tech industry, she is passionate about making AI accessible to all. She is a renowned international speaker, and community builder. She builds AI products - that turns messy data into trustworthy decisions in high-stakes domains.

## Talk outline (40–45 min)

| Time | Section | Content |
| --- | --- | --- |
| 0:00–0:05 | Hook + problem | Why "ask an LLM if I should buy AAPL" is a bad idea as a single prompt — hallucinated numbers, no accountability, no way to say "trust this part more than that part." Frame the investment-committee metaphor: specialists who each own a lane, a chair who synthesizes. |
| 0:05–0:15 | Architecture walkthrough | Strands **Agents-as-Tools** pattern on Bedrock AgentCore. One orchestrator, four specialist tools (Fundamental, Technical, News, Risk) + `decision_synthesis`, one Runtime. Show the shared `SpecialistVerdict` schema and why a common contract matters once you have more than one agent. |
| 0:15–0:30 | Live demo | See script below — full "should I invest" query, then a narrow "why did it move" query to show dynamic routing live. |
| 0:30–0:37 | Resilience deep dive | Two production lessons, shown against real logs/code: (1) Nova sometimes skips the `decision_synthesis` tool call despite the system prompt — server-side fallback recomputes it deterministically. (2) `modelStreamErrorException` mid-stream — extending Strands' `ModelRetryStrategy.is_retryable` to cover it. |
| 0:37–0:42 | Key takeaways + what's next | Recap the 3 key takeaways. Tease Phase 2: Valuation/Earnings/Industry/Portfolio specialists, a Debate Agent for disagreement, Bedrock Guardrails. |
| 0:42–0:45 | Q&A | |

## Demo script

**Pre-talk setup (do this before walking on stage, not live):**
```bash
cd investmentcommittee
agentcore dev --logs --no-browser &     # backend up on :8080, warmed up
cd frontend && npm install && npm run dev   # frontend on :5173
```
Confirm both are running and the frontend loads with all specialist cards in their idle "not called" state before you start talking.

**Beat 1 — full committee question (~5 min)**
- On stage, open the frontend and type: `Should I invest in AAPL?`
- Narrate live as cards populate one by one: Fundamental → Technical → News → Risk, then the Decision card.
- Call out on the Decision card: the weighted score, confidence, and which agents contributed — tie back to the `decision_synthesis` weighting shown in the architecture section.
- Optional: open Settings > Analysis in the frontend beforehand to show the specialist weights are configurable, not hardcoded.

**Beat 2 — dynamic routing on a narrow question (~5 min)**
- Type: `Why did NVDA move today?`
- Point out live: only Technical and News cards populate — Fundamental, Risk, and the Decision card stay in "not called." No BUY/HOLD/AVOID label appears, by design (system prompt explicitly withholds it for this question type).
- This is the moment that visually proves "dynamic routing," not just an architecture slide — worth pausing on.

**Beat 3 — a narrower single-specialist question (~2–3 min, time permitting)**
- Type: `Is AAPL's balance sheet healthy?`
- Only the Fundamental card fires. Reinforces the routing logic from a third angle before moving to the resilience section.

**Fallback if the live demo breaks:** keep a pre-recorded 90-second screen capture of Beats 1–2 queued up as backup — stream/tool-use hiccups are literally one of the talk's own topics, so a glitch on stage is thematically on-brand but still shouldn't derail the timebox.

**Resilience section prop:** have a terminal tailing `agentcore dev --logs` visible/switchable to, so if a `modelStreamErrorException` retry or a decision-synthesis fallback actually fires during the demo, you can flip to the log line live instead of only describing it.
