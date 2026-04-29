"""
Chat routes: query the RAG pipeline and manage conversations.
"""
import json
import logging
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional

from app.database.models import get_db, User, Conversation, Message, QueryLog
from app.auth.dependencies import get_current_user
from app.ai_pipeline.rag_chain import query_rag

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/chat", tags=["Chat"])


class ChatRequest(BaseModel):
    question: str
    conversation_id: Optional[str] = None


@router.post("/query")
def chat_query(
    req: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Send a question to the RAG pipeline and get an AI response."""
    # Get or create conversation
    if req.conversation_id:
        conv = db.query(Conversation).filter(
            Conversation.id == req.conversation_id,
            Conversation.user_id == current_user.id,
        ).first()
    else:
        conv = None

    if not conv:
        conv = Conversation(
            title=req.question[:80],
            user_id=current_user.id,
        )
        db.add(conv)
        db.commit()
        db.refresh(conv)

    # Save user message
    user_msg = Message(
        conversation_id=conv.id,
        role="user",
        content=req.question,
    )
    db.add(user_msg)

    # Run RAG query
    result = query_rag(req.question)

    # Save assistant message
    ai_msg = Message(
        conversation_id=conv.id,
        role="assistant",
        content=result["answer"],
        sources=json.dumps(result.get("sources", [])),
    )
    db.add(ai_msg)

    # Log query
    log = QueryLog(
        user_id=current_user.id,
        user_name=current_user.name,
        query=req.question,
    )
    db.add(log)
    db.commit()

    return {
        "answer": result["answer"],
        "sources": result.get("sources", []),
        "conversation_id": conv.id,
    }


@router.get("/conversations")
def list_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all conversations for the current user."""
    convs = db.query(Conversation).filter(
        Conversation.user_id == current_user.id
    ).order_by(Conversation.updated_at.desc()).limit(50).all()

    return {
        "conversations": [
            {
                "id": c.id,
                "title": c.title,
                "updated_at": c.updated_at.isoformat() if c.updated_at else "",
            }
            for c in convs
        ]
    }


@router.get("/conversations/{conv_id}")
def get_conversation(
    conv_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all messages in a conversation."""
    conv = db.query(Conversation).filter(
        Conversation.id == conv_id,
        Conversation.user_id == current_user.id,
    ).first()

    if not conv:
        return {"messages": []}

    messages = db.query(Message).filter(
        Message.conversation_id == conv_id
    ).order_by(Message.timestamp).all()

    return {
        "messages": [
            {
                "role": m.role,
                "content": m.content,
                "sources": json.loads(m.sources) if m.sources else [],
                "timestamp": m.timestamp.isoformat() if m.timestamp else "",
            }
            for m in messages
        ]
    }
