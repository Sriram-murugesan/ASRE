"""
Human-readable summary printer. Always regenerated from the current report
-- never hand-write or reuse a prose summary from a previous run, since a
stale description of a since-fixed problem is actively misleading.
"""


def print_summary(report: dict) -> None:
    print(f"ASRE Eval Report -- {report['num_cases']} golden cases\n")
    print("=" * 60)

    m = report["metrics"]

    _print_metric("1. Routing accuracy", m["routing_accuracy"])
    _print_metric("2. Tool-call accuracy (right tool selected)", m["tool_call_accuracy"])
    _print_metric("3. Tool-argument accuracy (right args, independent of #2)", m["tool_argument_accuracy"])
    _print_metric("4. Retrieval recall@k", m["retrieval_recall_at_k"])

    esc = m["escalation_safety_rate"]
    _print_metric("5. Escalation safety rate (ground-truth labeled)", esc)
    if esc.get("false_negatives"):
        print(f"   ⚠ SAFETY FAILURE -- missed escalation-worthy cases: {esc['false_negatives']}")

    print("=" * 60)

    failed_cases = [c for c in report["cases"] if c["route_correct"] is False]
    if failed_cases:
        print(f"\n{len(failed_cases)} routing failures:")
        for c in failed_cases:
            print(f"  [{c['id']}] expected={c['expected_route']} got={c['predicted_route']} -- {c['query']!r}")
            if c.get("note"):
                print(f"      note: {c['note']}")


def _print_metric(label: str, metric: dict) -> None:
    if metric["score"] is None:
        print(f"{label}: N/A ({metric.get('note', 'no applicable cases')})")
        return
    pct = metric["score"] * 100
    n = metric["n"]
    correct = metric.get("correct", metric.get("caught"))
    print(f"{label}: {pct:.1f}%  ({correct}/{n})")
