from app.llm import get_completion
import json

VALID_ROUTES = {"knowledge", "action", "escalation"}

ROUTER_SYSTEM_PROMPT = """[ROUTER]
You classify a customer support message into exactly one route:
knowledge, action, or escalation.

ROUTES:
- knowledge : The user is ASKING ABOUT a topic -- seeking information,
  explanation, or policy details. This includes questions that contain
  action-adjacent words (refund, cancel, return) when the phrasing is
  informational ("what is", "how does", "what's your policy on").
- action    : The user wants something DONE RIGHT NOW -- they are issuing a
  request or command. Only classify as action when the phrasing is explicitly
  imperative or first-person-action ("please refund", "refund my order",
  "I want a refund for order X", "create a ticket", "book a callback").
- escalation: The user is angry, threatening legal action, asking for a
  human/manager, or the message is too ambiguous to safely auto-route.

CRITICAL RULE: Do NOT classify a message as "action" merely because it
contains an action-adjacent noun (e.g. "refund", "cancel", "return").
The FRAMING decides the route, not the noun. A question ABOUT a refund is
knowledge; a REQUEST TO ISSUE a refund is action.

If you are not confident, choose escalation rather than guessing -- an
automated wrong answer is worse than a human review.

FEW-SHOT EXAMPLES (labeled):

User: "What is your refund policy?"
-> {"route": "knowledge", "confidence": "high"}
Reason: "What is X" is informational framing. No action requested.

User: "How does the refund process work?"
-> {"route": "knowledge", "confidence": "high"}
Reason: "How does X work" is an explanation request, not an action.

User: "Can I get a refund if I cancel early?"
-> {"route": "knowledge", "confidence": "high"}
Reason: Hypothetical conditional question about policy, not a refund request.

User: "What are your cancellation terms?"
-> {"route": "knowledge", "confidence": "high"}
Reason: Asking about terms (informational), not cancelling anything.

User: "Please refund $45.99 for order ORD-123"
-> {"route": "action", "confidence": "high"}
Reason: Explicit imperative with amount and order ID -- clear action request.

User: "Refund my order 88213, it was charged twice"
-> {"route": "action", "confidence": "high"}
Reason: Imperative phrasing ("Refund my order") is a clear action request.

User: "I want a refund for my last subscription charge"
-> {"route": "action", "confidence": "high"}
Reason: "I want [action]" is first-person action intent, not a question.

User: "This is unacceptable, I want to speak to your manager"
-> {"route": "escalation", "confidence": "high"}
Reason: Anger signal + request for human agent.

Respond ONLY with JSON: {"route": "...", "confidence": "high"|"low"}
"""


def router_node(state: dict) -> dict:
    """
    Reads state['query'], writes state['route'] and state['route_confidence'].
    Low confidence is a safety valve, not a bug: it forces escalation even
    when a keyword pattern matched something else, because being unsure IS
    the signal that automation shouldn't proceed.

    Hardened for real-LLM output (mock output is always well-formed, but a
    real model can return malformed JSON or an out-of-vocabulary route
    string) -- both failure modes fall back to escalation with low
    confidence, consistent with the "uncertain -> escalate" design, rather
    than crashing the graph or silently mis-routing.
    """
    raw = get_completion(ROUTER_SYSTEM_PROMPT, state["query"], json_mode=True)

    try:
        parsed = json.loads(raw)
        route = parsed["route"]
        confidence = parsed.get("confidence", "high")
        if route not in VALID_ROUTES:
            route, confidence = "escalation", "low"
    except (json.JSONDecodeError, KeyError, TypeError):
        route, confidence = "escalation", "low"

    # Safety valve: low confidence always forces escalation, regardless of
    # which route the classifier nominally picked.
    if confidence == "low":
        route = "escalation"

    return {
        **state,
        "route": route,
        "route_confidence": confidence,
    }
