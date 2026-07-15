# ASRE — Agentic Support Resolution Engine

> A production-quality multi-agent customer support system built to demonstrate rigorous, **five-metric non-averaged evaluation** of non-deterministic AI systems — paired with a full-featured React observability dashboard for inspecting every agent execution in detail.

---

## Overview

Most AI agent projects treat evaluation as a bolt-on afterthought — one averaged accuracy number that hides every individual failure mode. ASRE inverts this: the evaluation harness is the point of the project.

The backend is a LangGraph multi-agent pipeline. The frontend is a dark-themed observability platform — comparable to LangSmith — that surfaces execution graphs, retrieval chunks, tool call details, prompt chains, and evaluation results as distinct, inspectable artifacts.

---

## Architecture

```
START → Router → conditional route → { Knowledge | Action | Escalation } → END
```

| Node | Responsibility |
|------|----------------|
| **Router** | Classifies intent into `knowledge`, `action`, or `escalation`. Low-confidence predictions force escalation rather than risking a bad automated answer. |
| **Knowledge** | TF-IDF retrieval (offline by default) over a mock 15-doc FAQ corpus. Answer is phrased strictly from retrieved documents. |
| **Action** | Tool *selection* (`issue_refund`, `create_ticket`, `book_callback`) and argument *extraction* are **two separate model calls**, scored independently — a system can pick the right tool and still extract the wrong refund amount. |
| **Escalation** | Hands off to a human agent; never attempts to auto-resolve. |

---

## Evaluation — 5 Metrics, Never Averaged

| # | Metric | What It Catches |
|---|--------|-----------------|
| 1 | **Routing Accuracy** | Wrong intent classification |
| 2 | **Tool-Call Accuracy** | Right tool selected for the job |
| 3 | **Tool-Argument Accuracy** | Correct args extracted (independent of metric 2) |
| 4 | **Retrieval Recall@k** | Relevant chunks surfaced from the knowledge base |
| 5 | **Escalation Safety Rate** | Scored against *every case labeled escalation-worthy* regardless of the route actually taken — catches false negatives (cases that silently auto-resolved when they should have been escalated). False negatives are surfaced by case ID, never buried in an average. |

---

## Tech Stack

### Backend
| Layer | Technology |
|-------|------------|
| Agent framework | LangGraph ≥ 0.2 |
| LLM provider | Groq (llama-3.1-8b-instant) |
| Retrieval | TF-IDF (default, offline) / FAISS (optional) |
| Language | Python ≥ 3.10 |
| CLI | `asre` entry point via `pyproject.toml` |

### Frontend
| Layer | Technology |
|-------|------------|
| Framework | React 19 + Vite 8 |
| Routing | React Router DOM |
| Styling | TailwindCSS v4 (strict dark theme) |
| State | Context API (`ChatContext`, `EvaluationContext`, `ToastContext`) |
| Data fetching | Axios (with interceptors) |
| Graph viz | React Flow |
| Charts | Recharts |
| Animations | Framer Motion |
| Icons | Lucide React |

---

## Project Structure

