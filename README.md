# ComplianceAI

**Intelligent document compliance and policy management powered by Retrieval-Augmented Generation.**

ComplianceAI enables organizations to centralize policy documents, compliance manuals, contracts, and audit reports into a searchable knowledge base — then query them instantly through a conversational AI interface. Purpose-built for compliance teams, legal departments, and regulated enterprises.

---

## Overview

Managing compliance across large document repositories is operationally expensive and error-prone. ComplianceAI automates this by combining document ingestion, semantic search, and LLM-powered question answering into a single platform.

**Core Capabilities:**

- **Document Intelligence** — Upload PDF, DOCX, and TXT files. Documents are automatically extracted, chunked, and embedded into a vector index for instant retrieval.
- **Conversational Compliance Assistant** — Ask natural-language questions about your policies and receive grounded answers with source citations.
- **Semantic Search** — Find relevant clauses, sections, and provisions across your entire document corpus using vector similarity.
- **Analytics Dashboard** — Track document usage, query patterns, and system activity at a glance.
- **Role-Based Access Control** — Separate admin and user roles with JWT-based authentication.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (React)                  │
│         Vite · TypeScript · Tailwind CSS            │
└──────────────────────┬──────────────────────────────┘
                       │ REST API
┌──────────────────────▼──────────────────────────────┐
│                  Backend (FastAPI)                   │
│                                                     │
│  ┌─────────────┐  ┌────────────┐  ┌──────────────┐ │
│  │ Auth (JWT)   │  │ Document   │  │ RAG Pipeline │ │
│  │              │  │ Management │  │              │ │
│  └─────────────┘  └────────────┘  └──────┬───────┘ │
│                                          │         │
│  ┌─────────────┐  ┌────────────┐  ┌──────▼───────┐ │
│  │ SQLite (DB)  │  │ FAISS      │  │ Groq LLM    │ │
│  │              │  │ (Vectors)  │  │ (Inference)  │ │
│  └─────────────┘  └────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────┘
```

**AI Pipeline:**

1. **Extract** — Text is parsed from uploaded PDF, DOCX, and TXT documents.
2. **Chunk** — Documents are split into 500-token segments with overlap for context preservation.
3. **Embed** — Chunks are encoded into dense vectors using `all-MiniLM-L6-v2` (Sentence Transformers).
4. **Index** — Vectors are stored in a FAISS index for sub-millisecond retrieval.
5. **Retrieve & Generate** — User queries are embedded, matched against the index, and the top-k results are passed to a Groq-hosted LLM to generate grounded, cited answers.

---

## Tech Stack

| Layer     | Technology                                                         |
|-----------|--------------------------------------------------------------------|
| Frontend  | React 19, Vite, TypeScript, Tailwind CSS, Framer Motion, Recharts |
| Backend   | Python 3.11+, FastAPI, LangChain, SQLAlchemy                      |
| AI/ML     | Sentence Transformers, FAISS, Groq API (Llama 3.1)                |
| Auth      | JWT with bcrypt password hashing                                   |
| Database  | SQLite (default), configurable via `DATABASE_URL`                  |

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- [Groq API key](https://console.groq.com)

### Backend

```bash
cd backend
python -m venv venv && venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env        # Set GROQ_API_KEY in .env
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The application will be available at `http://localhost:5173`. API documentation (Swagger UI) is served at `http://localhost:8000/docs`.

---

## Configuration

| Variable          | Description                          | Default                  |
|-------------------|--------------------------------------|--------------------------|
| `GROQ_API_KEY`    | Groq API key for LLM inference       | *required*               |
| `GROQ_MODEL`      | Groq model identifier                | `llama-3.1-8b-instant`   |
| `JWT_SECRET`      | Signing key for JWT tokens           | *change in production*   |
| `EMBEDDING_MODEL` | HuggingFace embedding model name     | `all-MiniLM-L6-v2`       |
| `DATABASE_URL`    | SQLAlchemy-compatible connection URI  | SQLite (local file)      |

---

## Performance Metrics

Benchmarked on real system with indexed compliance documents:

| Metric | Result |
|--------|--------|
| Semantic retrieval latency | **~25ms** avg (embedding + FAISS search) |
| Retrieval hit rate | **100%** across 20 compliance queries |
| Response grounding rate | **100%** — all answers cite source documents |
| Embedding throughput | **200+ texts/sec** (batch) · ~5ms per text |
| Document chunking speed | **6M+ words/sec** |
| Vector dimensionality | **384d** dense embeddings (all-MiniLM-L6-v2) |
| Supported document formats | **3** — PDF, DOCX, TXT |
| Security layers | **5** — JWT, bcrypt, RBAC, CORS, input sanitization |

---

## Security

- JWT-based authentication with bcrypt password hashing
- Role-based access control (admin / user)
- File type validation on upload
- Input sanitization and CORS policy enforcement
- Protected API routes with middleware guards

---

## License

MIT
