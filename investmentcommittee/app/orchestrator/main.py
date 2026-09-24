import json
from typing import Any
from collections import OrderedDict
from strands import Agent
import asyncio
from strands.agent.conversation_manager import SlidingWindowConversationManager
from bedrock_agentcore.runtime import BedrockAgentCoreApp
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware
from model.load import load_model
from model_retry import new_resilient_retry_hook
from mcp_client.client import get_streamable_http_mcp_client
from memory.session import get_memory_session_manager
from specialists.fundamental_agent import fundamental_analysis
from specialists.technical_agent import technical_analysis
from specialists.news_agent import news_analysis
from specialists.risk_agent import risk_analysis
from specialists.decision_agent import decision_synthesis
from config_context import set_analysis_config

app = BedrockAgentCoreApp(
    middleware=[
        # Local dev only, so a browser frontend (e.g. Vite on :5173) can call
        # this server directly. Irrelevant once invoked via AWS-signed requests
        # against the deployed Runtime.
        Middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]),
    ]
)
log = app.logger

# Define a Streamable HTTP MCP Client
mcp_clients = [get_streamable_http_mcp_client()]

DEFAULT_SYSTEM_PROMPT = """
You are the orchestrator of an AI investment committee. You have four
specialist analyst tools (fundamental_analysis, technical_analysis,
news_analysis, risk_analysis) and one synthesis tool (decision_synthesis).
Route dynamically — call only the specialists the question actually needs:

- "Should I invest in X" / "is X a good investment": call ALL FOUR specialist
  tools, THEN call decision_synthesis with their four verdicts before writing
  anything else. NEVER state a BUY/HOLD/AVOID label, a weighted score, or a
  confidence percentage unless you actually called decision_synthesis first —
  in that case, report exactly the label/weighted_score/confidence it
  returned, not your own assessment.
- "Why did X move/fall/rise (today)" / "what's going on with X": call only
  technical_analysis and news_analysis. Do NOT call decision_synthesis for
  this — just explain using the two verdicts directly, no BUY/HOLD/AVOID label.
- A question about business health / financials specifically: call only
  fundamental_analysis.
- A question about risk specifically: call only risk_analysis.

Format your final written response as plain structured text (no markdown
headers, no bold):
1. A single-line verdict as the very first line — the decision_synthesis
   label if you called it (e.g. "BUY — AAPL's fundamentals and momentum both
   support this."), otherwise a one-line takeaway with no BUY/HOLD/AVOID word.
2. Then one short bullet per specialist you consulted, each on its own line
   starting with "- ", citing that specialist's score and the key fact behind
   it. Do not repeat a specialist's full rationale verbatim — summarize it.
3. Always end your response with this disclaimer on its own line: "This is
   not licensed financial advice."

More specialist analysts (valuation, earnings, industry, portfolio) and a
Debate Agent for resolving disagreement will be added in a later phase.
"""


# Define a collection of tools used by the model
tools = [fundamental_analysis, technical_analysis, news_analysis, risk_analysis, decision_synthesis]

_INLINE_FUNCTION_NAMES = set()



# Add MCP client to tools if available
for mcp_client in mcp_clients:
    if mcp_client:
        tools.append(mcp_client)


def _make_conversation_manager():
    return SlidingWindowConversationManager()

def agent_factory():
    cache = {}
    def get_or_create_agent(session_id, user_id):
        _actor_id = user_id
        key = f"{session_id}/{_actor_id}"
        if key not in cache:
            cache[key] = Agent(
                model=load_model(),
                session_manager=get_memory_session_manager(session_id, _actor_id),
                conversation_manager=_make_conversation_manager(),
                system_prompt=DEFAULT_SYSTEM_PROMPT,
                tools=tools,
                hooks=[new_resilient_retry_hook()],
            )
        return cache[key]
    return get_or_create_agent
get_or_create_agent = agent_factory()


def strip_trailing_tool_use(messages: Any) -> list[dict]:
    """Strip toolUse blocks from the tail until the last message has none."""
    if not isinstance(messages, list):
        raise ValueError("messages must be a list")

    messages = list(messages)
    while messages:
        last = messages[-1]
        if not isinstance(last, dict):
            raise ValueError("each message must be an object")
        original_content = last.get("content", [])
        if not isinstance(original_content, list) or not all(isinstance(block, dict) for block in original_content):
            raise ValueError("each message content value must be a list of content blocks")

        content = [block for block in original_content if "toolUse" not in block]
        if len(content) == len(original_content):
            break
        if content:
            messages[-1] = {**last, "content": content}
            break
        messages.pop()

    return messages


