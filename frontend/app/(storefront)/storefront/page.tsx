'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useGetPublishedProductsQuery } from '@/services/api/merchApi';
import { ProductCard } from '@/components/marketplace/product-card';
import { MarketplaceFilters } from '@/components/marketplace/marketplace-filters';
import { ProductSkeleton } from '@/components/marketplace/product-skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingBag, Search } from 'lucide-react';
import type { MerchProduct } from '@/services/types/merch';

const BASE_TYPES = [
  'all',
  'tshirt',
  'hoodie',
  'mug',
  'poster',
  'canvas',
  'sticker',
  'phone_case',
  'tote',
  'other',
] as const;

export default function MarketplacePage() {
  const { data, isLoading, isError, refetch } = useGetPublishedProductsQuery();
  const [search, setSearch] = useState('');
  const [baseType, setBaseType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc'>(
    'newest'
  );

  const products = data?.products ?? [];

  const filtered = useMemo(() => {
    let list = [...products];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.description ?? '').toLowerCase().includes(q)
      );
    }

    if (baseType !== 'all') {
      list = list.filter((p) => p.base_product_type === baseType);
    }

    list.sort((a, b) => {
      if (sortBy === 'newest') {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }
      const priceA = getDisplayPriceCents(a);
      const priceB = getDisplayPriceCents(b);
      return sortBy === 'price_asc' ? priceA - priceB : priceB - priceA;
    });

    return list;
  }, [products, search, baseType, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Marketplace
              </h1>
              <p className="mt-2 text-muted-foreground">
                Official merch and print products from creators and brands.
              </p>
            </div>
            <Button asChild variant="outline" className="w-fit">
              <Link href="/cart">
                <ShoppingBag className="mr-2 h-4 w-4" />
                View cart
              </Link>
            </Button>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <MarketplaceFilters
              baseType={baseType}
              onBaseTypeChange={setBaseType}
              sortBy={sortBy}
              onSortByChange={setSortBy}
              baseTypes={BASE_TYPES}
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {isLoading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
            <p className="text-muted-foreground">
              Could not load marketplace products.
            </p>
            <Button onClick={() => refetch()}>Try again</Button>
          </div>
        )}

        {!isLoading && !isError && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
            <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            <p className="text-lg font-medium">No products found</p>
            <p className="text-sm text-muted-foreground">
              Try a different search or filter.
            </p>
          </div>
        )}

        {!isLoading && !isError && filtered.length > 0 && (
          <>
            <p className="mb-4 text-sm text-muted-foreground">
              {filtered.length} product{filtered.length === 1 ? '' : 's'}
            </p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function getDisplayPriceCents(product: MerchProduct): number {
  if (product.price_usd_cents != null) return product.price_usd_cents;
  if (product.variants?.length) {
    const prices = product.variants
      .filter((v) => v.is_active)
      .map((v) => v.price_usd_cents);
    return prices.length ? Math.min(...prices) : 0;
  }
  return 0;
}
