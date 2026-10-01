export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface SchemaFAQItem {
  question: string;
  answer: string;
}

export interface SchemaHowToStep {
  name: string;
  text: string;
}

export interface SchemaArticleOptions {
  headline: string;
  description?: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
  reviewedByName?: string;
}

export interface SchemaToolOptions {
  name: string;
  description: string;
  applicationCategory?: string;
  price?: string;
  currency?: string;
}

export interface SchemaComparisonOptions {
  title: string;
  description: string;
  items: Array<{ name: string; url?: string; description?: string }>;
  tableRows?: Array<{ feature: string; competitorValue: string; arthaviValue: string }>;
}

export interface GeneratePageGraphOptions {
  canonical: string;
  title: string;
  description: string;
  pageType?: 'WebPage' | 'AboutPage' | 'ContactPage' | 'CollectionPage' | 'ItemPage';
  breadcrumbs?: BreadcrumbItem[];
  article?: SchemaArticleOptions;
  tool?: SchemaToolOptions;
  faqs?: SchemaFAQItem[];
  howTo?: {
    name: string;
    description: string;
    steps: SchemaHowToStep[];
  };
  comparison?: SchemaComparisonOptions;
  extraGraphNodes?: any[];
}

export const STABLE_IDS = {
  organization: 'https://arthavi.com/#organization',
  founder: 'https://arthavi.com/#founder',
  website: 'https://arthavi.com/#website',
  software: 'https://arthavi.com/#software',
  logo: 'https://arthavi.com/#logo'
} as const;

export const ORGANIZATION_ENTITY = {
  "@type": "Organization",
  "@id": STABLE_IDS.organization,
  "name": "Arthavi",
  "url": "https://arthavi.com",
  "logo": {
    "@type": "ImageObject",
    "@id": STABLE_IDS.logo,
    "url": "https://arthavi.com/images/logo.png",
    "caption": "Arthavi"
  },
  "foundingDate": "2026",
  "description": "Privacy-first portfolio tracker for Indian investors. Track Mutual Funds and Stocks with automated CAS statement import and zero broker credentials.",
  "sameAs": [
    "https://x.com/arthavi_app",
    "https://twitter.com/arthavi_app",
    "https://www.linkedin.com/company/arthavi",
    "https://github.com/arthavi",
    "https://www.producthunt.com/products/arthavi",
    "https://www.instagram.com/arthavi.app"
  ],
  "founder": {
    "@id": STABLE_IDS.founder
  }
};

export const FOUNDER_ENTITY = {
  "@type": "Person",
  "@id": STABLE_IDS.founder,
  "name": "Tejas Chaudhari",
  "url": "https://tejaschaudhari.com",
  "jobTitle": "Founder & Engineer",
  "worksFor": {
    "@id": STABLE_IDS.organization
  },
  "description": "Full Stack Engineer & Quantitative Finance enthusiast building privacy-first portfolio analytics for Indian retail investors.",
  "sameAs": [
    "https://x.com/tejas038",
    "https://twitter.com/tejas038",
    "https://www.linkedin.com/in/tejas038",
    "https://github.com/tejas038"
  ]
};

export const WEBSITE_ENTITY = {
  "@type": "WebSite",
  "@id": STABLE_IDS.website,
  "url": "https://arthavi.com",
  "name": "Arthavi",
  "description": "Privacy-first portfolio tracker for Indian investors. Auto-imports CAS statements with zero broker login.",
  "publisher": {
    "@id": STABLE_IDS.organization
  },
  "inLanguage": "en-IN"
};

export const SOFTWARE_APPLICATION_ENTITY = {
  "@type": "SoftwareApplication",
  "@id": STABLE_IDS.software,
  "name": "Arthavi",
  "applicationCategory": "FinanceApplication",
  "operatingSystem": "Web, Android, iOS",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "INR"
  },
  "inLanguage": "en-IN",
  "description": "Privacy-first portfolio tracker for Indian investors with automated CAS statement import, XIRR analysis, and AI chat."
};

