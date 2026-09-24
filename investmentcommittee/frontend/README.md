# The Undervalued — Frontend

*Undervalued moves. Underrated ideas.*

Branded with the **undervalued-design** skill (`.claude/skills/undervalued-design/SKILL.md`
at the repo root, copied from the `Finance` project — see that file for the
full token/primitive reference). Deep navy + vivid orange, serif display
type, editorial/ledger-inspired, restrained accent usage — styled-components,
not plain CSS (`src/theme.js`, `src/primitives.js`, `src/appPrimitives.js`).
Score direction is shown with ▲/▼ arrows rather than red/green, since the
brand palette deliberately has no traffic-light colors — see the skill's "one
rule that matters most" before adding any new color.

A finance-dashboard layout: a left sidebar for navigation, two pages in the main area.

- **Analyze** — a stat-tile row up top (Decision / Weighted score / Confidence
  / Specialists consulted, "—" until a run starts) driven live off the same
  stream as the cards below it. One "Analyze" trigger; each specialist's card
  (Fundamental/Technical/News/Risk) fills in live as the orchestrator decides
  to call it, followed by the synthesized Decision card. A card staying on
  "not called" is dynamic routing in action, not a bug — the orchestrator
  only calls the specialists a given question actually needs.
- **Settings** — two tabs:
  - *Watchlist* — US and India sub-tabs, each a locally-persisted
    (`localStorage`) list of tickers. Click "Analyze" on any ticker to jump
    to the Analyze page and run it immediately.
  - *Analysis* — tune the decision weights per specialist, the BUY/AVOID
    thresholds, how many news headlines get considered, and the technical
    analyst's history window. Saved to `localStorage` and sent to the backend
    with every analysis request (see `config_context.py` on the backend).

```bash
npm install
cp .env.example .env   # if .env doesn't already exist
npm run dev
```

Requires the backend running separately first: `agentcore dev --logs --no-browser`
from `../` (see the root README). `VITE_API_BASE_URL` in `.env` points at it —
change this to swap backends later (e.g. a signing proxy in front of the
deployed cloud Runtime, not yet built).

---

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
