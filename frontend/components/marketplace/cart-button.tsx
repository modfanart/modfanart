'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';

import { useAuth } from '@/store/AuthContext';
import { useGetCartQuery } from '@/services/api/marketplaceApi';

// Header cart icon with a live item count. Hidden for signed-out visitors
// (the cart is server-side and tied to the account).
export function CartButton() {
  const { user, loading } = useAuth();
  const { data: cart } = useGetCartQuery(undefined, { skip: loading || !user });

  if (loading || !user) return null;

  const count = cart?.items.reduce((n, i) => n + i.quantity, 0) ?? 0;

  return (
    <Link
      href="/marketplace/cart"
      aria-label={`Cart, ${count} item${count === 1 ? '' : 's'}`}
      className="relative flex h-10 w-10 items-center justify-center rounded-full bg-background/90 backdrop-blur transition hover:bg-background"
    >
      <ShoppingBag size={18} className="text-foreground" />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold text-primary-foreground">
          {count}
        </span>
      )}
    </Link>
  );
}
