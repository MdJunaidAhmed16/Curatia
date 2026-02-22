"""
Shared utilities: rate-limit sleep, retry decorator, safe HTTP GET.
"""
import time
import logging

import requests
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
)

logger = logging.getLogger(__name__)


def rate_limit_sleep(seconds: float) -> None:
    """Explicit sleep to respect API rate limits."""
    logger.debug("Sleeping %.1fs for rate limit compliance", seconds)
    time.sleep(seconds)


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=4, max=30),
    retry=retry_if_exception_type((requests.HTTPError, requests.Timeout)),
    reraise=True,
)
def safe_get(url: str, headers: dict = None, params: dict = None) -> dict:
    """GET with automatic retry + exponential backoff. Raises after 3 attempts."""
    resp = requests.get(url, headers=headers, params=params, timeout=15)
    if resp.status_code == 429:
        # Cap Retry-After to prevent a malicious/misbehaving API from
        # making the GitHub Actions job sleep indefinitely.
        MAX_RETRY_AFTER = 300  # 5 minutes absolute ceiling
        raw_retry = resp.headers.get("Retry-After", "30")
        try:
            retry_after = min(int(raw_retry), MAX_RETRY_AFTER)
        except (ValueError, TypeError):
            retry_after = 30
        logger.warning("Rate limited by %s. Waiting %ds", url, retry_after)
        time.sleep(retry_after)
        resp.raise_for_status()
    resp.raise_for_status()
    return resp.json()


def check_github_rate_limit(token: str) -> int:
    """
    Returns remaining GitHub Search API calls.
    Sleeps until reset if remaining < 50.
    """
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
    }
    try:
        data = requests.get(
            "https://api.github.com/rate_limit", headers=headers, timeout=10
        ).json()
        remaining = data["resources"]["search"]["remaining"]
        reset_at = data["resources"]["search"]["reset"]
        if remaining < 50:
            sleep_seconds = max(0, reset_at - time.time()) + 5
            logger.warning(
                "GitHub rate limit low (%d remaining). Sleeping %.0fs",
                remaining,
                sleep_seconds,
            )
            time.sleep(sleep_seconds)
        logger.info("GitHub Search API: %d requests remaining", remaining)
        return remaining
    except Exception as exc:
        logger.warning("Could not check GitHub rate limit: %s", exc)
        return 100  # assume ok
