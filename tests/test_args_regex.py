"""Quick test: dollar regex in _mock_action_args."""
from app.llm import _mock_action_args

cases = [
    ("Please refund $45.50 for order 88213", 45.5),
    ("I was charged $99.00 twice, please refund one of them", 99.0),
    ("Please issue a refund of $12 for my last charge", 12.0),
    ("Refund $200 for order 55510, thanks", 200.0),
    ("Can you refund me for order number 88213, I don't have the exact amount", None),
    ("I want a refund", None),
]

import json
all_pass = True
for query, expected_amount in cases:
    result = json.loads(_mock_action_args(query, json_mode=True))
    got = result["amount"]
    ok = got == expected_amount
    all_pass = all_pass and ok
    status = "PASS" if ok else "FAIL"
    print(f"[{status}] amount={got!r} (expected {expected_amount!r}) | {query[:60]}")

print()
print("All pass:", all_pass)
