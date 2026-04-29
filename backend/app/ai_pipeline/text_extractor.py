"""
Text extraction from PDF, DOCX, and TXT files.
"""
import logging
from pathlib import Path

logger = logging.getLogger(__name__)


def extract_text(file_path: str) -> str:
    """Extract text content from a file based on its extension."""
    path = Path(file_path)
    ext = path.suffix.lower()

    try:
        if ext == ".pdf":
            return _extract_pdf(path)
        elif ext == ".docx":
            return _extract_docx(path)
        elif ext == ".txt":
            return _extract_txt(path)
        else:
            raise ValueError(f"Unsupported file type: {ext}")
    except Exception as e:
        logger.error(f"Error extracting text from {file_path}: {e}")
        raise


def _extract_pdf(path: Path) -> str:
    """Extract text from PDF using PyPDF2."""
    import PyPDF2

    text_parts = []
    with open(path, "rb") as f:
        reader = PyPDF2.PdfReader(f)
        for page_num, page in enumerate(reader.pages):
            page_text = page.extract_text()
            if page_text:
                text_parts.append(f"[Page {page_num + 1}]\n{page_text}")
    return "\n\n".join(text_parts)


def _extract_docx(path: Path) -> str:
    """Extract text from DOCX using python-docx."""
    import docx

    doc = docx.Document(str(path))
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    return "\n\n".join(paragraphs)


def _extract_txt(path: Path) -> str:
    """Read plain text file."""
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        return f.read()
