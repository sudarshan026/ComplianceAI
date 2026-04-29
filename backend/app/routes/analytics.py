"""
Analytics routes: dashboard stats, query frequency, compliance metrics.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database.models import get_db, User, Document, QueryLog, Conversation
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/overview")
def get_overview(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get dashboard overview statistics."""
    total_docs = db.query(Document).filter(Document.user_id == current_user.id).count()
    total_queries = db.query(QueryLog).filter(QueryLog.user_id == current_user.id).count()
    indexed_docs = db.query(Document).filter(
        Document.user_id == current_user.id,
        Document.status == "indexed",
    ).count()

    # Simple compliance score based on indexed vs total
    compliance_score = round((indexed_docs / max(total_docs, 1)) * 100, 1) if total_docs > 0 else 0.0

    # Count documents with processing errors as "risks"
    active_risks = db.query(Document).filter(
        Document.user_id == current_user.id,
        Document.status == "error",
    ).count()

    return {
        "total_documents": total_docs,
        "total_queries": total_queries,
        "compliance_score": compliance_score,
        "active_risks": active_risks,
    }


@router.get("/queries")
def get_query_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get query frequency analytics."""
    logs = db.query(QueryLog).filter(
        QueryLog.user_id == current_user.id
    ).order_by(QueryLog.timestamp.desc()).limit(100).all()

    return {
        "queries": [
            {"query": l.query, "timestamp": l.timestamp.isoformat() if l.timestamp else ""}
            for l in logs
        ]
    }


@router.get("/compliance")
def get_compliance_metrics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get compliance risk distribution."""
    docs = db.query(Document).filter(Document.user_id == current_user.id).all()

    status_counts = {}
    for doc in docs:
        status_counts[doc.status] = status_counts.get(doc.status, 0) + 1

    return {
        "distribution": status_counts,
        "total_documents": len(docs),
    }
