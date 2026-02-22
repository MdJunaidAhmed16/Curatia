"""
X.com (Twitter) data fetcher — DISABLED.

Reason: As of February 2026 the X API free tier is write-only with zero
read access. The Basic tier ($100/month) allows only 10,000 tweet reads
per month — insufficient for meaningful daily AI trend monitoring.

Status: Returns an empty list. The pipeline continues without X data.

The signal that Twitter would provide is covered by:
  - Hacker News  : viral AI discussions and Show HN launches
  - GitHub       : repos that go viral on Twitter show up in trending
  - Product Hunt : simultaneous with Twitter launches

To re-enable in the future:
  1. Obtain an X API Basic or Pro tier bearer token.
  2. Store it as TWITTER_BEARER_TOKEN in GitHub Secrets.
  3. Implement search using GET /2/tweets/search/recent with
     query: "(AI OR LLM OR GPT) lang:en -is:retweet" and a
     start_time set to 24 hours ago.
  4. Map each tweet to the standard item schema (id, source, title, ...).
"""
import logging

logger = logging.getLogger(__name__)


def fetch() -> list[dict]:
    logger.warning(
        "X.com (Twitter) source is disabled — free tier has no read access. "
        "See scripts/sources/twitter.py for details on re-enabling."
    )
    return []
