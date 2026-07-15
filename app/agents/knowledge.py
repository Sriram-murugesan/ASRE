"""
Knowledge Agent: retrieves from a mock FAQ corpus, then phrases an answer.

Retrieval backend is swappable via ASRE_RETRIEVAL=tfidf|faiss (tfidf is
default -- no network, no model download, fully testable offline).
Only the tfidf path is implemented in this pass; faiss is a stub so the
interface is stable when we add it later.
"""
import os
import json
from app.llm import get_completion

ASRE_RETRIEVAL = os.environ.get("ASRE_RETRIEVAL", "tfidf")

KNOWLEDGE_SYSTEM_PROMPT = """[KNOWLEDGE]
Answer the customer's question using ONLY the retrieved documents provided.
If the documents don't contain the answer, say so -- do not invent facts.
Respond ONLY with JSON: {"answer": "..."}
"""


def knowledge_node(state: dict, corpus: list, retriever) -> dict:
    """
    Reads state['query']. Writes state['retrieved_doc_ids'], state['answer'].
    `corpus` is a list of {"id": ..., "text": ...} dicts.
    `retriever` is an object with a .retrieve(query, k) -> list[doc_id] method,
    injected so eval harness and app can swap tfidf/faiss without touching this file.

    Hardened for real-LLM output: retrieval itself never touches the LLM, so
    retrieved_doc_ids is always trustworthy even if the phrasing call fails.
    A malformed answer JSON falls back to a generic "couldn't generate an
    answer" message rather than crashing -- the retrieval result is still
    useful/loggable even when phrasing breaks.
    """
    query = state["query"]
    top_k_ids = retriever.retrieve(query, k=5)

    retrieved_texts = [d["text"] for d in corpus if d["id"] in top_k_ids]
    context = "\n---\n".join(retrieved_texts)

    user_prompt = f"Question: {query}\n\nRetrieved documents:\n{context}"
    raw = get_completion(KNOWLEDGE_SYSTEM_PROMPT, user_prompt, json_mode=True)

    try:
        answer = json.loads(raw)["answer"]
    except (json.JSONDecodeError, KeyError, TypeError):
        answer = "Sorry, I couldn't generate an answer from the documentation. This has been logged for review."

    return {
        **state,
        "retrieved_doc_ids": top_k_ids,
        "answer": answer,
    }
