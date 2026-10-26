'use client';

import { useCallback, useSyncExternalStore } from 'react';
import type { Currency } from '@/services/api/marketplaceApi';

const KEY = 'mod_currency';
const listeners = new Set<() => void>();

function read(): Currency {
  try {
    const v = window.localStorage.getItem(KEY);
    return v === 'USD' ? 'USD' : 'INR';
  } catch {
    return 'INR';
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener('storage', cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener('storage', cb);
  };
}

// Buyer's display + checkout currency, shared across the storefront, cart and
// checkout. The backend prices every variant in both INR and USD; this only
// decides which one is shown and sent to /cart/checkout.
export function useCurrency(): [Currency, (c: Currency) => void] {
  const currency = useSyncExternalStore(subscribe, read, () => 'INR' as Currency);

  const setCurrency = useCallback((c: Currency) => {
    try {
      window.localStorage.setItem(KEY, c);
    } catch {
      /* storage unavailable — keep working with the default */
    }
    listeners.forEach((l) => l());
  }, []);

  return [currency, setCurrency];
}
