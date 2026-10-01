#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const KEY = 'c4a9f987e9124a98a3b8d1b28e67a14e';
const HOST = 'arthavi.com';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

async function pingIndexNow() {
  console.log('[IndexNow] Starting search engine notification for Bing & Yandex...');

  // Read URLs from dist or key URLs
  const distDir = path.resolve('dist');
  let urlList = [
    `https://${HOST}/`,
    `https://${HOST}/tools/xirr-calculator/`,
    `https://${HOST}/tools/sip-return-calculator/`,
    `https://${HOST}/tools/mutual-fund-overlap/`,
    `https://${HOST}/tools/ltcg-stcg-calculator/`,
    `https://${HOST}/guides/how-to-track-mutual-funds-and-stocks-in-one-place/`,
    `https://${HOST}/guides/how-to-import-cas-cams-kfintech-nsdl/`,
    `https://${HOST}/guides/cas-statement-explained/`,
    `https://${HOST}/alternatives/mprofit/`,
    `https://${HOST}/alternatives/indmoney/`,
    `https://${HOST}/alternatives/kuvera/`,
    `https://${HOST}/blog/`,
    `https://${HOST}/stocks/`
  ];

  if (fs.existsSync(distDir)) {
    function getHtmlFiles(dir) {
      let results = [];
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          results = results.concat(getHtmlFiles(full));
        } else if (entry.name === 'index.html') {
          const rel = path.relative(distDir, path.dirname(full)).replace(/\\/g, '/');
          const pagePath = rel ? `/${rel}/` : '/';
          results.push(`https://${HOST}${pagePath}`);
        }
      }
      return results;
    }
    const foundUrls = getHtmlFiles(distDir);
    if (foundUrls.length > 0) {
      urlList = foundUrls;
    }
  }

  // IndexNow allows max 10,000 URLs per request
  const submitList = urlList.slice(0, 1000);

  const payload = {
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: submitList
  };

  console.log(`[IndexNow] Prepared ${submitList.length} URLs for instant submission.`);

  if (process.env.INDEXNOW_DRY_RUN === 'true' || process.env.CI === 'false' && !process.env.INDEXNOW_SUBMIT) {
    console.log('[IndexNow] Dry run active. Skipping remote HTTP request.');
    return;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (response.ok || response.status === 200 || response.status === 202) {
      console.log(`[IndexNow] Successfully notified IndexNow API (status ${response.status}).`);
    } else {
      console.warn(`[IndexNow] Search engines returned HTTP ${response.status}: ${await response.text()}`);
    }
  } catch (err) {
    console.warn(`[IndexNow] Network notification skipped or timed out: ${err.message}`);
  }
}

pingIndexNow();
