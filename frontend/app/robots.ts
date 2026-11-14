import type { MetadataRoute } from 'next';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.modfanofficial.com';

// TECH-03: robots.txt now points crawlers at the sitemap and keeps them out of
// private / transactional areas.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/judge/',
          '/settings',
          '/marketplace/cart',
          '/marketplace/checkout',
          '/marketplace/orders',
          '/marketplace/addresses',
          '/submissions/',
          '/results/',
        ],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
  };
}
