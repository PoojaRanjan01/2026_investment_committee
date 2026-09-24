const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

/**
 * Streams an /invocations call and reports each SSE event to onEvent as it arrives.
 * Event shapes come from the orchestrator (main.py):
 *   - {"specialistResult": {"tool": "...", "output": {...}}} — a specialist or
 *     decision_synthesis result, as soon as that tool call returns.
 *   - {"event": {...}} — the raw Bedrock Converse stream (tool-call starts,
 *     the orchestrator's narrated text, etc).
 *
 * `config` (weights/thresholds/etc from Settings > Analysis) rides along in
 * the request body — the backend applies it for just this call via a
 * context-scoped override, see config_context.py.
 *
 * Sends a fresh random session ID on every call. Without this header the
 * backend falls back to a session keyed by `None`, and — because
 * `get_or_create_agent` caches by session key for the life of the dev
 * server process — every request without a header ends up sharing ONE
 * ever-growing conversation. That accumulated history eventually confuses
 * the model into malformed tool-use calls (Bedrock's
 * "modelStreamErrorException: Model produced invalid sequence as part of
 * ToolUse"). Each analysis here is independent, so there's no reason to
 * share history across calls anyway.
 */
export async function streamAnalysis(prompt, { onEvent, signal, config } = {}) {
  const response = await fetch(`${API_BASE_URL}/invocations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Amzn-Bedrock-AgentCore-Runtime-Session-Id": crypto.randomUUID(),
    },
    body: JSON.stringify(config ? { prompt, config } : { prompt }),
    signal,
  });

  if (!response.ok || !response.body) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const blocks = buffer.split("\n\n");
    buffer = blocks.pop() ?? "";

    for (const block of blocks) {
      const dataLine = block.split("\n").find((line) => line.startsWith("data: "));
      if (!dataLine) continue;
      try {
        onEvent?.(JSON.parse(dataLine.slice("data: ".length)));
      } catch {
        // Ignore malformed/partial chunks — the next complete block will resync.
      }
    }
  }
}
