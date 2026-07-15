"""
Single interface every agent calls through — never the LLM provider directly.
Two backends behind an env switch (ASRE_MODE=mock|llm):

  mock: deterministic keyword-based logic, zero network calls. Lets the
        entire graph and eval harness run and be tested without an API key.
  llm:  real Groq (LLaMA 3.1) calls.

Dispatch convention for mock mode: each agent passes a system_prompt that
starts with a tag identifying which agent is calling, e.g. "[ROUTER]".
get_completion reads that tag and calls the matching mock_* function below.
This keeps ALL fake-LLM logic in this one file, auditable in one place,
instead of scattered as private helpers inside each agent module.
"""
import os
import re
import json


ASRE_MODE = os.environ.get("ASRE_MODE", "mock")


def get_completion(system_prompt: str, user_prompt: str, json_mode: bool = False) -> str:
    if ASRE_MODE == "mock":
        return _dispatch_mock(system_prompt, user_prompt, json_mode)
    elif ASRE_MODE == "llm":
        return _groq_completion(system_prompt, user_prompt, json_mode)
    else:
        raise ValueError(f"Unknown ASRE_MODE: {ASRE_MODE!r} (expected 'mock' or 'llm')")


# ---------------------------------------------------------------------------
# Mock dispatch
# ---------------------------------------------------------------------------

def _dispatch_mock(system_prompt: str, user_prompt: str, json_mode: bool) -> str:
    tag_match = re.match(r"^\[(\w+)\]", system_prompt.strip())
    if not tag_match:
        raise ValueError(
            "Mock mode requires system_prompt to start with an agent tag, "
            "e.g. '[ROUTER] ...'. Got: " + repr(system_prompt[:50])
        )
    tag = tag_match.group(1)

    handlers = {
        "ROUTER": _mock_router,
        "ACTION_TOOL": _mock_action_tool,
        "ACTION_ARGS": _mock_action_args,
        "KNOWLEDGE": _mock_knowledge_answer,
    }
    if tag not in handlers:
        raise ValueError(f"No mock handler registered for tag '[{tag}]'")

    return handlers[tag](user_prompt, json_mode)


def _mock_router(user_prompt: str, json_mode: bool) -> str:
    """
    Classifies intent into: knowledge | action | escalation.
    Deliberately conservative: escalation keywords win over everything else,
    and low-confidence / ambiguous phrasing falls to escalation rather than
    guessing — mirrors the real router's safety-valve behavior.

    KEY DESIGN: informational-phrasing detection runs BEFORE bare action
    keyword matching. A query like "what is refund policy" or "how does a
    refund work" contains the word "refund" but is semantically a knowledge
    question, not a request to perform a refund. The disambiguating signal is
    the question framing ("what is X", "how does X work", "tell me about X")
    rather than the presence of an action-adjacent noun like "refund" or
    "cancel". Only imperative / first-person-action phrasing
    ("please refund", "refund my order", "I want a refund for") should reach
    the action branch. This ordering enforces that semantic intent beats
    keyword co-occurrence.
    """
    text = user_prompt.lower()

    # Word-boundary matched (not naive substring) -- a naive "sue" in text
    # check false-fires on "issue", "tissue", "pursue", etc. \b anchors each
    # phrase to real word boundaries, including multi-word phrases.
    escalation_signals = [
        "speak to a human", "speak to someone", "manager", "lawyer", "sue",
        "furious", "unacceptable", "cancel my account", "fraud", "legal",
    ]

    # Informational-phrasing prefixes: these patterns indicate the user is
    # ASKING ABOUT a concept, not requesting that it be performed. They must
    # be checked BEFORE bare action-keyword matching to avoid false-positives
    # on action-adjacent nouns (e.g. "what is a refund?" → knowledge, NOT
    # action). Multi-word patterns use _any_word_match's \b-anchored search.
    informational_prefixes = [
        "what is", "what's", "what are", "what does",
        "how does", "how do", "how is", "how are",
        "tell me about", "explain", "do you have a", "do you offer",
        "can you explain", "what happens",
    ]

    # Expanded to cover paraphrased action intents ("call me back" is a real
    # user phrasing that plain "callback"/"book a call" missed entirely --
    # a coverage gap, not a matching-method bug). Only IMPERATIVE / first-
    # person-action phrases are listed here -- bare nouns like "refund" alone
    # no longer appear because they cause false-positives on FAQ questions.
    action_signals = [
        "please refund", "refund my", "refund the", "i want a refund",
        "i'd like a refund", "i need a refund", "give me a refund",
        "process a refund", "issue a refund", "issue me a refund",
        "charge me", "charged me",
        "book a call", "callback", "call me back", "call back",
        "create a ticket", "open a ticket",
        "cancel my order", "return my", "i want to return",
    ]
    knowledge_signals = [
        "how do i", "how does", "what is", "what's your", "pricing", "plan",
        "feature", "does it support", "documentation", "docs",
    ]

    confidence = "high"

    if _any_word_match(escalation_signals, text):
        route, confidence = "escalation", "high"
    elif "policy" in text or _any_word_match(informational_prefixes, text):
        # "policy" special-case: "refund policy" / "cancellation policy" etc.
        # contain action-adjacent nouns but are clearly FAQ questions.
        # informational_prefixes cover the broader class: "what is a refund",
        # "how does the return process work", "what are your cancel terms".
        # Both must be evaluated BEFORE action_signals to prevent the bare
        # action-noun from winning over the informational framing.
        route, confidence = "knowledge", "high"
    elif _any_word_match(action_signals, text):
        # Only reaches here when phrasing is clearly imperative / first-person
        # action ("please refund $45", "refund my order", "I want a refund for
        # order X"). Bare nouns without imperative framing don't match.
        route, confidence = "action", "high"
    elif _any_word_match(knowledge_signals, text):
        route, confidence = "knowledge", "high"
    elif _looks_like_a_question(text):
        # Generic fallback for topics with no matching keyword at all (e.g.
        # SAML, data export, account deletion). This is deliberately generic
        # rather than adding topic keywords one at a time forever -- a
        # keyword list can never have full topic coverage, but question-shape
        # is a cheap, topic-independent signal that this is a knowledge ask,
        # not noise.
        route, confidence = "knowledge", "high"
    else:
        # Nothing matched any known pattern -> genuinely ambiguous.
        # Safety valve: force escalation, mark confidence low.
        route, confidence = "escalation", "low"

    result = {"route": route, "confidence": confidence}
    return json.dumps(result) if json_mode else result["route"]