export function buildPageGraph(opts: GeneratePageGraphOptions): string {
  const canonicalUrl = opts.canonical.replace(/\/$/, '') + '/';
  const webpageId = `${canonicalUrl}#webpage`;

  const webpageEntity: any = {
    "@type": opts.pageType || "WebPage",
    "@id": webpageId,
    "url": canonicalUrl,
    "name": opts.title,
    "description": opts.description,
    "isPartOf": {
      "@id": STABLE_IDS.website
    },
    "about": {
      "@id": STABLE_IDS.software
    },
    "publisher": {
      "@id": STABLE_IDS.organization
    },
    "inLanguage": "en-IN"
  };

  const graphNodes: any[] = [
    ORGANIZATION_ENTITY,
    FOUNDER_ENTITY,
    WEBSITE_ENTITY,
    SOFTWARE_APPLICATION_ENTITY,
    webpageEntity
  ];

  // 1. Breadcrumbs
  if (opts.breadcrumbs && opts.breadcrumbs.length > 0) {
    const breadcrumbId = `${canonicalUrl}#breadcrumb`;
    webpageEntity.breadcrumb = { "@id": breadcrumbId };

    graphNodes.push({
      "@type": "BreadcrumbList",
      "@id": breadcrumbId,
      "itemListElement": opts.breadcrumbs.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        "item": item.url
      }))
    });
  }

  // 2. Tool / WebApplication
  if (opts.tool) {
    const toolId = `${canonicalUrl}#app`;
    webpageEntity.mainEntity = { "@id": toolId };

    graphNodes.push({
      "@type": "WebApplication",
      "@id": toolId,
      "name": opts.tool.name,
      "description": opts.tool.description,
      "applicationCategory": opts.tool.applicationCategory || "FinanceApplication",
      "operatingSystem": "Web, Android, iOS",
      "browserRequirements": "Requires JavaScript. Requires HTML5.",
      "offers": {
        "@type": "Offer",
        "price": opts.tool.price || "0",
        "priceCurrency": opts.tool.currency || "INR"
      },
      "inLanguage": "en-IN",
      "author": {
        "@id": STABLE_IDS.organization
      }
    });
  }

  // 3. Article / Guide
  if (opts.article) {
    const articleId = `${canonicalUrl}#article`;
    webpageEntity.mainEntity = { "@id": articleId };

    graphNodes.push({
      "@type": "Article",
      "@id": articleId,
      "headline": opts.article.headline,
      "description": opts.article.description || opts.description,
      "url": canonicalUrl,
      "datePublished": opts.article.datePublished,
      "dateModified": opts.article.dateModified || opts.article.datePublished,
      "image": opts.article.image || "https://arthavi.com/images/og-image.png",
      "mainEntityOfPage": {
        "@id": webpageId
      },
      "author": {
        "@id": STABLE_IDS.founder
      },
      "publisher": {
        "@id": STABLE_IDS.organization
      },
      "reviewedBy": {
        "@id": STABLE_IDS.founder
      },
      "inLanguage": "en-IN"
    });
  }

  // 4. HowTo (Calculators)
  if (opts.howTo) {
    graphNodes.push({
      "@type": "HowTo",
      "@id": `${canonicalUrl}#howto`,
      "name": opts.howTo.name,
      "description": opts.howTo.description,
      "step": opts.howTo.steps.map((s, idx) => ({
        "@type": "HowToStep",
        "position": idx + 1,
        "name": s.name,
        "text": s.text
      }))
    });
  }

  // 5. FAQPage
  if (opts.faqs && opts.faqs.length > 0) {
    graphNodes.push({
      "@type": "FAQPage",
      "@id": `${canonicalUrl}#faq`,
      "mainEntity": opts.faqs.map(f => ({
        "@type": "Question",
        "name": f.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": f.answer
        }
      }))
    });
  }

  // 6. Comparison Pages (ItemList + Table)
  if (opts.comparison) {
    graphNodes.push({
      "@type": "ItemList",
      "@id": `${canonicalUrl}#itemlist`,
      "name": opts.comparison.title,
      "description": opts.comparison.description,
      "itemListElement": opts.comparison.items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        ...(item.url ? { "url": item.url } : {}),
        ...(item.description ? { "description": item.description } : {})
      }))
    });

    if (opts.comparison.tableRows && opts.comparison.tableRows.length > 0) {
      graphNodes.push({
        "@type": "Table",
        "@id": `${canonicalUrl}#table`,
        "about": opts.comparison.title
      });
    }
  }

  // 7. Extra Nodes (e.g. from existing specific pages)
  if (opts.extraGraphNodes && opts.extraGraphNodes.length > 0) {
    for (const node of opts.extraGraphNodes) {
      // Ensure no fake ratings are pushed
      if (node["@type"] !== "AggregateRating" && !node.aggregateRating) {
        graphNodes.push(node);
      }
    }
  }

  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": graphNodes
  });
}
