import faiss
import numpy as np
import json
import os

dimension = 384
# Inner Product used for Cosine Similarity (assuming normalized embeddings)
index = faiss.IndexFlatIP(dimension)

documents = []

DB_PATH = "my_index.faiss"
DOCS_PATH = "documents.json"

def init_db():
    global index, documents
    if os.path.exists(DB_PATH) and os.path.exists(DOCS_PATH):
        index = faiss.read_index(DB_PATH)
        with open(DOCS_PATH, "r") as f:
            documents = json.load(f)
        print(f"[RAG] Loaded existing vector index with {index.ntotal} documents.")

def save_db():
    faiss.write_index(index, DB_PATH)
    with open(DOCS_PATH, "w") as f:
        json.dump(documents, f)

def add_to_index(embeddings, chunks):
    vectors = np.array(embeddings).astype("float32")
    index.add(vectors)
    documents.extend(chunks)
    # Persist the database
    save_db()

def search(query_embedding, top_k=10):
    if index.ntotal == 0:
        return []

    query_vector = np.array(query_embedding).astype("float32")
    # Ensure shape is (1, dim) instead of (dim,)
    if query_vector.ndim == 1:
        query_vector = np.expand_dims(query_vector, axis=0)

    # Search
    distances, indices = index.search(query_vector, top_k)

    results = []
    for i in indices[0]:
        if 0 <= i < len(documents):
            results.append(documents[i])

    return results