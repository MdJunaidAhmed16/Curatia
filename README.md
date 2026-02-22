# AI Trends Site

A website that surfaces new AI tools, GitHub repos, HN discussions, and Product Hunt launches — updated **nightly at 2 AM UTC** via GitHub Actions. No server to keep running.

## How It Works

```
GitHub Actions (2 AM UTC)
  → Python fetchers (GitHub, HN, Product Hunt, YC)
  → Commit data/latest.json to repo
  → Vercel detects push → rebuilds static Next.js site
  → Site served from Vercel CDN globally
```

**Cost: $0** — GitHub Actions free tier + Vercel free tier.

---

## Setup

### 1. Fork / clone this repo to your GitHub account

```bash
git clone https://github.com/YOUR_USERNAME/ai-trends-site.git
```

### 2. Add GitHub Secrets

Go to **Settings → Secrets and variables → Actions → New repository secret** and add:

| Secret | Value |
|---|---|
| `PRODUCT_HUNT_TOKEN` | Get from [producthunt.com/v2/oauth/applications](https://www.producthunt.com/v2/oauth/applications) → create an app → copy the **Developer Token** |
| `PRODUCT_HUNT_CLIENT_ID` | Optional — same app page (for auto token refresh) |
| `PRODUCT_HUNT_CLIENT_SECRET` | Optional — same app page |

> `GITHUB_TOKEN` is **automatically injected** by GitHub Actions — you don't need to add it manually.

### 3. Connect Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → Import your fork
2. Set **Root Directory** to `frontend`
3. Vercel will auto-detect Next.js and set the build command to `next build`
4. Deploy once manually to get the site URL

From now on, every time GitHub Actions commits new data to the repo, Vercel automatically rebuilds and deploys.

### 4. Trigger the first data fetch

Go to **Actions → Nightly AI Trends Fetch → Run workflow** to immediately populate real data.

---

## Local Development

### Python fetchers

```bash
# Install dependencies
pip install -r requirements.txt

# Set required env vars
export GITHUB_TOKEN="your_github_pat"
export PRODUCT_HUNT_TOKEN="your_ph_token"

# Run the fetcher (writes to data/latest.json)
python scripts/fetch_all.py
```

### Next.js frontend

```bash
cd frontend
npm install
npm run dev   # http://localhost:3000
```

> The dev server reads `../data/latest.json` at build time. Make sure it exists (the seeded sample file is included).

### Build static export

```bash
cd frontend
npm run build   # Outputs to frontend/out/
```

---

## Project Structure

```
ai-trends-site/
├── .github/workflows/fetch-data.yml   # Nightly cron job
├── scripts/
│   ├── fetch_all.py                   # Orchestrator
│   ├── categorize.py                  # Keyword-based categorization
│   ├── utils.py                       # Retry, rate limiting utilities
│   └── sources/
│       ├── github_repos.py            # GitHub Search API
│       ├── hackernews.py              # HN Algolia API
│       ├── producthunt.py             # Product Hunt GraphQL
│       ├── ycombinator.py             # YC-OSS public JSON
│       └── twitter.py                 # Disabled (X API too expensive)
├── data/
│   ├── latest.json                    # Current data (read by Next.js build)
│   └── history/YYYY-MM-DD.json        # Daily archives
├── frontend/                          # Next.js 15 App Router
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                   # Home dashboard
│   │   └── category/[slug]/page.tsx   # Per-category page
│   ├── components/dashboard/          # All UI components
│   ├── lib/
│   │   ├── data.ts                    # Reads latest.json at build time
│   │   └── types.ts                   # TypeScript types
│   └── next.config.ts                 # output: 'export' (fully static)
└── requirements.txt
```

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
