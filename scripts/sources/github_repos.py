"""
GitHub Search API fetcher.
Discovers new AI repos created in the last 24 hours + trending repos from the last week.
Authenticated search limit: 30 req/min. We sleep 2.5s between queries (~17 queries).
"""
import os
import logging
from datetime import datetime, timedelta, timezone

import sys
import pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent.parent))
from utils import safe_get, check_github_rate_limit, rate_limit_sleep

logger = logging.getLogger(__name__)

GITHUB_SEARCH_API = "https://api.github.com/search/repositories"


def _headers() -> dict:
    token = os.environ.get("GITHUB_TOKEN", "")
    return {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }


# New repos from the last 24 hours — each query uses a different AI topic tag
NEW_REPO_QUERIES = [
    "topic:llm topic:ai created:>{date} stars:>5",
    "topic:large-language-model created:>{date} stars:>5",
    "topic:machine-learning created:>{date} stars:>50",
    "topic:deep-learning created:>{date} stars:>50",
    "topic:generative-ai created:>{date} stars:>10",
    "topic:stable-diffusion created:>{date} stars:>10",
    "topic:langchain created:>{date} stars:>5",
    "topic:ai-agent created:>{date} stars:>5",
    "topic:rag created:>{date} stars:>5",
    "topic:vector-database created:>{date} stars:>5",
    "topic:text-to-image created:>{date} stars:>5",
    "topic:speech-recognition created:>{date} stars:>5",
    "topic:local-llm created:>{date} stars:>1",
    "topic:ai-tools created:>{date} stars:>5",
]

# Trending repos from last 7 days — older repos gaining stars fast
TRENDING_QUERIES = [
    "topic:llm pushed:>{week_ago} stars:>500",
    "topic:ai-agent pushed:>{week_ago} stars:>200",
    "topic:generative-ai pushed:>{week_ago} stars:>200",
]


def fetch() -> list[dict]:
    token = os.environ.get("GITHUB_TOKEN", "")
    if token:
        check_github_rate_limit(token)

    yesterday = (datetime.now(timezone.utc) - timedelta(days=1)).strftime("%Y-%m-%d")
    week_ago = (datetime.now(timezone.utc) - timedelta(days=7)).strftime("%Y-%m-%d")
    now_iso = datetime.now(timezone.utc).isoformat()

    results: dict[str, dict] = {}

    all_queries = NEW_REPO_QUERIES + TRENDING_QUERIES
    for query_template in all_queries:
        query = query_template.format(date=yesterday, week_ago=week_ago)
        params = {
            "q": query,
            "sort": "stars",
            "order": "desc",
            "per_page": 30,
        }
        try:
            data = safe_get(GITHUB_SEARCH_API, headers=_headers(), params=params)
            for repo in data.get("items", []):
                repo_id = f"gh_{repo['full_name'].replace('/', '_')}"
                if repo_id in results:
                    continue
                results[repo_id] = {
                    "id": repo_id,
                    "source": "github",
                    "title": repo["name"],
                    "description": repo.get("description"),
                    "url": repo["html_url"],
                    "author": repo["owner"]["login"],
                    "stars": repo["stargazers_count"],
                    "score": repo["stargazers_count"],
                    "tags": repo.get("topics", []),
                    "language": repo.get("language"),
                    "created_at": repo["created_at"],
                    "fetched_at": now_iso,
                    "thumbnail_url": None,
                    "is_new": repo["created_at"][:10] >= yesterday,
                    "trending_score": float(repo["stargazers_count"]),
                }
        except Exception as exc:
            logger.error("GitHub query failed for '%s': %s", query, exc)

        rate_limit_sleep(2.5)  # Stay safely under 30 req/min

    logger.info("GitHub: fetched %d unique repos", len(results))
    return list(results.values())
