# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Marketing and SEO site for Arthavi at `https://arthavi.com` (Astro 6, static output). It funnels visitors to the user app (`https://app.arthavi.com/register` and `/demo`). It is a separate repo from the app and backend in `../arthavi/`.

## Commands

```bash
npm install
npm run dev               # localhost:4321
npm run build             # astro build, then postbuild: validate-schema + indexnow-ping
npm run validate:schema   # re-run JSON-LD validation against an existing dist/
npm run preview
```

There are no tests. **`postbuild` submits URLs to IndexNow** (`scripts/indexnow-ping.mjs`), so a local `npm run build` pings search engines. For a local-only check, use `npx astro build && npm run validate:schema`.

Deployment: `.github/workflows/` builds with `withastro/action` and deploys to GitHub Pages on push to `main`, plus a weekday cron (12:30 UTC) so NSE pages and sitemap `lastmod` stay fresh. `CNAME` = arthavi.com. `dist/` is gitignored. Env: `PUBLIC_POSTHOG_KEY`, `PUBLIC_POSTHOG_HOST` (set in the workflow).

## Architecture

**Routing**: file-based pages in `src/pages/`, with `trailingSlash: 'always'`. Content is mostly one `.astro` file per page (blog posts, comparisons in `compare/`, `alternatives/`, `arthavi-vs-*`, calculators in `tools/` and `*-calculator.astro`, guides). There is no content collection or Markdown pipeline. Legacy `.html` URLs are mapped in the `redirects` block of `astro.config.mjs`; when moving or renaming a page, add a redirect there.

**Layout & SEO** (`src/layouts/Layout.astro`): every page passes `title`, `description`, optional `keywords`, `schema` (a JSON-LD string), `canonical` (defaults to `https://arthavi.com` + path), `noindex`, and `breadcrumb`. The layout merges the page schema into a site-wide `@graph` via `buildPageGraph()` in `src/utils/schemaGenerator.ts` (stable `@id`s for organization, founder, website, and software application). It also loads GA (gtag) and PostHog (autocapture off; tracks `demo_clicked` and `create_account_clicked` on CTA clicks). The build fails if `scripts/validate-schema.mjs` finds invalid JSON-LD in `dist/`.

**Sitemaps**: custom endpoints `src/pages/sitemap-*.xml.ts` (the `@astrojs/sitemap` package is installed but not configured). `src/utils/sitemapData.ts` scans `src/pages/` automatically, so new pages are included without registration. It categorizes by URL: `/tools/` or `calculator` → tools; `/blog/`, `/guides/`, `how-to-` → guides; `/alternatives/`, `/compare/`, `arthavi-vs-` → comparisons; everything else → pages. `lastmod` comes from `dateModified`/`datePublished`-style strings in the file, falling back to file mtime. Pages using `Astro.redirect(` and `/404/` are skipped. `stocks/` has its own sitemap.

**Stock pages** (`src/pages/stocks/`): static paths are generated from `src/data/stockSeedData.ts`. Live data is fetched **in the browser** from the backend's public API (`/api/public/stocks/{slug}`) at `https://setu2.arthavi.com` (`localhost:8000` on localhost). Slugs must match `../arthavi/backend/app/services/stock_seed_data.py`, and the backend CORS must allow arthavi.com.

**NSE pages** (`nse-corporate-actions-today`, `nse-board-meetings-financial-results`): fetch NSE RSS feeds at build time, with a client-side refresh through a proxy.

**Calculators**: logic is inline `<script>` in each page. `tools/xirr-calculator.astro` uses a 365.25-day year (matching the backend `app/utils/xirr.py`), but its on-page formula text and FAQ schema say 365; keep them consistent if changing either.

**Other files**: `public/llms.txt` and `llms-full.txt` are hand-maintained AI-crawler summaries; the two hex-named `.txt` files in `public/` are IndexNow key files (don't delete). `convert.py` and `convert_pages.py` are one-off scripts from the HTML→Astro migration. `.agents/skills/` holds SEO skills (keyword research, meta tags, schema markup, internal linking, content writing).
