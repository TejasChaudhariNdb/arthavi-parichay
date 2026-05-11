import { defineConfig } from 'astro/config';
import sitemap, { ChangeFreqEnum } from '@astrojs/sitemap';

const today = new Date().toISOString().split('T')[0];

export default defineConfig({
  site: 'https://arthavi.com',
  integrations: [
    sitemap({
      filenameBase: 'sitemap',
      serialize(item) {
        if (item.url === 'https://arthavi.com/') {
          item.changefreq = ChangeFreqEnum.WEEKLY;
          item.priority = 1.0;
        } else if (item.url === 'https://arthavi.com/about/' ||
                   item.url === 'https://arthavi.com/contact/' ||
                   item.url === 'https://arthavi.com/security/' ||
                   item.url === 'https://arthavi.com/privacy/' ||
                   item.url === 'https://arthavi.com/terms/') {
          item.changefreq = ChangeFreqEnum.MONTHLY;
          item.priority = 0.6;
        } else if (/\/(sip|swp|xirr|cagr|mutual-fund)-calculator\//.test(item.url)) {
          item.changefreq = ChangeFreqEnum.MONTHLY;
          item.priority = 0.8;
        } else if (/arthavi-vs-/.test(item.url)) {
          item.changefreq = ChangeFreqEnum.WEEKLY;
          item.priority = 0.7;
        } else if (/blog\//.test(item.url)) {
          item.changefreq = ChangeFreqEnum.MONTHLY;
          item.priority = 0.6;
        } else {
          item.changefreq = ChangeFreqEnum.WEEKLY;
          item.priority = 0.7;
        }
        item.lastmod = today;
        return item;
      },
    }),
  ],
});
