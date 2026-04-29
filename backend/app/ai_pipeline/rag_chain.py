"""
RAG chain: Retrieval-Augmented Generation using Groq LLM.
Retrieves relevant chunks from FAISS, builds context, and generates answers.
"""
import logging
from groq import Groq

from app.config import GROQ_API_KEY, GROQ_MODEL
from app.ai_pipeline.vector_store import search as vector_search

logger = logging.getLogger(__name__)

_client = None


def _get_groq_client() -> Groq:
    """Get or create Groq client."""
    global _client
    if _client is None:
        if not GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY is not set. Please set it in your .env file.")
        _client = Groq(api_key=GROQ_API_KEY)
    return _client


def build_context(chunks: list[dict]) -> str:
    """Build context string from retrieved chunks."""
    context_parts = []
    for i, chunk in enumerate(chunks, 1):
        meta = chunk.get("metadata", {})
        filename = meta.get("filename", "Unknown")
        context_parts.append(f"[Source {i}: {filename}]\n{chunk['content']}")
    return "\n\n---\n\n".join(context_parts)


def query_rag(question: str, k: int = 5) -> dict:
    """
    Execute a RAG query:
    1. Retrieve relevant chunks from vector store
    2. Build context from chunks
    3. Generate answer using Groq LLM
    4. Return answer with source citations

    Returns dict with 'answer', 'sources', 'context_used'.
    """
    # Retrieve relevant chunks
    chunks = vector_search(question, k=k)

    if not chunks:
        return {
            "answer": "I don't have any documents to reference. Please upload compliance documents first, and I'll be able to answer your questions based on their content.",
            "sources": [],
            "context_used": False,
        }

    # Build context
    context = build_context(chunks)

    # Build prompt
    system_prompt = """You are ComplianceAI, an expert AI assistant specializing in compliance, policy analysis, and audit intelligence. 
You answer questions based ONLY on the provided document context. 

Rules:
1. Answer based strictly on the provided context. Do not make up information.
2. If the context doesn't contain enough information, say so clearly.
3. Cite which source documents your answer comes from.
4. Use clear, professional language suitable for enterprise compliance teams.
5. When identifying risks or compliance issues, be specific and actionable.
6. Format your response with markdown for readability (headers, bullet points, bold text)."""

    user_prompt = f"""Context from uploaded documents:
{context}

---

Question: {question}

Please provide a comprehensive answer based on the document context above. Cite your sources."""

    try:
        client = _get_groq_client()
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.3,
            max_tokens=2048,
        )

        answer = response.choices[0].message.content

        # Build source citations
        sources = []
        seen = set()
        for chunk in chunks:
            meta = chunk.get("metadata", {})
            filename = meta.get("filename", "Unknown")
            if filename not in seen:
                seen.add(filename)
                sources.append({
                    "document": filename,
                    "chunk": chunk["content"][:100] + "...",
                    "score": chunk.get("score", 0),
                })

        return {
            "answer": answer,
            "sources": sources,
            "context_used": True,
        }

    except Exception as e:
        logger.error(f"RAG query error: {e}")
        return {
            "answer": f"I encountered an error generating a response: {str(e)}. Please check that your GROQ_API_KEY is set correctly.",
            "sources": [],
            "context_used": False,
        }