def _any_word_match(phrases: list, text: str) -> bool:
    """Word-boundary match for each phrase (handles multi-word phrases too)."""
    return any(re.search(r"\b" + re.escape(p) + r"\b", text) for p in phrases)


def _looks_like_a_question(text: str) -> bool:
    question_starters = ("what", "how", "does", "do", "can", "is", "are", "will", "why")
    stripped = text.strip()
    if not stripped:
        return False
    first_word = stripped.split()[0]
    return stripped.endswith("?") or first_word in question_starters


def _mock_action_tool(user_prompt: str, json_mode: bool) -> str:
    """Selects which action tool applies: issue_refund | create_ticket | book_callback."""
    text = user_prompt.lower()
    # Callback/ticket signals checked BEFORE the bare refund keyword: "refund"
    # can appear as incidental context in a callback/ticket request (e.g.
    # "needs a callback to discuss a refund"), and the primary requested
    # ACTION -- not every keyword present -- is what should decide the tool.
    if "callback" in text or "call me" in text or "call back" in text:
        tool = "book_callback"
    elif "refund" in text or "charge" in text:
        tool = "issue_refund"
    else:
        tool = "create_ticket"

    result = {"tool": tool}
    return json.dumps(result) if json_mode else tool


def _mock_action_args(user_prompt: str, json_mode: bool) -> str:
    """
    Extracts arguments for the selected tool. Dollar amounts MUST use an
    explicit $-prefixed regex and MUST NOT fall back to unrelated digits
    (e.g. order ID numbers) when no $ amount is present -> return None instead
    of guessing.

    FABRICATION GUARD: if no explicit $-amount exists AND the request appears
    to need a refund (the word "refund" is present), the agent must NOT invent
    a value. It returns amount=null, which the tool treats as
    "no_amount_specified" — forcing a human-reviewable failure state rather
    than a silent wrong tool-call with a hallucinated dollar figure.
    """
    dollar_match = re.search(r"\$\s?(\d+(?:\.\d{1,2})?)", user_prompt)
    amount = float(dollar_match.group(1)) if dollar_match else None
    # amount=None is the correct output when no explicit amount was stated —
    # never substitute digits from order IDs, timestamps, or any other
    # incidental numbers in the message.
    result = {"amount": amount}
    return json.dumps(result) if json_mode else json.dumps(result)


def _mock_knowledge_answer(user_prompt: str, json_mode: bool) -> str:
    """
    Placeholder mock knowledge response — the real Knowledge Agent does
    retrieval itself (TF-IDF/FAISS) and only uses get_completion to phrase
    the final answer from retrieved docs. This mock just echoes that a
    retrieval-grounded answer would go here.
    """
    answer = "Based on the retrieved documentation, here is the answer to your question."
    return json.dumps({"answer": answer}) if json_mode else answer


# ---------------------------------------------------------------------------
# Real backend
# ---------------------------------------------------------------------------

def _groq_completion(system_prompt: str, user_prompt: str, json_mode: bool) -> str:
    try:
        from groq import Groq
    except ImportError:
        raise ImportError(
            "groq package not installed. Run: pip install groq --break-system-packages"
        )

    client = Groq(api_key=os.environ["GROQ_API_KEY"])
    kwargs = {}
    if json_mode:
        kwargs["response_format"] = {"type": "json_object"}

    # Strip the internal [TAG] prefix before sending to the real model --
    # it's a mock-dispatch artifact, not something the LLM should see.
    clean_system_prompt = re.sub(r"^\[\w+\]\s*", "", system_prompt.strip())

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": clean_system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        **kwargs,
    )
    return response.choices[0].message.content
