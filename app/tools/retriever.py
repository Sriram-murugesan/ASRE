"""
TF-IDF retriever -- default retrieval backend. No network, no model download,
fully deterministic and testable offline. FAISS + sentence-transformers is
the production swap-in later, behind the same .retrieve(query, k) interface.
"""
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


class TfidfRetriever:
    def __init__(self, corpus: list):
        """corpus: list of {"id": str, "text": str}"""
        self.corpus = corpus
        self.ids = [d["id"] for d in corpus]
        texts = [d["text"] for d in corpus]
        self.vectorizer = TfidfVectorizer(stop_words="english")
        self.doc_matrix = self.vectorizer.fit_transform(texts)

    def retrieve(self, query: str, k: int = 3) -> list:
        query_vec = self.vectorizer.transform([query])
        sims = cosine_similarity(query_vec, self.doc_matrix)[0]
        ranked_idx = sims.argsort()[::-1][:k]
        return [self.ids[i] for i in ranked_idx]
