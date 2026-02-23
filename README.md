# AI Trends Site

A website that surfaces new AI tools, GitHub repos, HN discussions, and Product Hunt launches updated **nightly at 2 AM UTC** via GitHub Actions. No server to keep running.

## How It Works

```
GitHub Actions (2 AM UTC)
  → Python fetchers (GitHub, HN, Product Hunt, YC)
  → Commit data/latest.json to repo
  → Vercel detects push → rebuilds static Next.js site
  → Site served from Vercel CDN globally
```

**Cost: $0** : GitHub Actions free tier + Vercel free tier.

---

## Data Sources

| Source | API | Auth | Cost |
|---|---|---|---|
| GitHub | REST Search API | `GITHUB_TOKEN` (auto) | Free (30 req/min) |
| Hacker News | Algolia search | None | Free |
| Product Hunt | GraphQL v2 | `PRODUCT_HUNT_TOKEN` | Free tier |
| YCombinator | yc-oss public JSON | None | Free |
| X.com | — | — | Disabled ($100+/month for read access) |

## AI Categories

llm-models · ai-agents · code-generation · image-video · voice-audio · rag-search · local-ai · ai-infrastructure · data-analytics · ai-writing · robotics-embodied

---

## Adding X.com Support

See `scripts/sources/twitter.py` for detailed instructions. X API Basic tier is $100/month and provides 10,000 reads/month — requires `TWITTER_BEARER_TOKEN` secret.