def _extract_prompt(payload: dict):
    """Accept validated harness messages, tool results, or a plain prompt string."""
    if not isinstance(payload, dict):
        raise ValueError("payload must be a JSON object")
    if "messages" in payload:
        return strip_trailing_tool_use(payload["messages"])
    if "tool_results" in payload:
        tool_results = payload["tool_results"]
        if not isinstance(tool_results, list) or not all(
            isinstance(tool_result, dict) and isinstance(tool_result.get("toolUseId"), str)
            for tool_result in tool_results
        ):
            raise ValueError("tool_results must contain objects with a toolUseId string")
        return [{"role": "user", "content": [{"toolResult": {
            "toolUseId": tr["toolUseId"],
            "status": tr.get("status", "success"),
            "content": tr.get("content", []),
        }} for tr in tool_results]}]
    prompt = payload.get("prompt", "")
    if not isinstance(prompt, str):
        raise ValueError("prompt must be a string")
    return prompt


def _has_inline_function_call(messages) -> bool:
    """Return True if messages contains an assistant toolUse for an inline function tool."""
    if not _INLINE_FUNCTION_NAMES or not isinstance(messages, list):
        return False
    for msg in messages:
        if msg.get("role") == "assistant":
            for block in msg.get("content", []):
                if isinstance(block, dict) and block.get("toolUse", {}).get("name") in _INLINE_FUNCTION_NAMES:
                    return True
    return False


def _is_inline_function_call(event: dict) -> bool:
    """Check if a contentBlockStart event is for an inline function tool."""
    if not _INLINE_FUNCTION_NAMES:
        return False
    cbs = event.get("contentBlockStart", {})
    start = cbs.get("start", {})
    tool_use = start.get("toolUse") if isinstance(start, dict) else None
    return tool_use is not None and tool_use.get("name") in _INLINE_FUNCTION_NAMES



def _parse_tool_result_content(tool_result: dict) -> Any:
    """Extract a tool result's text content, JSON-decoded if possible."""
    for block in tool_result.get("content", []):
        text = block.get("text") if isinstance(block, dict) else None
        if text:
            try:
                return json.loads(text)
            except (json.JSONDecodeError, TypeError):
                return text
    return None


@app.entrypoint
async def invoke(payload, context):
    log.info("Invoking Agent.....")


    session_id = getattr(context, 'session_id', 'default-session')
    user_id = getattr(context, 'user_id', 'default-user')
    agent = get_or_create_agent(session_id, user_id)

    prompt = _extract_prompt(payload)
    set_analysis_config(payload.get("config") if isinstance(payload, dict) else None)

    # Maps a tool call's id to its tool name, so a later toolResult (which only
    # carries the id) can be reported back to the client as e.g.
    # {"specialistResult": {"tool": "fundamental_analysis", "output": {...}}} —
    # the frontend's live per-agent cards are driven by these events.
    tool_names_by_id: dict[str, str] = {}
    specialist_verdicts: dict[str, dict] = {}
    decision_called = False

    async for event in agent.stream_async(
        prompt,
    ):
        if not isinstance(event, dict):
            continue

        if "event" in event:
            cbs = event["event"].get("contentBlockStart")
            if cbs is not None:
                start = cbs.get("start")
                if not start:
                    continue
                tool_use = start.get("toolUse")
                if tool_use:
                    tool_names_by_id[tool_use["toolUseId"]] = tool_use["name"]
            yield event
            continue

        message = event.get("message")
        if isinstance(message, dict) and message.get("role") == "user":
            for block in message.get("content", []):
                tool_result = block.get("toolResult") if isinstance(block, dict) else None
                if not tool_result:
                    continue
                tool_name = tool_names_by_id.get(tool_result.get("toolUseId"), "unknown")
                output = _parse_tool_result_content(tool_result)
                if tool_name == "decision_synthesis":
                    decision_called = True
                elif isinstance(output, dict) and output.get("agent"):
                    specialist_verdicts[output["agent"]] = output
                yield {"specialistResult": {"tool": tool_name, "output": output}}

    # Nova occasionally gathers all four specialist verdicts for a "should I
    # invest" question but then writes its own free-text verdict instead of
    # actually calling decision_synthesis, despite the system prompt telling
    # it to — leaving the frontend's Decision card/stat tiles empty even
    # though the model's narrative confidently states a BUY/HOLD/AVOID label.
    # Since the weighted-score math is deterministic and cheap to run, close
    # that gap here rather than relying solely on model compliance.
    if not decision_called and len(specialist_verdicts) == 4:
        log.info("decision_synthesis was not called despite all 4 specialists reporting — running it directly")
        decision = decision_synthesis(verdicts=list(specialist_verdicts.values()))
        yield {"specialistResult": {"tool": "decision_synthesis", "output": decision}}


if __name__ == "__main__":
    app.run()
