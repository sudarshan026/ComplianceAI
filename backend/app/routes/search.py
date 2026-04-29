"""
Search routes: semantic and keyword search across documents.
"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional

from app.database.models import User
from app.auth.dependencies import get_current_user
from app.ai_pipeline.vector_store import search as vector_search

router = APIRouter(prefix="/search", tags=["Search"])


class SearchRequest(BaseModel):
    query: str
    type: Optional[str] = None
    category: Optional[str] = None
    k: int = 10


@router.post("")
def search_documents(
    req: SearchRequest,
    current_user: User = Depends(get_current_user),
):
    """Semantic search across all indexed documents."""
    results = vector_search(req.query, k=req.k)

    # Filter by type if specified
    if req.type:
        results = [
            r for r in results
            if r.get("metadata", {}).get("filename", "").lower().endswith(f".{req.type}")
        ]

    return {
        "results": [
            {
                "document": r.get("metadata", {}).get("filename", "Unknown"),
                "chunk": r.get("content", ""),
                "score": r.get("score", 0),
                "file_type": r.get("metadata", {}).get("filename", "").rsplit(".", 1)[-1] if "." in r.get("metadata", {}).get("filename", "") else "unknown",
            }
            for r in results
        ]
    }


@router.get("/suggestions")
def search_suggestions(
    q: str = "",
    current_user: User = Depends(get_current_user),
):
    """Get search suggestions based on query prefix."""
    suggestions = [
        "compliance requirements",
        "data privacy policy",
        "employee handbook",
        "vendor agreements",
        "audit observations",
        "risk assessment",
        "security standards",
        "regulatory guidelines",
    ]
    if q:
        suggestions = [s for s in suggestions if q.lower() in s.lower()]
    return {"suggestions": suggestions[:5]}
