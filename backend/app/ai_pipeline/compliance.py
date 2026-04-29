"""
Compliance intelligence features:
- Risk keyword detection and scoring
- Clause extraction
- Executive summary generation
"""
import re
import logging

logger = logging.getLogger(__name__)

# Risk-related keywords and their severity weights
RISK_KEYWORDS = {
    "high": [
        "violation", "breach", "non-compliance", "penalty", "termination",
        "lawsuit", "fraud", "negligence", "liability", "sanction",
        "prohibited", "illegal", "unauthorized", "critical", "severe",
    ],
    "medium": [
        "risk", "warning", "concern", "deviation", "inconsistency",
        "gap", "weakness", "deficiency", "overdue", "escalation",
        "remediation", "corrective", "audit finding", "observation",
    ],
    "low": [
        "recommendation", "improvement", "suggestion", "minor",
        "advisory", "note", "consideration", "opportunity",
        "enhancement", "review",
    ],
}


def calculate_risk_score(text: str) -> dict:
    """
    Calculate a compliance risk score based on keyword detection.
    Returns dict with score (0-100), level, and detected keywords.
    """
    text_lower = text.lower()
    detected = {"high": [], "medium": [], "low": []}

    for level, keywords in RISK_KEYWORDS.items():
        for kw in keywords:
            if kw in text_lower:
                count = text_lower.count(kw)
                detected[level].append({"keyword": kw, "count": count})

    # Calculate weighted score
    high_score = len(detected["high"]) * 10
    medium_score = len(detected["medium"]) * 5
    low_score = len(detected["low"]) * 2

    total = min(high_score + medium_score + low_score, 100)

    if total >= 60:
        level = "Critical"
    elif total >= 40:
        level = "High"
    elif total >= 20:
        level = "Medium"
    else:
        level = "Low"

    return {
        "score": total,
        "level": level,
        "detected_keywords": detected,
        "high_risk_count": len(detected["high"]),
        "medium_risk_count": len(detected["medium"]),
        "low_risk_count": len(detected["low"]),
    }


def extract_clauses(text: str) -> list[dict]:
    """
    Extract numbered clauses and sections from document text.
    """
    patterns = [
        r"(?:Section|Clause|Article)\s+\d+[\.\d]*\s*[:\-]?\s*(.+?)(?=\n(?:Section|Clause|Article)\s+\d|$)",
        r"\d+\.\d+\s+(.+?)(?=\n\d+\.\d+|$)",
    ]

    clauses = []
    for pattern in patterns:
        matches = re.finditer(pattern, text, re.IGNORECASE | re.DOTALL)
        for match in matches:
            clause_text = match.group(0).strip()
            if len(clause_text) > 20:  # Filter noise
                clauses.append({
                    "text": clause_text[:500],  # Limit length
                    "position": match.start(),
                })

    return clauses[:50]  # Limit total clauses


def generate_risk_summary(text: str) -> str:
    """Generate a simple risk summary based on keyword analysis."""
    risk = calculate_risk_score(text)
    
    summary_parts = [f"## Compliance Risk Assessment\n"]
    summary_parts.append(f"**Overall Risk Score:** {risk['score']}/100 ({risk['level']})\n")

    if risk["high_risk_count"] > 0:
        summary_parts.append(f"### ⚠️ High Risk Items ({risk['high_risk_count']})")
        for item in risk["detected_keywords"]["high"][:5]:
            summary_parts.append(f"- **{item['keyword']}** (found {item['count']} times)")

    if risk["medium_risk_count"] > 0:
        summary_parts.append(f"\n### ⚡ Medium Risk Items ({risk['medium_risk_count']})")
        for item in risk["detected_keywords"]["medium"][:5]:
            summary_parts.append(f"- **{item['keyword']}** (found {item['count']} times)")

    if risk["low_risk_count"] > 0:
        summary_parts.append(f"\n### ℹ️ Low Risk Items ({risk['low_risk_count']})")
        for item in risk["detected_keywords"]["low"][:3]:
            summary_parts.append(f"- **{item['keyword']}** (found {item['count']} times)")

    return "\n".join(summary_parts)
