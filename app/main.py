"""
FastAPI entry point for ASRE.

Endpoints consumed by the frontend:
  POST  /chat                      – Send a query through the agent graph
  GET   /runs/{run_id}/trace       – Execution trace for a run
  GET   /runs/{run_id}/graph       – Graph nodes/edges for a run
  GET   /runs/{run_id}/retrieval   – Retrieval chunks for a run
  GET   /runs/{run_id}/tools       – Tool calls for a run
  GET   /runs/{run_id}/prompts     – Prompt chain for a run

  POST  /eval/run                  – Trigger a new evaluation run
  GET   /eval/runs                 – List past evaluation runs (paginated)
  GET   /eval/runs/{run_id}        – Detailed results for one evaluation run
  GET   /eval/golden               – Paginated golden dataset entries

Run with:
  python -m uvicorn app.main:app --reload --port 8000
"""

from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()

# ── project imports ──────────────────────────────────────────────────────────
from app.tools.retriever import TfidfRetriever
from app.graph.build_graph import build_graph

DATA_DIR = Path(__file__).resolve().parent.parent / "data"

# ── in-memory run store (resets on server restart) ───────────────────────────
_runs: Dict[str, Dict[str, Any]] = {}        # run_id -> run record
_eval_runs: Dict[str, Dict[str, Any]] = {}   # eval_run_id -> eval record


# ── lazy-initialised app singleton ───────────────────────────────────────────
_graph_app = None
_corpus: List[dict] = []


def _get_graph():
    global _graph_app, _corpus
    if _graph_app is None:
        _corpus = json.loads((DATA_DIR / "corpus.json").read_text())
        retriever = TfidfRetriever(_corpus)
        _graph_app = build_graph(_corpus, retriever)
    return _graph_app


# ── FastAPI app ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="ASRE – Agentic Support Resolution Engine",
    version="1.0.0",
    description="Observability API for the ASRE LangGraph agent.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ═══════════════════════════════════════════════════════════════════════════════
# Request / Response schemas
# ═══════════════════════════════════════════════════════════════════════════════

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[str]] = []


class ChatResponse(BaseModel):
    run_id: str
    reply: str
    route: str
    execution: Dict[str, Any]


# ═══════════════════════════════════════════════════════════════════════════════
# Chat endpoint
# ═══════════════════════════════════════════════════════════════════════════════

@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    """Run a user message through the ASRE graph and return the reply."""
    run_id = str(uuid.uuid4())
    graph = _get_graph()

    try:
        result: Dict[str, Any] = graph.invoke({"query": req.message})
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

    # Determine the human-readable reply from whichever branch ran
    route = result.get("route", "unknown")
    if route == "knowledge":
        reply = result.get("answer", "I couldn't find an answer.")
    elif route == "action":
        tool_result = result.get("tool_result") or {}
        reply = tool_result.get("message", json.dumps(tool_result))
    elif route == "escalation":
        reply = "Your case has been escalated to a human agent. We'll be in touch shortly."
    else:
        reply = result.get("answer", "Something went wrong.")

    # Build execution trace record
    execution = _build_execution(run_id, req.message, result)
    _runs[run_id] = execution

    return ChatResponse(
        run_id=run_id,
        reply=reply,
        route=route,
        execution=execution,
    )


def _build_execution(run_id: str, query: str, result: Dict[str, Any]) -> Dict[str, Any]:
    """Convert raw graph state into a structured execution record."""
    route = result.get("route", "unknown")
    nodes_visited = ["router"]

    if route == "knowledge":
        nodes_visited.append("knowledge")
    elif route == "action":
        nodes_visited.append("action")
    elif route == "escalation":
        nodes_visited.append("escalation")

    # Graph nodes/edges
    node_list = [
        {"id": "router",     "label": "Router",     "type": "router"},
        {"id": "knowledge",  "label": "Knowledge",  "type": "agent"},
        {"id": "action",     "label": "Action",     "type": "agent"},
        {"id": "escalation", "label": "Escalation", "type": "agent"},
    ]
    edge_list = [
        {"source": "router", "target": "knowledge",  "label": "knowledge"},
        {"source": "router", "target": "action",     "label": "action"},
        {"source": "router", "target": "escalation", "label": "escalation"},
    ]

    # Retrieval chunks
    retrieved_doc_ids = result.get("retrieved_doc_ids") or []
    retrieval_chunks = []
    for doc_id in retrieved_doc_ids:
        match = next((d for d in _corpus if d.get("id") == doc_id), None)
        if match:
            retrieval_chunks.append({
                "id": doc_id,
                "content": match.get("content", ""),
                "score": match.get("score", None),
            })

    # Tool calls
    tool_calls = []
    if result.get("tool_called"):
        tool_calls.append({
            "name": result["tool_called"],
            "args": result.get("tool_args") or {},
            "result": result.get("tool_result") or {},
        })

    return {
        "run_id": run_id,
        "query": query,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "route": route,
        "route_confidence": result.get("route_confidence", ""),
        "nodes_visited": nodes_visited,
        "answer": result.get("answer"),
        "tool_called": result.get("tool_called"),
        "tool_args": result.get("tool_args"),
        "tool_result": result.get("tool_result"),
        "escalated": result.get("escalated", False),
        # sub-documents for inspector panels
        "graph": {"nodes": node_list, "edges": edge_list},
        "retrieval": {"chunks": retrieval_chunks},
        "tools": {"tools": tool_calls},
        "prompts": {
            "system": "You are ASRE, an agentic support resolution engine.",
            "user": query,
            "response": result,
            "tokens": {},
        },
    }


