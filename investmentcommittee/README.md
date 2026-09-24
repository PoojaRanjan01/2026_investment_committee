# The Undervalued

*Undervalued moves. Underrated ideas.*

Multi-agent stock analysis system on Amazon Bedrock AgentCore, built for the
"From Data to Decisions" AWS Community Day talk. A single orchestrator agent
(`app/orchestrator/main.py`) delegates to specialist analyst agents via the
Strands **Agents-as-Tools** pattern — one AgentCore Runtime, no per-agent
deployment. See `../.claude/plans/velvet-stirring-orbit.md` for the full
phased plan (Phase 0 → 1 → 2).

**Status: Phase 1 complete (local).** Orchestrator + four specialists —
Fundamental, Technical, News, Risk (`app/orchestrator/specialists/`), all
backed by live yfinance data — plus a `decision_synthesis` tool that computes
a confidence-weighted BUY/HOLD/AVOID decision from whichever verdicts the
orchestrator gathered. The orchestrator routes dynamically: a full "should I
invest" question pulls all four specialists + decision_synthesis; a narrower
question ("why did it move today") pulls only the relevant one or two. Every
specialist returns the shared `SpecialistVerdict` schema (`specialists/schemas.py`)
so the Decision Agent's weighted scoring and a future Phase 2 Debate Agent's
disagreement detection both work off the same shape.

Model: Amazon Nova Pro (`us.amazon.nova-pro-v1:0`) — see git history/memory
for why (Anthropic Marketplace billing blocked on the AWS account in use).

Not yet redeployed to the cloud Runtime with Phase 1 — verified via
`agentcore dev` locally only so far.

Next up (Phase 2): Valuation, Earnings, Industry, Portfolio specialists, a
Debate Agent triggered on specialist disagreement, and Bedrock Guardrails.

**Frontend** (`frontend/`, React + Vite, branded as "The Undervalued"): a
single "Analyze" trigger shows each specialist's card live as the
orchestrator calls it (score, confidence, rationale, evidence), with cards it
decides *not* to call for a given question staying in a "not called" state —
a direct visualization of the dynamic-routing behavior. Ends with the
synthesized Decision card (when `decision_synthesis` fires) and the
orchestrator's narrated summary. Styled with the **undervalued-design** skill
(`.claude/skills/undervalued-design/SKILL.md`) via styled-components — see
`frontend/README.md` for the design-system details. Talks directly to the
local `agentcore dev` server (`VITE_API_BASE_URL` in `frontend/.env`);
pointing it at the deployed cloud Runtime instead needs a small signing proxy
(browsers can't do AWS SigV4), not yet built.

```bash
agentcore dev --logs --no-browser &     # local dev server (port 8080)
agentcore dev "Should I invest in AAPL?"
agentcore deploy --yes                  # ship to AWS
agentcore invoke "Should I invest in NVDA?"

cd frontend && npm install && npm run dev   # frontend dev server (port 5173)
```

---

This project was created with the [AgentCore CLI](https://github.com/aws/agentcore-cli).

## Project Structure

```
my-project/
├── AGENTS.md               # AI coding assistant context
├── agentcore/
│   ├── agentcore.json      # Project config (agents, memories, credentials, gateways, evaluators)
│   ├── aws-targets.json    # Deployment targets (account + region)
│   ├── .env.local          # Secrets — API keys (gitignored)
│   ├── .llm-context/       # TypeScript type definitions for AI assistants
│   │   ├── agentcore.ts    # AgentCoreProjectSpec types
│   │   └── aws-targets.ts  # Deployment target types
│   └── cdk/                # CDK infrastructure (@aws/agentcore-cdk)
├── app/                    # Agent application code
└── evaluators/             # Custom evaluator code (if any)
```

## Getting Started

### Prerequisites

- **Node.js** 20.x or later
- **Python 3.10+** and **uv** for Python agents ([install uv](https://docs.astral.sh/uv/getting-started/installation/))
- **AWS credentials** configured (`aws configure` or environment variables)
- **Docker** (only for Container build agents)
- `agentcore/aws-targets.json` is gitignored (it holds your AWS account ID) — copy `agentcore/aws-targets.json.example` to `agentcore/aws-targets.json` and fill in your own account ID before running `agentcore deploy`

### Development

Run your agent locally:

```bash
agentcore dev
```

### Validate Invocation Input

Validate runtime invocation payloads before forwarding them to an agent framework. Keep user prompts typed as strings
and pass only prompt text to the agent.

### Deployment

Deploy to AWS:

```bash
agentcore deploy
```

## Commands

| Command | Description |
| --- | --- |
| `agentcore create` | Create a new AgentCore project |
| `agentcore add` | Add resources (agent, memory, credential, gateway, evaluator, policy) |
| `agentcore remove` | Remove resources |
| `agentcore dev` | Run agent locally with hot-reload |
| `agentcore deploy` | Deploy to AWS via CDK |
| `agentcore status` | Show deployment status |
| `agentcore invoke` | Invoke agent (local or deployed) |
| `agentcore logs` | View agent logs |
| `agentcore traces` | View agent traces |
| `agentcore eval` | Run evaluations |
| `agentcore package` | Package agent artifacts |
| `agentcore validate` | Validate configuration |
| `agentcore pause` | Pause a deployed agent |
| `agentcore resume` | Resume a paused agent |
| `agentcore fetch` | Fetch remote resource definitions |
| `agentcore import` | Import existing resources |
| `agentcore update` | Check for CLI updates |

## Configuration

Edit the JSON files in `agentcore/` to configure your project. See `agentcore/.llm-context/` for type definitions and validation constraints.

The project uses a **flat resource model** — agents, memories, credentials, gateways, evaluators, and policies are top-level arrays in `agentcore.json`. Resources are independent; agents discover memories and credentials at runtime via environment variables or SDK calls.

## Resources

| Resource | Purpose |
| --- | --- |
| Agent (runtime) | HTTP, MCP, or A2A agent deployed to AgentCore Runtime |
| Memory | Persistent context storage with configurable strategies |
| Credential | API key or OAuth credential providers |
| Gateway | MCP gateway that routes tool calls to targets |
| Gateway Target | Tool implementation (Lambda, MCP server, OpenAPI, Smithy, API Gateway) |
| Evaluator | Custom LLM-as-a-Judge or code-based evaluation |
| Online Eval Config | Continuous evaluation pipeline for deployed agents |
| Policy | Cedar authorization policies for gateway tools |

### Agent Types

- **Template agents**: Created from framework templates (Strands, LangChain/LangGraph, GoogleADK, OpenAI Agents, Autogen)
- **BYO agents**: Bring your own code with `agentcore add agent --type byo`
- **Import agents**: Import existing Bedrock agents with `agentcore import`

### Build Types

- **CodeZip**: Python source packaged as a zip and deployed directly to AgentCore Runtime
- **Container**: Docker image built via CodeBuild (ARM64), pushed to ECR, and deployed to AgentCore Runtime

## Documentation

- [AgentCore CLI](https://github.com/aws/agentcore-cli)
- [AgentCore CDK Constructs](https://github.com/aws/agentcore-l3-cdk-constructs)
- [Amazon Bedrock AgentCore](https://aws.amazon.com/bedrock/agentcore/)
