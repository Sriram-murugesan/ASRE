"""
Tool registry for the Action Agent. Each tool is a plain function taking
a dict of args and returning a result dict. In mock mode these don't touch
any real system — they just return a deterministic "would have done X" record,
which is exactly what the eval harness's tool-argument-accuracy metric checks
against the golden set's expected args.
"""


def issue_refund(args: dict) -> dict:
    amount = args.get("amount")
    if amount is None:
        return {"status": "failed", "reason": "no_amount_specified", "amount": None}
    return {"status": "success", "amount": amount}


def create_ticket(args: dict) -> dict:
    return {"status": "success", "ticket_id": "MOCK-TICKET-0001"}


def book_callback(args: dict) -> dict:
    return {"status": "success", "callback_id": "MOCK-CALLBACK-0001"}


TOOL_REGISTRY = {
    "issue_refund": issue_refund,
    "create_ticket": create_ticket,
    "book_callback": book_callback,
}
