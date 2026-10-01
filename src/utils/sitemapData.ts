import fs from 'fs';
import path from 'path';

export interface SitemapEntry {
  url: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

const BASE_URL = 'https://arthavi.com';

function extractDateFromContent(content: string, filePath: string): string {
  // Check frontmatter patterns
  const modMatch = content.match(/dateModified["']?\s*:\s*["']([^"']+)["']/i) ||
                   content.match(/updatedAt["']?\s*:\s*["']([^"']+)["']/i) ||
                   content.match(/lastUpdated\s*=\s*["']([^"']+)["']/i);
  if (modMatch && modMatch[1]) return modMatch[1].split('T')[0];

  const pubMatch = content.match(/datePublished["']?\s*:\s*["']([^"']+)["']/i) ||
                   content.match(/publishedAt["']?\s*:\s*["']([^"']+)["']/i) ||
                   content.match(/date["']?\s*:\s*["']([^"']+)["']/i);
  if (pubMatch && pubMatch[1]) return pubMatch[1].split('T')[0];

  // Fallback to file mtime, formatted as YYYY-MM-DD
  try {
    const stats = fs.statSync(filePath);
    return stats.mtime.toISOString().split('T')[0];
  } catch {
    return '2026-01-01';
  }
}

export function getCategorizedSitemaps() {
  const pagesDir = path.resolve('src/pages');

  const tools: SitemapEntry[] = [];
  const guides: SitemapEntry[] = [];
  const comparisons: SitemapEntry[] = [];
  const corePages: SitemapEntry[] = [];

  function scan(dir: string) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'stocks') continue; // Handled by dedicated stocks sitemap
        scan(full);
      } else if (entry.name.endsWith('.astro')) {
        const content = fs.readFileSync(full, 'utf8');

        // Check if page is a redirect
        if (content.includes('Astro.redirect(')) continue;

        let rel = path.relative(pagesDir, full).replace(/\\/g, '/');
        let urlPath = '';

        if (rel === 'index.astro') {
          urlPath = '/';
        } else if (rel.endsWith('/index.astro')) {
          urlPath = '/' + rel.slice(0, -11) + '/';
        } else {
          urlPath = '/' + rel.slice(0, -6) + '/';
        }

        // Exclude 404
        if (urlPath === '/404/') continue;

        const lastmod = extractDateFromContent(content, full);

        if (urlPath.startsWith('/tools/') || urlPath.includes('calculator')) {
          tools.push({
            url: `${BASE_URL}${urlPath}`,
            lastmod,
            changefreq: 'monthly',
            priority: 0.8
          });
        } else if (urlPath.startsWith('/guides/') || urlPath.startsWith('/blog/') || urlPath.includes('how-to-')) {
          guides.push({
            url: `${BASE_URL}${urlPath}`,
            lastmod,
            changefreq: 'monthly',
            priority: 0.8
          });
        } else if (urlPath.startsWith('/alternatives/') || urlPath === '/compare/' || urlPath.includes('arthavi-vs-')) {
          comparisons.push({
            url: `${BASE_URL}${urlPath}`,
            lastmod,
            changefreq: 'weekly',
            priority: 0.8
          });
        } else {
          let priority = 0.7;
          let changefreq: SitemapEntry['changefreq'] = 'monthly';
          if (urlPath === '/') {
            priority = 1.0;
            changefreq = 'weekly';
          }
          corePages.push({
            url: `${BASE_URL}${urlPath}`,
            lastmod,
            changefreq,
            priority
          });
        }
      }
    }
  }

  scan(pagesDir);

  return { tools, guides, comparisons, corePages };
}

export function generateUrlSetXml(entries: SitemapEntry[]): string {
  const urlXmls = entries.map(item => `  <url>
    <loc>${item.url}</loc>
    <lastmod>${item.lastmod}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority.toFixed(1)}</priority>
  </url>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlXmls}
</urlset>`;
}
