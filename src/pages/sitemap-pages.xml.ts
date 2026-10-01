import type { APIRoute } from 'astro';
import { getCategorizedSitemaps, generateUrlSetXml } from '../utils/sitemapData';

export const GET: APIRoute = async () => {
  const { corePages } = getCategorizedSitemaps();
  return new Response(generateUrlSetXml(corePages), {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
};
