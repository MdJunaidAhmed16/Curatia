"""
Product Hunt GraphQL API fetcher.
Requires PRODUCT_HUNT_TOKEN (developer token) in environment.
Fetches AI-tagged posts from the last 2 days, ordered by votes.
"""
import os
import logging
import requests
from datetime import datetime, timedelta, timezone

logger = logging.getLogger(__name__)

PH_GRAPHQL_URL = "https://api.producthunt.com/v2/api/graphql"
PH_TOKEN_URL = "https://api.producthunt.com/v2/oauth/token"

POSTS_QUERY = """
query($postedAfter: DateTime, $first: Int) {
  posts(
    order: VOTES,
    postedAfter: $postedAfter,
    topic: "artificial-intelligence",
    first: $first
  ) {
    edges {
      node {
        id
        name
        tagline
        url
        votesCount
        createdAt
        thumbnail { url }
        topics { edges { node { slug } } }
        user { username }
      }
    }
  }
}
"""


def _get_token() -> str:
    """Return developer token or attempt client-credentials flow."""
    # Prefer pre-generated developer token (simplest)
    token = os.environ.get("PRODUCT_HUNT_TOKEN", "")
    if token:
        return token

    client_id = os.environ.get("PRODUCT_HUNT_CLIENT_ID", "")
    client_secret = os.environ.get("PRODUCT_HUNT_CLIENT_SECRET", "")
    if client_id and client_secret:
        try:
            resp = requests.post(
                PH_TOKEN_URL,
                json={
                    "client_id": client_id,
                    "client_secret": client_secret,
                    "grant_type": "client_credentials",
                },
                timeout=10,
            )
            resp.raise_for_status()
            return resp.json().get("access_token", "")
        except Exception as exc:
            logger.error("Product Hunt token refresh failed: %s", exc)

    return ""


def fetch() -> list[dict]:
    token = _get_token()
    if not token:
        logger.warning(
            "No Product Hunt token found (PRODUCT_HUNT_TOKEN env var). Skipping."
        )
        return []

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    posted_after = (datetime.now(timezone.utc) - timedelta(days=2)).isoformat()
    payload = {
        "query": POSTS_QUERY,
        "variables": {"postedAfter": posted_after, "first": 50},
    }

    try:
        resp = requests.post(PH_GRAPHQL_URL, headers=headers, json=payload, timeout=20)
        resp.raise_for_status()
        data = resp.json()
    except Exception as exc:
        logger.error("Product Hunt fetch failed: %s", exc)
        return []

    errors = data.get("errors")
    if errors:
        logger.error("Product Hunt GraphQL errors: %s", errors)
        return []

    now_iso = datetime.now(timezone.utc).isoformat()
    results = []

    for edge in data.get("data", {}).get("posts", {}).get("edges", []):
        node = edge.get("node")
        if not node or not isinstance(node, dict):
            continue
        topic_slugs = [
            t.get("node", {}).get("slug", "")
            for t in node.get("topics", {}).get("edges", [])
            if t.get("node", {}).get("slug")
        ]
        thumbnail_url = None
        if node.get("thumbnail"):
            thumbnail_url = node["thumbnail"].get("url")

        results.append(
            {
                "id": f"ph_{node['id']}",
                "source": "producthunt",
                "title": node.get("name", ""),
                "description": node.get("tagline", ""),
                "url": node.get("url", ""),
                "author": node.get("user", {}).get("username", ""),
                "stars": None,
                "score": node.get("votesCount", 0),
                "tags": topic_slugs,
                "language": None,
                "created_at": node.get("createdAt", ""),
                "fetched_at": now_iso,
                "thumbnail_url": thumbnail_url,
                "is_new": True,
                "trending_score": float(node.get("votesCount") or 0),
            }
        )

    logger.info("Product Hunt: fetched %d posts", len(results))
    return results
