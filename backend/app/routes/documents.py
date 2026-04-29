"""
Document upload, list, and delete routes.
"""
import os
import logging
import threading
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.database.models import get_db, Document, User
from app.auth.dependencies import get_current_user
from app.config import UPLOAD_DIR, ALLOWED_EXTENSIONS, MAX_FILE_SIZE
from app.ai_pipeline.text_extractor import extract_text
from app.ai_pipeline.chunker import chunk_text
from app.ai_pipeline.vector_store import add_documents, remove_document

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/documents", tags=["Documents"])


def _process_document(doc_id: str, file_path: str, filename: str, db_url: str):
    """Background document processing: extract → chunk → embed → index."""
    from app.database.models import SessionLocal, Document

    db = SessionLocal()
    try:
        # Extract text
        text = extract_text(file_path)
        if not text.strip():
            raise ValueError("No text could be extracted from the document")

        # Chunk
        chunks = chunk_text(text, doc_id, filename)

        # Add to vector store
        add_documents(chunks)

        # Update status
        doc = db.query(Document).filter(Document.id == doc_id).first()
        if doc:
            doc.status = "indexed"
            doc.chunks_count = len(chunks)
            db.commit()

        logger.info(f"Document {filename} processed: {len(chunks)} chunks indexed")

    except Exception as e:
        logger.error(f"Error processing document {filename}: {e}")
        doc = db.query(Document).filter(Document.id == doc_id).first()
        if doc:
            doc.status = "error"
            db.commit()
    finally:
        db.close()


@router.post("/upload")
async def upload_documents(
    files: list[UploadFile] = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upload one or more documents for processing."""
    uploaded = []

    for file in files:
        # Validate extension
        ext = Path(file.filename).suffix.lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}. Allowed: {', '.join(ALLOWED_EXTENSIONS)}")

        # Read file
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail=f"File {file.filename} exceeds max size of {MAX_FILE_SIZE // (1024*1024)}MB")

        # Save to disk
        file_path = UPLOAD_DIR / f"{current_user.id}_{file.filename}"
        with open(file_path, "wb") as f:
            f.write(content)

        # Create DB record
        doc = Document(
            filename=file.filename,
            file_type=ext.lstrip("."),
            file_path=str(file_path),
            size=len(content),
            user_id=current_user.id,
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)

        # Process in background thread
        thread = threading.Thread(
            target=_process_document,
            args=(doc.id, str(file_path), file.filename, ""),
        )
        thread.start()

        uploaded.append({
            "id": doc.id,
            "filename": doc.filename,
            "file_type": doc.file_type,
            "size": doc.size,
            "status": doc.status,
        })

    return {"message": f"{len(uploaded)} file(s) uploaded successfully", "documents": uploaded}


@router.get("")
def list_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all documents for the current user."""
    docs = db.query(Document).filter(Document.user_id == current_user.id).order_by(Document.uploaded_at.desc()).all()
    return {
        "documents": [
            {
                "id": d.id,
                "filename": d.filename,
                "file_type": d.file_type,
                "size": d.size,
                "status": d.status,
                "chunks_count": d.chunks_count,
                "uploaded_at": d.uploaded_at.isoformat(),
            }
            for d in docs
        ]
    }


@router.get("/{doc_id}")
def get_document(
    doc_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get document details."""
    doc = db.query(Document).filter(Document.id == doc_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return {
        "id": doc.id,
        "filename": doc.filename,
        "file_type": doc.file_type,
        "size": doc.size,
        "status": doc.status,
        "chunks_count": doc.chunks_count,
        "uploaded_at": doc.uploaded_at.isoformat(),
    }


@router.delete("/{doc_id}")
def delete_document(
    doc_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a document and remove from vector store."""
    doc = db.query(Document).filter(Document.id == doc_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Remove from vector store
    try:
        remove_document(doc_id)
    except Exception as e:
        logger.error(f"Error removing from vector store: {e}")

    # Delete file from disk
    try:
        if os.path.exists(doc.file_path):
            os.remove(doc.file_path)
    except Exception as e:
        logger.error(f"Error deleting file: {e}")

    db.delete(doc)
    db.commit()
    return {"message": "Document deleted successfully"}
