"""
FAISS vector store management.
Handles index creation, document addition/removal, persistence, and retrieval.
"""
import json
import logging
from pathlib import Path
import numpy as np
import faiss

from app.config import VECTOR_DB_DIR
from app.ai_pipeline.embeddings import generate_embeddings, generate_single_embedding

logger = logging.getLogger(__name__)

INDEX_PATH = VECTOR_DB_DIR / "faiss.index"
METADATA_PATH = VECTOR_DB_DIR / "metadata.json"

_index = None
_metadata: list[dict] = []


def _get_dimension() -> int:
    """Get embedding dimension from model."""
    test_emb = generate_single_embedding("test")
    return len(test_emb)


def load_index():
    """Load FAISS index and metadata from disk."""
    global _index, _metadata

    if INDEX_PATH.exists() and METADATA_PATH.exists():
        logger.info("Loading FAISS index from disk")
        _index = faiss.read_index(str(INDEX_PATH))
        with open(METADATA_PATH, "r") as f:
            _metadata = json.load(f)
        logger.info(f"Loaded index with {_index.ntotal} vectors")
    else:
        dim = _get_dimension()
        _index = faiss.IndexFlatL2(dim)
        _metadata = []
        logger.info(f"Created new FAISS index with dimension {dim}")


def save_index():
    """Persist FAISS index and metadata to disk."""
    global _index, _metadata
    if _index is not None:
        faiss.write_index(_index, str(INDEX_PATH))
        with open(METADATA_PATH, "w") as f:
            json.dump(_metadata, f)
        logger.info(f"Saved index with {_index.ntotal} vectors")


def add_documents(chunks: list[dict]):
    """
    Add document chunks to the vector store.
    Each chunk should have 'content' and 'metadata' keys.
    """
    global _index, _metadata

    if _index is None:
        load_index()

    texts = [c["content"] for c in chunks]
    embeddings = generate_embeddings(texts)
    vectors = np.array(embeddings, dtype="float32")

    _index.add(vectors)
    _metadata.extend(chunks)
    save_index()

    logger.info(f"Added {len(chunks)} chunks to index. Total: {_index.ntotal}")


def remove_document(doc_id: str):
    """
    Remove all chunks for a document and rebuild the index.
    FAISS doesn't support deletion, so we rebuild.
    """
    global _index, _metadata

    if _index is None:
        load_index()

    # Filter out chunks belonging to the document
    remaining = [m for m in _metadata if m.get("metadata", {}).get("doc_id") != doc_id]

    if len(remaining) == len(_metadata):
        return  # Nothing to remove

    # Rebuild index
    dim = _index.d
    _index = faiss.IndexFlatL2(dim)
    _metadata = remaining

    if remaining:
        texts = [c["content"] for c in remaining]
        embeddings = generate_embeddings(texts)
        vectors = np.array(embeddings, dtype="float32")
        _index.add(vectors)

    save_index()
    logger.info(f"Removed document {doc_id}. Remaining vectors: {_index.ntotal}")


def search(query: str, k: int = 5) -> list[dict]:
    """
    Search the vector store for relevant chunks.
    Returns list of dicts with 'content', 'metadata', and 'score'.
    """
    global _index, _metadata

    if _index is None:
        load_index()

    if _index.ntotal == 0:
        return []

    query_embedding = generate_single_embedding(query)
    query_vector = np.array([query_embedding], dtype="float32")

    k = min(k, _index.ntotal)
    distances, indices = _index.search(query_vector, k)

    results = []
    for dist, idx in zip(distances[0], indices[0]):
        if idx < len(_metadata):
            result = _metadata[idx].copy()
            result["score"] = float(1 / (1 + dist))  # Convert distance to similarity score
            results.append(result)

    return results


def get_index_stats() -> dict:
    """Get statistics about the vector store."""
    global _index, _metadata
    if _index is None:
        load_index()
    return {
        "total_vectors": _index.ntotal if _index else 0,
        "total_documents": len(set(m.get("metadata", {}).get("doc_id", "") for m in _metadata)),
    }
