// Canonical public URLs. Prefer the human-readable slug (added for every
// contest and product by migration 20261114000000); fall back to the id for
// rows created before it ran. The API resolves either.

export function contestHref(c: { id: string; slug?: string | null | undefined }): string {
  return `/contest/${encodeURIComponent(c.slug || c.id)}`;
}

export function productHref(p: { id: string; slug?: string | null | undefined }): string {
  return `/marketplace/product/${encodeURIComponent(p.slug || p.id)}`;
}
