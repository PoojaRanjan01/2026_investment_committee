"""Retry strategy for Bedrock's occasional mid-stream tool-use malformation.

Nova Pro sometimes emits a broken ToolUse content block, which Bedrock
rejects with `modelStreamErrorException` ("Model produced invalid sequence
as part of ToolUse"). AWS's own troubleshooting guidance for this error is
simply to retry the call — it's a stochastic generation glitch, not a
request/schema problem, and it clears on a fresh attempt the large majority
of the time.

Strands' built-in `ModelRetryStrategy` (see `strands.event_loop._retry`)
already implements the retry/backoff mechanics via an `AfterModelCallEvent`
hook, but only treats `ModelThrottledException` as retryable. Its own
docstring says to subclass and override `is_retryable` to extend that set
without reimplementing the rest — which is what this does.
"""

from botocore.exceptions import EventStreamError
from strands.event_loop._retry import ModelRetryStrategy
from strands.types.exceptions import ModelThrottledException

_RETRYABLE_STREAM_ERROR_CODES = {
    "modelStreamErrorException",
    "internalServerException",
    "serviceUnavailableException",
}


class ResilientModelRetryStrategy(ModelRetryStrategy):
    def is_retryable(self, exception: Exception) -> bool:
        if isinstance(exception, ModelThrottledException):
            return True
        if isinstance(exception, EventStreamError):
            code = exception.response.get("Error", {}).get("Code", "")
            return code in _RETRYABLE_STREAM_ERROR_CODES
        return False


def new_resilient_retry_hook() -> ModelRetryStrategy:
    """A fresh instance per Agent — retry attempt-count state lives on the
    instance, so it must not be shared across agents/requests."""
    return ResilientModelRetryStrategy(max_attempts=4, initial_delay=2, max_delay=12)
