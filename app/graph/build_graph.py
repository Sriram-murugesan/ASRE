"""
START -> Router -> conditional route -> {Knowledge | Action | Escalation} -> END
"""
from langgraph.graph import StateGraph, END
from typing import TypedDict, Optional, Any

from app.agents.router import router_node
from app.agents.action import action_node
from app.agents.escalation import escalation_node
from app.agents.knowledge import knowledge_node


class ASREState(TypedDict, total=False):
    query: str
    route: str
    route_confidence: str
    # knowledge branch
    retrieved_doc_ids: list
    answer: str
    # action branch
    tool_called: str
    tool_args: dict
    tool_result: dict
    # escalation branch
    escalated: bool


def route_decision(state: ASREState) -> str:
    """Conditional edge function -- reads state['route'], set by router_node."""
    return state["route"]


def build_graph(corpus: list, retriever):
    """
    corpus/retriever are injected here (not imported globally in knowledge.py)
    so the eval harness can swap in a fixed test corpus without touching
    agent code, and production can swap tfidf -> faiss the same way.
    """
    graph = StateGraph(ASREState)

    graph.add_node("router", router_node)
    graph.add_node("knowledge", lambda state: knowledge_node(state, corpus, retriever))
    graph.add_node("action", action_node)
    graph.add_node("escalation", escalation_node)

    graph.set_entry_point("router")

    graph.add_conditional_edges(
        "router",
        route_decision,
        {
            "knowledge": "knowledge",
            "action": "action",
            "escalation": "escalation",
        },
    )

    graph.add_edge("knowledge", END)
    graph.add_edge("action", END)
    graph.add_edge("escalation", END)

    return graph.compile()
