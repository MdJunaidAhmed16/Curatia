"""
Hacker News fetcher via the Algolia search API.
Free, no auth required. Returns stories from the last 36 hours with score >= 10.
"""
import logging
from datetime import datetime, timedelta, timezone

import sys
import pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent.parent))
from utils import safe_get, rate_limit_sleep

logger = logging.getLogger(__name__)

HN_SEARCH_API = "https://hn.algolia.com/api/v1/search_by_date"

AI_QUERIES = [
    "LLM",
    "GPT",
    "Claude AI",
    "Gemini AI",
    "AI agent",
    "machine learning",
    "Show HN: AI",
    "Show HN: LLM",
    "diffusion model",
    "RAG retrieval",
    "vector database",
    "open source AI",
    "local LLM",
    "transformer model",
    "reinforcement learning",
    "computer vision AI",
    "Ask HN: AI",
]

MIN_SCORE = 10  # Filter out low-engagement stories


def fetch() -> list[dict]:
    since_ts = int(
        (datetime.now(timezone.utc) - timedelta(hours=36)).timestamp()
    )
    now_iso = datetime.now(timezone.utc).isoformat()
    results: dict[str, dict] = {}

    for query in AI_QUERIES:
        params = {
            "query": query,
            "tags": "story",
            "numericFilters": f"created_at_i>{since_ts}",
            "hitsPerPage": 30,
        }
        try:
            data = safe_get(HN_SEARCH_API, params=params)
            for hit in data.get("hits", []):
                item_id = f"hn_{hit['objectID']}"
                if item_id in results:
                    continue
                url = hit.get("url") or (
                    f"https://news.ycombinator.com/item?id={hit['objectID']}"
                )
                results[item_id] = {
                    "id": item_id,
                    "source": "hackernews",
                    "title": hit.get("title", ""),
                    "description": None,
                    "url": url,
                    "author": hit.get("author", ""),
                    "stars": None,
                    "score": hit.get("points", 0),
                    "tags": [],
                    "language": None,
                    "created_at": hit.get("created_at", ""),
                    "fetched_at": now_iso,
                    "thumbnail_url": None,
                    "is_new": True,
                    "trending_score": float(hit.get("points") or 0),
                }
        except Exception as exc:
            logger.error("HN query failed for '%s': %s", query, exc)

        rate_limit_sleep(0.5)

    # Drop low-engagement noise
    filtered = [v for v in results.values() if (v["score"] or 0) >= MIN_SCORE]
    logger.info("HN: fetched %d stories (score >= %d)", len(filtered), MIN_SCORE)
    return filtered
