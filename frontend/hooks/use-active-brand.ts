'use client';

// Which brand a brand manager is working on. This used to be the [slug]
// segment of /brand-manager/<slug>/..., which made every dashboard URL long.
// It is now session state: remembered in localStorage, defaulting to the
// first brand, and settable from the sidebar switcher or a ?brand=<slug>
// query (used by redirects from the old URLs).

import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { useAuth } from '@/store/AuthContext';

const KEY = 'mod.activeBrand';
const listeners = new Set<() => void>();
let current: string | null = null;
let loaded = false;

function load() {
  if (loaded || typeof window === 'undefined') return;
  loaded = true;
  try {
    const fromQuery = new URLSearchParams(window.location.search).get('brand');
    current = fromQuery || window.localStorage.getItem(KEY);
    if (fromQuery) window.localStorage.setItem(KEY, fromQuery);
  } catch {
    current = null;
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot() {
  load();
  return current;
}

export function setActiveBrandSlug(slug: string) {
  current = slug;
  try {
    window.localStorage.setItem(KEY, slug);
  } catch {
    /* storage unavailable: keep in memory only */
  }
  listeners.forEach((l) => l());
}

export function useActiveBrand() {
  const { user } = useAuth();
  const brands = user?.brands ?? [];
  const chosen = useSyncExternalStore(subscribe, getSnapshot, () => null);
  const brand = brands.find((b) => b.slug === chosen) ?? brands[0] ?? null;

  // Forget a remembered brand the user no longer manages.
  useEffect(() => {
    if (chosen && brands.length && !brands.some((b) => b.slug === chosen) && brand?.slug) {
      setActiveBrandSlug(brand.slug);
    }
  }, [chosen, brands, brand?.slug]);

  const setActiveBrand = useCallback((slug: string) => setActiveBrandSlug(slug), []);
  return { brand, brands, setActiveBrand };
}
