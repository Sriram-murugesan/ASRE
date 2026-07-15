"""
CLI entry point for ASRE.

Usage:
    asre chat "How do I upgrade my plan?"
    asre eval                      # run the golden set through the graph, print report
    asre eval --out report.json    # also write full per-case detail to disk
"""
import argparse
import json
import os
import sys
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

from app.tools.retriever import TfidfRetriever
from app.graph.build_graph import build_graph

DATA_DIR = Path(__file__).resolve().parent.parent / "data"


def _load_corpus():
    return json.loads((DATA_DIR / "corpus.json").read_text())


def _build_app():
    corpus = _load_corpus()
    retriever = TfidfRetriever(corpus)
    return build_graph(corpus, retriever), corpus


def cmd_chat(args):
    app, _ = _build_app()
    result = app.invoke({"query": args.query})
    print(json.dumps(result, indent=2))


def cmd_eval(args):
    from app.eval.harness import run_eval

    app, corpus = _build_app()
    golden_set = json.loads((DATA_DIR / "golden_set.json").read_text())

    report = run_eval(app, golden_set)

    from app.eval.report import print_summary
    print_summary(report)

    if args.out:
        Path(args.out).write_text(json.dumps(report, indent=2))
        print(f"\nFull report written to {args.out}")


def main():
    parser = argparse.ArgumentParser(prog="asre")
    sub = parser.add_subparsers(dest="command", required=True)

    chat_p = sub.add_parser("chat", help="Send a single query through the graph")
    chat_p.add_argument("query", type=str)
    chat_p.set_defaults(func=cmd_chat)

    eval_p = sub.add_parser("eval", help="Run the golden set eval harness")
    eval_p.add_argument("--out", type=str, default=None, help="Path to write full JSON report")
    eval_p.set_defaults(func=cmd_eval)

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