# ═══════════════════════════════════════════════════════════════════════════════
# Run inspector endpoints
# ═══════════════════════════════════════════════════════════════════════════════

def _get_run(run_id: str) -> Dict[str, Any]:
    run = _runs.get(run_id)
    if not run:
        raise HTTPException(status_code=404, detail=f"Run {run_id!r} not found")
    return run


@app.get("/runs/{run_id}/trace")
def get_trace(run_id: str):
    run = _get_run(run_id)
    return {
        "run_id": run_id,
        "query": run["query"],
        "route": run["route"],
        "nodes_visited": run["nodes_visited"],
        "timestamp": run["timestamp"],
    }


@app.get("/runs/{run_id}/graph")
def get_graph_data(run_id: str):
    run = _get_run(run_id)
    return run["graph"]


@app.get("/runs/{run_id}/retrieval")
def get_retrieval(run_id: str):
    run = _get_run(run_id)
    return run["retrieval"]


@app.get("/runs/{run_id}/tools")
def get_tools(run_id: str):
    run = _get_run(run_id)
    return run["tools"]


@app.get("/runs/{run_id}/prompts")
def get_prompts(run_id: str):
    run = _get_run(run_id)
    return run["prompts"]


# ═══════════════════════════════════════════════════════════════════════════════
# Evaluation endpoints
# ═══════════════════════════════════════════════════════════════════════════════

@app.post("/eval/run")
def trigger_eval():
    """Kick off a full golden-set evaluation run (synchronous – may take a while)."""
    from app.eval.harness import run_eval

    graph = _get_graph()
    golden_set = json.loads((DATA_DIR / "golden_set.json").read_text())

    eval_run_id = str(uuid.uuid4())
    started_at = datetime.now(timezone.utc).isoformat()

    try:
        report = run_eval(graph, golden_set)
        status = "completed"
    except Exception as exc:
        report = {}
        status = f"failed: {exc}"

    record = {
        "run_id": eval_run_id,
        "status": status,
        "started_at": started_at,
        "completed_at": datetime.now(timezone.utc).isoformat(),
        "num_cases": report.get("num_cases", 0),
        "metrics": report.get("metrics", {}),
        "cases": report.get("cases", []),
    }
    _eval_runs[eval_run_id] = record

    return {"run_id": eval_run_id, "status": status}


@app.get("/eval/runs")
def list_eval_runs(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
):
    """Paginated list of past evaluation runs (most recent first)."""
    all_runs = sorted(
        _eval_runs.values(),
        key=lambda r: r.get("started_at", ""),
        reverse=True,
    )
    start = (page - 1) * limit
    end = start + limit
    page_items = all_runs[start:end]

    # Strip per-case details from the listing – only return summary
    summary_items = [
        {k: v for k, v in r.items() if k != "cases"}
        for r in page_items
    ]
    return {"runs": summary_items, "total": len(all_runs)}


@app.get("/eval/runs/{run_id}")
def get_eval_run(run_id: str):
    """Full details (including per-case results) for one evaluation run."""
    record = _eval_runs.get(run_id)
    if not record:
        raise HTTPException(status_code=404, detail=f"Eval run {run_id!r} not found")
    return record


@app.get("/eval/golden")
def get_golden_dataset(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=200),
):
    """Paginated view of the golden dataset."""
    golden_set = json.loads((DATA_DIR / "golden_set.json").read_text())
    start = (page - 1) * limit
    end = start + limit
    return {
        "items": golden_set[start:end],
        "total": len(golden_set),
        "page": page,
        "limit": limit,
    }


# ═══════════════════════════════════════════════════════════════════════════════
# Health check
# ═══════════════════════════════════════════════════════════════════════════════

@app.get("/health")
def health():
    return {"status": "ok", "service": "asre"}
