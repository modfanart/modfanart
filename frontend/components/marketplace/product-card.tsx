'use client';

import Link from 'next/link';
import { Star } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { Currency, MerchProduct } from '@/services/api/marketplaceApi';
import { FULFILLMENT_LABEL, formatProductPrice, titleCase } from '@/lib/marketplace/format';
import { ProductImage } from './product-image';

const NEW_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;

export function ProductCard({ product, currency }: { product: MerchProduct; currency: Currency }) {
  const isNew = Date.now() - new Date(product.created_at).getTime() < NEW_WINDOW_MS;

  return (
    <Link href={`/marketplace/product/${product.id}`} className="group block">
      <Card className="overflow-hidden transition-all hover:shadow-md hover:ring-2 hover:ring-primary/20">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <ProductImage
            src={product.image_url}
            alt={product.title}
            className="transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {isNew && <Badge className="bg-blue-500 text-white hover:bg-blue-500">New</Badge>}
            {product.fulfillment_type === 'print_on_demand' && (
              <Badge variant="secondary">Made to order</Badge>
            )}
          </div>
        </div>

        <div className="space-y-1 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {titleCase(product.base_product_type)}
          </p>
          <h3 className="line-clamp-2 font-medium leading-tight group-hover:text-primary">
            {product.title}
          </h3>
          <p className="text-sm text-muted-foreground">
            by {product.brand_name || product.seller_name || 'MOD creator'}
          </p>

          <div className="flex items-center justify-between pt-1">
            <span className="font-semibold">{formatProductPrice(product, currency)}</span>
            {product.rating_count > 0 && (
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                {product.rating_avg.toFixed(1)}
                <span className="text-xs">({product.rating_count})</span>
              </span>
            )}
          </div>
          <p className="sr-only">{FULFILLMENT_LABEL[product.fulfillment_type]}</p>
        </div>
      </Card>
    </Link>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border">
          <div className="aspect-square animate-pulse bg-muted" />
          <div className="space-y-2 p-4">
            <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
