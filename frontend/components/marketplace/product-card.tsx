'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import type { MerchProduct } from '@/types/merch';

interface ProductCardProps {
  product: MerchProduct;
  currency?: 'USD' | 'INR';
}

export function ProductCard({ product, currency = 'USD' }: ProductCardProps) {
  const priceCents = getMinPrice(product, currency);
  const imageUrl =
    product.primary_image_url ||
    product.artwork?.thumbnail_url ||
    '/placeholder-product.png';

  return (
    <Link
      href={`/product/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Image
          src={imageUrl}
          alt={product.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        {product.base_product_type && (
          <Badge className="absolute left-2 top-2 capitalize" variant="secondary">
            {product.base_product_type.replace('_', ' ')}
          </Badge>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="line-clamp-2 font-medium leading-snug group-hover:underline">
          {product.title}
        </h3>
        {product.seller?.username && (
          <p className="text-xs text-muted-foreground">
            by {product.seller.username}
          </p>
        )}
        <p className="mt-auto pt-2 text-base font-semibold">
          {formatPrice(priceCents, currency)}
          {product.variants && product.variants.length > 1 && (
            <span className="ml-1 text-xs font-normal text-muted-foreground">
              +
            </span>
          )}
        </p>
      </div>
    </Link>
  );
}

function getMinPrice(product: MerchProduct, currency: 'USD' | 'INR'): number {
  const key = currency === 'INR' ? 'price_inr_cents' : 'price_usd_cents';
  if ((product as any)[key] != null) return (product as any)[key];
  if (product.variants?.length) {
    const prices = product.variants
      .filter((v) => v.is_active)
      .map((v) => (currency === 'INR' ? v.price_inr_cents : v.price_usd_cents));
    return prices.length ? Math.min(...prices) : 0;
  }
  return 0;
}

function formatPrice(cents: number, currency: 'USD' | 'INR'): string {
  const amount = cents / 100;
  return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}
