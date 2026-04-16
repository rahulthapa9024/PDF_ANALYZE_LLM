from sentence_transformers import SentenceTransformer

# BAAI/bge-small-en-v1.5 is a top-tier embedding model for its size, much better at retrieval than MiniLM
model = SentenceTransformer("BAAI/bge-small-en-v1.5")

def get_embedding(texts):
    # normalize_embeddings=True scales the vectors to a length of 1.
    # This is required so that Inner Product (Dot Product) works purely as Cosine Similarity.
    return model.encode(texts, normalize_embeddings=True)