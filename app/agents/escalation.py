def escalation_node(state: dict) -> dict:
    """
    Never attempts to resolve. Hands off to a human. No LLM call needed --
    the routing decision already happened; this node's only job is to record
    the handoff, not to generate a response pretending to help.
    """
    return {
        **state,
        "escalated": True,
        "answer": "This has been escalated to a human agent for review.",
    }