```
asre/
│
├── app/                          # Python backend
│   ├── agents/
│   │   ├── router.py             # Intent classifier node
│   │   ├── knowledge.py          # TF-IDF retrieval + answer generation node
│   │   ├── action.py             # Tool selection + argument extraction node
│   │   └── escalation.py         # Human handoff node
│   ├── graph/                    # LangGraph wiring (pipeline assembly)
│   ├── tools/
│   │   ├── registry.py           # Tool definitions (issue_refund, create_ticket, book_callback)
│   │   └── retriever.py          # TF-IDF / FAISS retrieval interface
│   ├── eval/
│   │   ├── harness.py            # 5-metric evaluation runner
│   │   └── report.py             # CLI report printer
│   ├── llm.py                    # Unified get_completion() — mock | llm switch
│   └── cli.py                    # `asre` command entry point
│
├── data/
│   ├── corpus.json               # Mock FAQ knowledge base (15 documents)
│   └── golden_set.json           # 30 hand-labeled evaluation cases
│
├── frontend/                     # React observability dashboard
│   ├── src/
│   │   ├── components/
│   │   │   ├── chat/
│   │   │   │   ├── ChatBubble.jsx
│   │   │   │   ├── ChatInput.jsx
│   │   │   │   └── ExecutionPanel.jsx    # Step-by-step agent trace
│   │   │   ├── common/
│   │   │   │   ├── ErrorBoundary.jsx
│   │   │   │   └── Skeleton.jsx          # Loading state components
│   │   │   ├── dashboard/
│   │   │   │   ├── Charts.jsx            # Radar, Bar, Trend charts
│   │   │   │   └── RecentRunsTable.jsx
│   │   │   ├── evaluation/
│   │   │   │   ├── EvaluationCharts.jsx  # Evaluation progress line chart
│   │   │   │   ├── EvaluationTable.jsx   # Paginated run history table
│   │   │   │   ├── FailureExplorer.jsx   # Expected vs. actual diff view
│   │   │   │   └── GoldenDatasetTable.jsx
│   │   │   ├── graph/
│   │   │   │   └── CustomNode.jsx        # React Flow node card
│   │   │   ├── layout/
│   │   │   │   ├── MainLayout.jsx        # Page transition wrapper
│   │   │   │   ├── Navbar.jsx
│   │   │   │   └── Sidebar.jsx
│   │   │   ├── llm/
│   │   │   │   └── CodeBlock.jsx         # Syntax viewer with copy button
│   │   │   ├── retrieval/
│   │   │   │   └── RetrievalChunk.jsx    # Similarity score bar + chunk viewer
│   │   │   ├── tool/
│   │   │   │   └── ToolCallCard.jsx      # Expandable args + result card
│   │   │   └── ui/
│   │   │       ├── Card.jsx
│   │   │       ├── MetricCard.jsx
│   │   │       ├── ProgressRing.jsx
│   │   │       └── StatusBadge.jsx
│   │   ├── context/
│   │   │   ├── ChatContext.jsx           # Chat state + chatService integration
│   │   │   ├── EvaluationContext.jsx     # Eval state + evaluationService integration
│   │   │   └── ToastContext.jsx          # Toast notification system
│   │   ├── pages/
│   │   │   ├── Chat.jsx                  # Live chat + execution panel split view
│   │   │   ├── Dashboard.jsx             # Metric cards + charts overview
│   │   │   ├── EvaluationDashboard.jsx   # Eval metrics + run history table
│   │   │   ├── EvaluationDetails.jsx     # Per-case failure explorer
│   │   │   ├── ExecutionGraph.jsx        # React Flow LangGraph trace
│   │   │   ├── NotFound.jsx
│   │   │   ├── PromptInspector.jsx       # Token stats + prompt chain viewer
│   │   │   ├── RetrievalViewer.jsx       # Knowledge chunk inspector
│   │   │   ├── Settings.jsx              # Platform configuration
│   │   │   └── ToolInspector.jsx         # Tool call args + results
│   │   ├── services/
│   │   │   ├── api.js                    # Axios instance + interceptors
│   │   │   ├── chatService.js
│   │   │   ├── evaluationService.js
│   │   │   └── graphService.js
│   │   ├── App.jsx                       # Provider tree root
│   │   ├── routes.jsx                    # React Router route definitions
│   │   ├── main.jsx
│   │   └── index.css                     # TailwindCSS + dark theme tokens
│   ├── package.json
│   └── vite.config.js
│
├── tests/
├── pyproject.toml
├── .env.example
└── README.md
```

---

## Getting Started

### Prerequisites

- Python ≥ 3.10
- Node.js ≥ 18
- npm ≥ 9

---

### 1 · Backend Setup

