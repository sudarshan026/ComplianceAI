# ComplianceAI — Enterprise AI Compliance & Policy Assistant

An AI-powered enterprise assistant that lets organizations upload policy documents, compliance manuals, HR rules, contracts, and audit reports, then interact with them using a conversational AI chatbot powered by RAG (Retrieval-Augmented Generation).

## 🚀 Tech Stack

### Frontend
- **React 19** + **Vite** + **TypeScript**
- **Tailwind CSS** with custom design system
- **Framer Motion** for animations
- **Recharts** for analytics visualizations
- **React Router** for navigation
- **Axios** for API communication

### Backend
- **Python 3.11** + **FastAPI**
- **LangChain** for text processing
- **Sentence Transformers** (HuggingFace) for embeddings
- **FAISS** for vector storage & retrieval
- **Groq API** for LLM-powered responses
- **SQLAlchemy** + **SQLite** for database
- **JWT** for authentication

## 📁 Project Structure

```
compliance/
├── frontend/                  # React + Vite application
│   ├── src/
│   │   ├── components/        # Layout, UI components
│   │   ├── context/           # Auth & Theme contexts
│   │   ├── lib/               # API client, utilities
│   │   └── pages/             # Route pages
│   └── ...
├── backend/                   # Python FastAPI application
│   ├── app/
│   │   ├── ai_pipeline/       # Text extraction, chunking, embeddings, RAG
│   │   ├── auth/              # JWT authentication
│   │   ├── database/          # SQLAlchemy models
│   │   └── routes/            # API endpoints
│   └── ...
├── docker-compose.yml
└── README.md
```

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- Groq API key (get one free at https://console.groq.com)

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env and set your GROQ_API_KEY

# Start server
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

### 3. Open the App
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/docs

## 🔑 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GROQ_API_KEY` | Groq API key for LLM | (required) |
| `GROQ_MODEL` | Groq model name | `llama-3.1-8b-instant` |
| `JWT_SECRET` | JWT signing secret | (change in production) |
| `EMBEDDING_MODEL` | HuggingFace model | `all-MiniLM-L6-v2` |
| `DATABASE_URL` | Database connection | SQLite (local) |

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/documents/upload` | Upload documents |
| GET | `/api/documents` | List documents |
| DELETE | `/api/documents/{id}` | Delete document |
| POST | `/api/chat/query` | Query RAG pipeline |
| GET | `/api/chat/conversations` | List conversations |
| POST | `/api/search` | Semantic search |
| GET | `/api/analytics/overview` | Dashboard stats |
| GET | `/api/admin/users` | List users (admin) |

## 🐳 Docker Deployment

```bash
docker-compose up --build
```

## 🌐 Vercel Deployment (Frontend)

```bash
cd frontend
npm run build
# Deploy dist/ to Vercel
```

Set `VITE_API_URL` environment variable in Vercel to your backend URL.

## 🔒 Security Features
- JWT authentication with bcrypt password hashing
- Protected API routes
- File type validation
- Input sanitization
- CORS configuration
- Admin role-based access control

## 🤖 AI Pipeline Flow
1. **Upload** → Document saved to disk
2. **Extract** → Text extracted from PDF/DOCX/TXT
3. **Chunk** → Text split into 500-token chunks with overlap
4. **Embed** → Chunks embedded using sentence-transformers
5. **Index** → Vectors stored in FAISS
6. **Query** → User question embedded and matched against index
7. **Generate** → Relevant chunks + question sent to Groq LLM
8. **Respond** → AI answer with source citations returned

## 📄 License
MIT
