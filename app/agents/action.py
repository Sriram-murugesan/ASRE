import json
from app.llm import get_completion
from app.tools.registry import TOOL_REGISTRY

ACTION_TOOL_PROMPT = """[ACTION_TOOL]
Which tool does this request need: issue_refund, create_ticket, or book_callback?
Respond ONLY with JSON: {"tool": "..."}
"""

ACTION_ARGS_PROMPT = """[ACTION_ARGS]
Extract the arguments needed for this tool call from the customer's message.

STRICT RULES — violating these is a critical failure:
1. AMOUNT: Only extract a dollar amount if it is explicitly stated with a $
   sign (e.g. "$45.99", "$200"). If no explicit $ amount is present, return
   null for amount. NEVER guess using unrelated numbers in the message (order
   IDs, invoice numbers, timestamps, quantities, etc.).
2. ORDER_ID / any other field: Only return a value if it is LITERALLY present
   in the customer's message. Do not infer, guess, or fabricate values.
3. MISSING FIELDS: If required arguments are absent from the message, set
   missing_required_fields to true and leave those fields as null. Do NOT
   populate them with invented plausible-looking values.

Respond ONLY with JSON:
{"amount": <number or null>, "missing_required_fields": <true|false>}
"""


def action_node(state: dict) -> dict:
    """
    Two SEPARATE model calls, deliberately not merged into one:
    1. which tool to call (tool SELECTION)
    2. what arguments to call it with (tool ARGUMENTS)
    These are kept independent because they are independently scored by the
    eval harness -- a system can nail #1 and silently botch #2 (wrong refund
    amount), and merging the calls would make that failure mode invisible.

    Hardened for real-LLM output: by the time we're in this node, routing is
    already committed -- there's no "escalate instead" option here the way
    the router has. So a malformed/out-of-registry tool name or malformed
    args JSON falls back to create_ticket with no args, which routes the
    case to a human rather than crashing or silently no-op'ing. The fallback
    is recorded in state (fallback_triggered) instead of swallowed, so the
    eval harness / logs can see it happened.
    """
    query = state["query"]
    fallback_triggered = False

    try:
        tool_raw = get_completion(ACTION_TOOL_PROMPT, query, json_mode=True)
        tool_name = json.loads(tool_raw)["tool"]
        if tool_name not in TOOL_REGISTRY:
            raise ValueError(f"model returned unknown tool: {tool_name!r}")
    except (json.JSONDecodeError, KeyError, TypeError, ValueError):
        tool_name = "create_ticket"
        fallback_triggered = True

    try:
        args_raw = get_completion(ACTION_ARGS_PROMPT, query, json_mode=True)
        args = json.loads(args_raw)
    except (json.JSONDecodeError, TypeError):
        args = {"amount": None}
        fallback_triggered = True

    tool_fn = TOOL_REGISTRY[tool_name]
    result = tool_fn(args)

    return {
        **state,
        "tool_called": tool_name,
        "tool_args": args,
        "tool_result": result,
        "fallback_triggered": fallback_triggered,
    }
