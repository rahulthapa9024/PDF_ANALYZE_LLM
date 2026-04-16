from .embedding import get_embedding
from .vectordb import search
from sentence_transformers import CrossEncoder

# CrossEncoder for precise re-ranking
reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")

def retrieve(query, top_k=3, fetch_k=10):
    query_embedding = get_embedding([query])
    results = search(query_embedding, top_k=fetch_k)

    if not results:
        return ""

    if len(results) <= top_k:
        return "\n\n".join(results)

    pairs = [[query, doc] for doc in results]
    scores = reranker.predict(pairs)

    scored_results = sorted(zip(scores, results), key=lambda x: x[0], reverse=True)

    best_results = []
    for score, doc in scored_results:
        if score > 0.3:
            best_results.append(doc)
        if len(best_results) == top_k:
            break

    # 🔥 fallback
    if not best_results:
        best_results = [doc for _, doc in scored_results[:top_k]]

    # 🔥 deduplicate
    seen = set()
    unique_results = []
    for doc in best_results:
        if doc not in seen:
            unique_results.append(doc)
            seen.add(doc)

    # 🔥 structured context
    context = ""
    for i, doc in enumerate(unique_results):
        context += f"[Context {i+1}]\n{doc}\n\n"

    return context
    # 1. Broad fetch from VectorDB using Cosine Similarity
    query_embedding = get_embedding([query])
    results = search(query_embedding, top_k=fetch_k)

    if not results:
        return ""

    if len(results) <= top_k:
        return "\n\n".join(results)

    # 2. Re-rank using CrossEncoder (extremely high precision)
    pairs = [[query, doc] for doc in results]
    scores = reranker.predict(pairs)

    # Sort results by score descending
    scored_results = sorted(zip(scores, results), key=lambda x: x[0], reverse=True)

    best_results = []
    for score, doc in scored_results:
        if score > 0.3:   # tune between 0.25–0.4
            best_results.append(doc)
        if len(best_results) == top_k:
            break

    return "\n\n".join(best_results)