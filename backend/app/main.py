"""
ComplianceAI — FastAPI Backend Entry Point
"""
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import CORS_ORIGINS
from app.database.models import init_db
from app.auth.router import router as auth_router
from app.routes.documents import router as docs_router
from app.routes.chat import router as chat_router
from app.routes.search import router as search_router
from app.routes.analytics import router as analytics_router
from app.routes.admin import router as admin_router

# ─── Logging ───
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)

# ─── App ───
app = FastAPI(
    title="ComplianceAI API",
    description="AI-powered compliance and policy assistant backend",
    version="1.0.0",
)

# ─── CORS ───
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routes ───
app.include_router(auth_router, prefix="/api")
app.include_router(docs_router, prefix="/api")
app.include_router(chat_router, prefix="/api")
app.include_router(search_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")
app.include_router(admin_router, prefix="/api")


@app.on_event("startup")
def startup():
    """Initialize database and load vector store on startup."""
    logger.info("Starting ComplianceAI Backend...")
    init_db()
    logger.info("Database initialized")

    # Try to load vector store (non-blocking)
    try:
        from app.ai_pipeline.vector_store import load_index
        load_index()
        logger.info("Vector store loaded")
    except Exception as e:
        logger.warning(f"Vector store not loaded (will initialize on first use): {e}")

    logger.info("ComplianceAI Backend ready!")


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "ComplianceAI API"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
