import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const baseUrl = 'https://arthavi.com';
  const now = new Date().toISOString().split('T')[0];

  const sitemaps = [
    `${baseUrl}/sitemap-pages.xml`,
    `${baseUrl}/sitemap-tools.xml`,
    `${baseUrl}/sitemap-guides.xml`,
    `${baseUrl}/sitemap-comparisons.xml`,
    `${baseUrl}/sitemap-stocks.xml`,
  ];

  const xmlEntries = sitemaps.map(loc => `  <sitemap>
    <loc>${loc}</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`).join('\n');

  const sitemapIndexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlEntries}
</sitemapindex>`;

  return new Response(sitemapIndexXml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
};
