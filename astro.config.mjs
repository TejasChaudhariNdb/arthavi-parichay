import { defineConfig } from 'astro/config';
import sitemap, { ChangeFreqEnum } from '@astrojs/sitemap';

const today = new Date().toISOString().split('T')[0];

export default defineConfig({
  site: 'https://arthavi.com',
  redirects: {
    '/index.html': '/',
    '/about.html': '/about',
    '/ai-portfolio-analyzer-market-research.html': '/ai-portfolio-analyzer-market-research',
    '/arthavi-vs-dezerv.html': '/arthavi-vs-dezerv',
    '/arthavi-vs-excel.html': '/arthavi-vs-excel',
    '/arthavi-vs-groww.html': '/arthavi-vs-groww',
    '/arthavi-vs-indmoney.html': '/arthavi-vs-indmoney',
    '/arthavi-vs-valueresearch.html': '/arthavi-vs-valueresearch',
    '/arthavi-vs-zerodha.html': '/arthavi-vs-zerodha',
    '/ask-ai-investment-assistant.html': '/ask-ai-investment-assistant',
    '/cagr-calculator.html': '/cagr-calculator',
    '/calculators.html': '/calculators',
    '/contact.html': '/contact',
    '/features.html': '/features',
    '/financial-planning.html': '/financial-planning',
    '/how-to-track-mutual-fund-portfolio-india.html': '/how-to-track-mutual-fund-portfolio-india',
    '/investing-for-beginners.html': '/investing-for-beginners',
    '/legal.html': '/legal',
    '/lumpsum-calculator.html': '/lumpsum-calculator',
    '/mutual-fund-calculator.html': '/mutual-fund-calculator',
    '/mutual-fund-portfolio-tracker-india.html': '/mutual-fund-portfolio-tracker-india',
    '/net-worth-tracker-india.html': '/net-worth-tracker-india',
    '/portfolio-tracker-india.html': '/portfolio-tracker-india',
    '/privacy.html': '/privacy',
    '/retirement-planning.html': '/retirement-planning',
    '/security.html': '/security',
    '/sip-calculator.html': '/sip-calculator',
    '/stock-portfolio-tracker-india.html': '/stock-portfolio-tracker-india',
    '/swp-calculator.html': '/swp-calculator',
    '/terms.html': '/terms',
    '/top-10-mutual-funds-for-sip-2026.html': '/top-10-mutual-funds-for-sip-2026',
    '/xirr-calculator-mutual-funds.html': '/xirr-calculator-mutual-funds',
    
    // Blog pages
    '/blog/5-reasons-stop-using-excel-portfolio-tracking.html': '/blog/5-reasons-stop-using-excel-portfolio-tracking',
    '/blog/best-ad-free-portfolio-tracker-india-2026.html': '/blog/best-ad-free-portfolio-tracker-india-2026',
    '/blog/excel-vs-portfolio-tracker.html': '/blog/excel-vs-portfolio-tracker',
    '/blog/guide-cams-cas-portfolio-tracker.html': '/blog/guide-cams-cas-portfolio-tracker',
    '/blog/how-to-download-analyze-cams-cas-statement.html': '/blog/how-to-download-analyze-cams-cas-statement',
    '/blog/how-to-track-everything-in-3-steps.html': '/blog/how-to-track-everything-in-3-steps',
    '/blog/how-to-track-family-portfolio-india.html': '/blog/how-to-track-family-portfolio-india',
    '/blog/privacy-alert-why-investment-apps-shouldnt-read-emails.html': '/blog/privacy-alert-why-investment-apps-shouldnt-read-emails',
    '/blog/track-family-investment-portfolio.html': '/blog/track-family-investment-portfolio',
    '/blog/track-stocks-mutual-funds-one-place-safely.html': '/blog/track-stocks-mutual-funds-one-place-safely',
    '/blog/track-zerodha-groww-portfolio-together.html': '/blog/track-zerodha-groww-portfolio-together'
  },
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