```bash
# Clone the repository
git clone <repo-url>
cd asre

# Install the Python package (editable mode)
pip install -e .

# Copy and configure environment variables
cp .env.example .env
```

Open `.env` and configure:

```env
# Use 'mock' for zero network calls (default) or 'llm' for real Groq calls
ASRE_MODE=mock

# Use 'tfidf' (offline, default) or 'faiss' (requires extra install)
ASRE_RETRIEVAL=tfidf

# Required only when ASRE_MODE=llm
GROQ_API_KEY=your_groq_api_key_here
```

For production retrieval (FAISS + sentence-transformers):

```bash
pip install -e ".[production-retrieval]"
```

---

### 2 · Run the Backend CLI

```bash
# Chat with the agent
asre chat "How do I upgrade my plan?"
asre chat "I need a refund for order ORD-123"

# Run the 5-metric evaluation suite
asre eval

# Write full per-case results to JSON
asre eval --out report.json
```

---

### 3 · Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The dashboard will be available at **http://localhost:5173**

To connect to a live backend, set the API URL in `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Without a backend, all pages display rich mock data and the chat will show a graceful offline message.

---

### 4 · Production Build

```bash
cd frontend
npm run build
# Output in frontend/dist/
```

---

## Frontend Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Dashboard | KPI metric cards, radar chart, bar chart, trend line, recent runs table |
| `/chat` | Live Chat | Split-pane: chat on left, step-by-step execution trace on right |
| `/graph` | Execution Graph | Interactive React Flow DAG of the LangGraph execution path; click any node to inspect state |
| `/evaluation` | Evaluation Dashboard | 5-metric cards, evaluation progress chart, paginated run history table |
| `/evaluation/:id` | Evaluation Details | Failure Explorer — expected vs. actual diff for routing, tool, args, retrieval |
| `/retrieval` | Retrieval Viewer | Knowledge chunks ranked by similarity score, expandable with highlighted match text |
| `/tool` | Tool Inspector | All tool calls with arguments, execution time, and raw results |
| `/prompts` | Prompt Inspector | Token usage, distribution bar, tabbed System / User / LLM Response viewer |
| `/settings` | Settings | Backend URL, model, temperature, confidence threshold, notification toggles |

---

## Environment Variables Reference

### Backend (`.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `ASRE_MODE` | `mock` | `mock` — deterministic, zero network calls. `llm` — real Groq API calls. |
| `ASRE_RETRIEVAL` | `tfidf` | `tfidf` — offline, no model download. `faiss` — dense retrieval (requires extra deps). |
| `GROQ_API_KEY` | — | Required only when `ASRE_MODE=llm`. |
| `SUPABASE_URL` | — | Optional. For run logging to Supabase. |
| `SUPABASE_KEY` | — | Optional. Supabase service role key. |

### Frontend (`frontend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `http://localhost:8000` | Base URL for the ASRE FastAPI backend. |

---

## Optional Dependencies

```bash
# Streamlit dashboard (alternative UI)
pip install -e ".[dashboard]"

# FAISS production retrieval
pip install -e ".[production-retrieval]"

# Supabase run logging
pip install -e ".[db]"

# Test suite
pip install -e ".[dev]"
pytest
```

---

## Status

| Feature | Status |
|---------|--------|
| LangGraph pipeline (Router → Knowledge / Action / Escalation) | ✅ Complete |
| 5-metric evaluation harness (30-case golden set) | ✅ Complete |
| React observability dashboard (12 pages) | ✅ Complete |
| Mock mode (zero network calls, fully offline) | ✅ Complete |
| Groq LLM integration (`ASRE_MODE=llm`) | ⚠️ Integrated, needs end-to-end testing |
| FAISS dense retrieval | ⚠️ Stubbed, not fully implemented |
| FastAPI REST server (for frontend ↔ backend live data) | 🔲 Planned |
| Supabase run logging | 🔲 Planned |
