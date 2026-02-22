#!/usr/bin/env python3
"""
Nightly AI Trends orchestrator.

Calls all source fetchers, deduplicates by URL, categorizes each item,
sorts by trending_score, and writes:
  - data/latest.json          (overwritten each run)
  - data/history/YYYY-MM-DD.json  (one per day, never overwritten)
"""

import json
import logging
import sys
from datetime import datetime, timezone
from pathlib import Path

# Ensure scripts/ is on the path so imports work when run from the repo root
sys.path.insert(0, str(Path(__file__).parent))

from categorize import categorize, CATEGORIES
from sources import github_repos, hackernews, producthunt, ycombinator, twitter

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S",
)
logger = logging.getLogger("fetch_all")

REPO_ROOT = Path(__file__).parent.parent
DATA_DIR = REPO_ROOT / "data"
HISTORY_DIR = DATA_DIR / "history"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _deduplicate(items: list[dict]) -> list[dict]:
    """
    Remove duplicates by normalised URL.
    When the same URL appears from multiple sources, keep the version
    with the highest score (stars / upvotes).
    """
    seen: dict[str, dict] = {}
    for item in items:
        url = item["url"].rstrip("/").lower()
        if url not in seen:
            seen[url] = item
        else:
            if (item.get("score") or 0) > (seen[url].get("score") or 0):
                seen[url] = item
    return list(seen.values())


def _compute_category_counts(items: list[dict]) -> list[dict]:
    counts: dict[str, int] = {}
    for item in items:
        cat = item.get("category", "")
        counts[cat] = counts.get(cat, 0) + 1

    category_list = [{"slug": "all", "label": "All Tools", "count": len(items)}]
    for cat in CATEGORIES:
        category_list.append(
            {
                "slug": cat["slug"],
                "label": cat["label"],
                "count": counts.get(cat["slug"], 0),
            }
        )
    return category_list


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    now = datetime.now(timezone.utc)
    today = now.strftime("%Y-%m-%d")
    logger.info("Starting nightly fetch for %s", today)

    # --- Fetch from all sources (failures are isolated) ---
    all_items: list[dict] = []

    logger.info("=== GitHub Repos ===")
    all_items.extend(github_repos.fetch())

    logger.info("=== Hacker News ===")
    all_items.extend(hackernews.fetch())

    logger.info("=== Product Hunt ===")
    all_items.extend(producthunt.fetch())

    logger.info("=== YCombinator ===")
    all_items.extend(ycombinator.fetch())

    logger.info("=== Twitter/X ===")
    all_items.extend(twitter.fetch())

    logger.info("Raw total before dedup: %d items", len(all_items))

    # --- Deduplicate by URL ---
    items = _deduplicate(all_items)
    logger.info("After dedup: %d items", len(items))

    # --- Categorize ---
    for item in items:
        item["category"] = categorize(item)

    # --- Sort: items with trending_score first (desc), then None-score items ---
    items.sort(key=lambda x: x.get("trending_score") or -1, reverse=True)

    # --- Source counts ---
    source_counts: dict[str, int] = {}
    for item in items:
        src = item["source"]
        source_counts[src] = source_counts.get(src, 0) + 1

    # --- Assemble payload ---
    payload = {
        "metadata": {
            "generated_at": now.isoformat(),
            "date": today,
            "total_items": len(items),
            "sources": source_counts,
            "schema_version": "1.0",
        },
        "items": items,
        "categories": _compute_category_counts(items),
    }

    # --- Write files ---
    DATA_DIR.mkdir(exist_ok=True)
    HISTORY_DIR.mkdir(exist_ok=True)

    latest_path = DATA_DIR / "latest.json"
    history_path = HISTORY_DIR / f"{today}.json"

    with open(latest_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)

    # Only write history file if it doesn't already exist (idempotent re-runs)
    if not history_path.exists():
        with open(history_path, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2, ensure_ascii=False)

    logger.info("Written: %s", latest_path)
    logger.info("Written: %s", history_path)
    logger.info(
        "Done. %d items from sources: %s",
        len(items),
        ", ".join(f"{k}={v}" for k, v in source_counts.items()),
    )


if __name__ == "__main__":
    main()
