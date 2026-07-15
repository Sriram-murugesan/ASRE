"""
TF-IDF retriever -- default retrieval backend. No network, no model download,
fully deterministic and testable offline. FAISS + sentence-transformers is
the production swap-in later, behind the same .retrieve(query, k) interface.

Root-cause note (2026-07-15):
  sklearn TfidfVectorizer has NO stemming by default. This means plural/singular
  forms like "refund" vs "refunds" get different vocabulary tokens, causing 0.0
  cosine similarity even for highly relevant documents. Fixed with a custom
  tokenizer that strips common English suffixes before TF-IDF indexing.
"""
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# English stop words (subset — sklearn already has these, but we need them
# accessible in our custom tokenizer path).
_STOP_WORDS = TfidfVectorizer(stop_words="english").get_stop_words()

# Common suffixes to strip, ordered longest-first so we only strip one.
_SUFFIXES = ("ations", "ation", "tions", "tion", "ings", "ing", "ness",
             "ment", "ful", "ous", "ies", "ied", "ied", "es", "ed", "s")


def _stem(word: str) -> str:
    """
    Strip one common English suffix from *word* (very lightweight, no deps).
    Only strips if the resulting stem is at least 3 characters long so we
    don't mangle short words like "yes" → "ye".
    """
    for suffix in _SUFFIXES:
        if word.endswith(suffix):
            stem = word[: -len(suffix)]
            if len(stem) >= 3:
                return stem
    return word


def _tokenize(text: str) -> list[str]:
    """Lowercase → tokenize → remove stop words → stem."""
    tokens = re.findall(r"[a-z]+", text.lower())
    return [_stem(t) for t in tokens if t not in _STOP_WORDS and len(t) > 2]


class TfidfRetriever:
    def __init__(self, corpus: list):
        """corpus: list of {"id": str, "text": str}"""
        self.corpus = corpus
        self.ids = [d["id"] for d in corpus]
        texts = [d["text"] for d in corpus]
        # Use our custom tokenizer so "refunds" and "refund" share the same stem.
        self.vectorizer = TfidfVectorizer(analyzer=_tokenize)
        self.doc_matrix = self.vectorizer.fit_transform(texts)

    def retrieve(self, query: str, k: int = 3) -> list:
        query_vec = self.vectorizer.transform([query])
        sims = cosine_similarity(query_vec, self.doc_matrix)[0]
        ranked_idx = sims.argsort()[::-1][:k]
        # Only return docs with a non-zero similarity score so we never pass
        # completely unrelated context to the LLM.
        return [self.ids[i] for i in ranked_idx if sims[i] > 0.0]
