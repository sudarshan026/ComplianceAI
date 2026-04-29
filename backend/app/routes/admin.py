"""
Admin routes: user management, query logs, and indexing status.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.models import get_db, User, Document, QueryLog
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/admin", tags=["Admin"])


def _require_admin(user: User):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")


@router.get("/users")
def list_users(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all users (admin only)."""
    _require_admin(current_user)
    users = db.query(User).order_by(User.created_at.desc()).all()
    return {
        "users": [
            {
                "id": u.id,
                "name": u.name,
                "email": u.email,
                "role": u.role,
                "created_at": u.created_at.isoformat() if u.created_at else "",
            }
            for u in users
        ]
    }


@router.get("/logs")
def query_logs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all query logs (admin only)."""
    _require_admin(current_user)
    logs = db.query(QueryLog).order_by(QueryLog.timestamp.desc()).limit(200).all()
    return {
        "logs": [
            {
                "id": l.id,
                "user": l.user_name,
                "query": l.query,
                "timestamp": l.timestamp.isoformat() if l.timestamp else "",
            }
            for l in logs
        ]
    }


@router.get("/indexing")
def indexing_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get document indexing status (admin only)."""
    _require_admin(current_user)
    docs = db.query(Document).order_by(Document.uploaded_at.desc()).all()
    return {
        "documents": [
            {
                "document": d.filename,
                "status": d.status,
                "chunks": d.chunks_count,
            }
            for d in docs
        ]
    }
