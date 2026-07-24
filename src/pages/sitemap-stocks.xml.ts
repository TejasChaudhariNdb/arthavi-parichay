import type { APIRoute } from 'astro';
import { STOCK_SEED_DATA } from '../data/stockSeedData';

function getLatestTradingDate(): string {
  const date = new Date();
  const day = date.getDay(); // 0 = Sun, 6 = Sat
  if (day === 0) date.setDate(date.getDate() - 2);
  else if (day === 6) date.setDate(date.getDate() - 1);
  return date.toISOString().split('T')[0];
}

export const GET: APIRoute = async () => {
  const lastmodDate = getLatestTradingDate();
  const baseUrl = 'https://arthavi.com';

  const subroutes = ['', 'share-price', 'financials', 'dividend', 'shareholding-pattern', 'peer-comparison'];

  const urlEntries: string[] = [];

  for (const stock of STOCK_SEED_DATA) {
    for (const sub of subroutes) {
      const path = sub ? `/stocks/${stock.slug}/${sub}/` : `/stocks/${stock.slug}/`;
      const priority = sub === '' ? '0.9' : '0.8';
      urlEntries.push(`
  <url>
    <loc>${baseUrl}${path}</loc>
    <lastmod>${lastmodDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${priority}</priority>
  </url>`);
    }
  }

  // Category pages
  const categories = ['technology', 'banking', 'finance', 'energy', 'defence', 'fmcg', 'automobile', 'healthcare', 'nifty-50', 'dividend-stocks', 'large-cap'];
  for (const cat of categories) {
    urlEntries.push(`
  <url>
    <loc>${baseUrl}/stocks/${cat}/</loc>
    <lastmod>${lastmodDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
  }

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries.join('')}
</urlset>`;

  return new Response(sitemapXml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
};
