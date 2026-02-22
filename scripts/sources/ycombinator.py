"""
YCombinator company fetcher via the yc-oss public API.
Reads a daily-updated JSON from GitHub Pages — no auth required.
Filters for AI/ML companies from recent batches.
"""
import logging
from datetime import datetime, timezone

import sys
import pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent.parent))
from utils import safe_get

logger = logging.getLogger(__name__)

YC_API_URL = "https://yc-oss.github.io/api/companies/all.json"

AI_INDUSTRY_KEYWORDS = {
    "ai", "artificial intelligence", "machine learning", "deep learning",
    "llm", "nlp", "computer vision", "generative ai", "ml",
    "natural language processing", "robotics",
}

# Consider batches from 2023 onward as "recent"
RECENT_BATCH_YEAR_THRESHOLD = 23


def _is_recent_batch(batch: str) -> bool:
    """W26/S25/W25/S24 → year suffix >= RECENT_BATCH_YEAR_THRESHOLD."""
    try:
        year = int(batch[1:])  # "S24" → 24, "W25" → 25
        return year >= RECENT_BATCH_YEAR_THRESHOLD
    except (ValueError, IndexError):
        return False


def fetch() -> list[dict]:
    try:
        companies = safe_get(YC_API_URL)
    except Exception as exc:
        logger.error("YC companies fetch failed: %s", exc)
        return []

    if not isinstance(companies, list):
        logger.error("Unexpected YC API response type: %s", type(companies))
        return []

    now_iso = datetime.now(timezone.utc).isoformat()
    results = []

    for company in companies:
        # Gather all descriptive terms for matching
        industries = [i.lower() for i in (company.get("industries") or [])]
        tags = [t.lower() for t in (company.get("tags") or [])]
        all_terms = set(industries + tags)
        desc_text = (
            (company.get("one_liner") or "") + " " +
            (company.get("long_description") or "")
        ).lower()

        # Check keyword match in industries/tags OR description
        is_ai = bool(all_terms.intersection(AI_INDUSTRY_KEYWORDS)) or any(
            kw in desc_text for kw in AI_INDUSTRY_KEYWORDS
        )
        if not is_ai:
            continue

        batch = company.get("batch", "")
        slug = company.get("slug") or str(company.get("id", ""))
        if not slug:
            continue

        results.append(
            {
                "id": f"yc_{slug}",
                "source": "ycombinator",
                "title": company.get("name", ""),
                "description": company.get("one_liner") or company.get("long_description", ""),
                "url": company.get("website") or f"https://www.ycombinator.com/companies/{slug}",
                "author": f"YC {batch}" if batch else "YCombinator",
                "stars": None,
                "score": None,
                "tags": tags,
                "language": None,
                "created_at": company.get("launched_at") or now_iso,
                "fetched_at": now_iso,
                "thumbnail_url": company.get("small_logo_thumb_url"),
                "is_new": _is_recent_batch(batch),
                "trending_score": None,
            }
        )

    logger.info("YCombinator: fetched %d AI companies", len(results))
    return results
