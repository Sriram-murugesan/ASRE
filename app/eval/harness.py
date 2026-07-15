"""
Eval harness: runs the golden set through the compiled graph and scores
5 SEPARATE, NEVER-AVERAGED metrics. Each metric checks a different failure
mode; blending them into one number would hide which specific thing broke.
"""
from typing import Any


def run_eval(app, golden_set: list) -> dict:
    per_case = []

    for i, case in enumerate(golden_set, start=1):
     print(f"Running case {i}/{len(golden_set)}: {case['query']}")
     result = app.invoke({"query": case["query"]})
     per_case.append(_score_case(case, result))

    report = {
        "num_cases": len(golden_set),
        "metrics": {
            "routing_accuracy": _aggregate(per_case, "route_correct"),
            "tool_call_accuracy": _aggregate(per_case, "tool_correct", only_if="has_expected_tool"),
            "tool_argument_accuracy": _aggregate(per_case, "args_correct", only_if="has_expected_tool"),
            "retrieval_recall_at_k": _aggregate(per_case, "retrieval_correct", only_if="is_knowledge_case"),
            "escalation_safety_rate": _escalation_safety(per_case),
        },
        "cases": per_case,
    }
    return report


def _score_case(case: dict, result: dict) -> dict:
    predicted_route = result.get("route")
    expected_route = case["expected_route"]
    route_correct = predicted_route == expected_route

    has_expected_tool = case.get("expected_tool") is not None
    tool_correct = None
    args_correct = None
    if has_expected_tool:
        predicted_tool = result.get("tool_called")
        tool_correct = predicted_tool == case["expected_tool"]
        # Kept fully independent of tool_correct: even if the wrong tool was
        # called, we still record whether the ARGS extracted match what was
        # expected FOR THE EXPECTED tool's args shape. A wrong tool with
        # "correct-looking" args is still a real failure, so tool_correct
        # gates nothing here -- both are computed and reported separately.
        args_correct = result.get("tool_args") == case["expected_args"]

    is_knowledge_case = expected_route == "knowledge" and bool(case.get("expected_doc_ids"))
    retrieval_correct = None
    if is_knowledge_case:
        retrieved = result.get("retrieved_doc_ids", []) or []
        retrieval_correct = any(doc_id in retrieved for doc_id in case["expected_doc_ids"])

    return {
        "id": case["id"],
        "query": case["query"],
        "expected_route": expected_route,
        "predicted_route": predicted_route,
        "route_correct": route_correct,
        "has_expected_tool": has_expected_tool,
        "tool_correct": tool_correct,
        "args_correct": args_correct,
        "is_knowledge_case": is_knowledge_case,
        "retrieval_correct": retrieval_correct,
        "escalation_worthy_ground_truth": case.get("escalation_worthy_ground_truth", False),
        "was_escalated": bool(result.get("escalated", False)),
        "note": case.get("note"),
    }


def _aggregate(per_case: list, field: str, only_if: str = None) -> dict:
    if only_if:
        relevant = [c for c in per_case if c.get(only_if)]
    else:
        relevant = per_case

    if not relevant:
        return {"score": None, "n": 0, "correct": 0, "note": "no applicable cases in golden set"}

    correct = sum(1 for c in relevant if c[field])
    return {"score": correct / len(relevant), "n": len(relevant), "correct": correct}


def _escalation_safety(per_case: list) -> dict:
    """
    Ground-truth-labeled definition (per Sriram's decision): scored against
    every case labeled escalation-worthy in the golden set, REGARDLESS of
    which route the system actually took -- not just cases that reached the
    Escalation Agent node. This is what lets the metric catch a false
    negative (an escalation-worthy case that got silently auto-resolved),
    which is the failure mode the brief calls categorically worse than a
    false positive.
    """
    ground_truth_positive = [c for c in per_case if c["escalation_worthy_ground_truth"]]
    if not ground_truth_positive:
        return {"score": None, "n": 0, "note": "no escalation-worthy cases labeled in golden set"}

    caught = sum(1 for c in ground_truth_positive if c["was_escalated"])
    missed = [c["id"] for c in ground_truth_positive if not c["was_escalated"]]

    return {
        "score": caught / len(ground_truth_positive),
        "n": len(ground_truth_positive),
        "caught": caught,
        "false_negatives": missed,  # the categorically-worse failure -- always surfaced by id, never buried in the average
    }
