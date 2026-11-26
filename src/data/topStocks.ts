// Stocks whose pages get real numbers baked into the static HTML at build time (for search engines and AI crawlers,
// which do not run the page's JavaScript). Chosen 2026-11-27 from PostHog: arthavi.com /stocks/ pages with 2+ visitors
// in 90 days, plus the first stock app users added (first_stock_added, 2+ users). Revisit every few months.
export const TOP_STOCK_SLUGS = [
  'reliance-industries', 'zomato', 'eternal', 'state-bank-of-india', 'steel-authority-of-india', '360-one-wam',
  'hindustan-aeronautics', 'computer-age-management-services', 'axis-bank', 'suzlon-energy', 'solar-industries-india',
  'kpit-technologies', 'ntpc', 'tata-elxsi', 'irctc', 'hdfc-asset-management-company', 'sagility', 'britannia-industries',
  'indian-bank', 'varun-beverages', 'sun-pharmaceutical', 'urban-company', 'tata-consumer-products', 'hindustan-unilever',
  'uco-bank', 'central-bank-of-india', 'karur-vysya-bank', 'kotak-mahindra-bank', 'hudco', 'bharti-airtel',
  'tata-consultancy-services', 'bel', 'bse', 'adani-ports', 'hdfc-bank', 'multi-commodity-exchange-of-india', 'ongc',
  'icici-bank', 'adani-power',
];

const API = 'https://setu2.arthavi.com/api/public/stocks/';
const cache = new Map<string, Promise<any | null>>();

// Build-time snapshot from Arthavi's public stock API (Yahoo Finance data). Returns null when the API has no price,
// so the page falls back to its placeholders and the browser update, and a failed fetch never breaks the build.
export function getStockSnapshot(slug: string): Promise<any | null> {
  if (!TOP_STOCK_SLUGS.includes(slug)) return Promise.resolve(null);
  if (!cache.has(slug)) {
    cache.set(slug, fetch(API + slug, { signal: AbortSignal.timeout(10000) })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => (d && d.price > 0 ? d : null))
      .catch(() => null));
  }
  return cache.get(slug)!;
}

// shortcut: backend multiplies yfinance dividendYield by 100 although yfinance already returns a percent (1.91 -> 191);
// drop this once backend stock_detail_updater.py stops multiplying. No listed stock yields over 25%.
export const normaliseYield = (y: number | null | undefined) => (y == null ? null : y > 25 ? +(y / 100).toFixed(2) : y);
