import type { MetadataRoute } from 'next';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.modfanofficial.com';
const API =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:5000/api'
    : 'https://api.modfanofficial.com/api';

// TECH-03: /sitemap.xml returned 404. Static marketing pages plus public
// brands and contests (best-effort: if the API is down we still ship the
// static part rather than failing the whole sitemap).
export const revalidate = 3600;

const STATIC_PATHS = [
  '',
  '/for-artists',
  '/for-brands',
  '/for-creators',
  '/about',
  '/pricing',
  '/contact',
  '/contact/sales',
  '/explore',
  '/explore/contests',
  '/explore/brands',
  '/explore/artists',
  '/gallery',
  '/categories',
  '/marketplace',
  '/resources',
  '/resources/guidelines',
  '/resources/support',
  '/legal/terms-and-service',
  '/legal/privacy-policy',
  '/legal/submission-terms',
];

async function fetchJson(url: string): Promise<any> {
  try {
    const res = await fetch(url, { next: { revalidate } });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = STATIC_PATHS.map((p) => ({
    url: `${SITE}${p}`,
    lastModified: now,
    changeFrequency: p === '' ? 'daily' : 'weekly',
    priority: p === '' ? 1 : 0.7,
  }));

  const [brands, contests] = await Promise.all([
    fetchJson(`${API}/brands?status=active&limit=500`),
    fetchJson(`${API}/contest?limit=100`),
  ]);

  for (const b of brands?.brands ?? []) {
    if (b?.slug) entries.push({ url: `${SITE}/brand/${b.slug}`, changeFrequency: 'weekly', priority: 0.6 });
  }
  for (const c of contests?.contests ?? []) {
    if (c?.id) entries.push({ url: `${SITE}/contest/${c.id}`, changeFrequency: 'daily', priority: 0.8 });
  }

  return entries;
}
