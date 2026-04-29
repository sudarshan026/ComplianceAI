"""
Text chunking using LangChain's RecursiveCharacterTextSplitter.
"""
from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.config import CHUNK_SIZE, CHUNK_OVERLAP


def chunk_text(text: str, doc_id: str, filename: str) -> list[dict]:
    """
    Split text into chunks with metadata.
    Returns list of dicts with 'content', 'metadata' keys.
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        length_function=len,
        separators=["\n\n", "\n", ". ", " ", ""],
    )

    chunks = splitter.split_text(text)

    return [
        {
            "content": chunk,
            "metadata": {
                "doc_id": doc_id,
                "filename": filename,
                "chunk_index": i,
                "total_chunks": len(chunks),
            },
        }
        for i, chunk in enumerate(chunks)
    ]
