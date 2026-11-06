'use client';

import { useDeferredValue, useState } from 'react';
import Link from 'next/link';
import { PackageSearch } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { MarketplaceFilters } from '@/components/marketplace/marketplace-filters';
import { ProductCard, ProductGridSkeleton } from '@/components/marketplace/product-card';
import { useGetMerchProductsQuery, type MerchFilters } from '@/services/api/marketplaceApi';

export default function MarketplacePage() {
  const [filters, setFilters] = useState<MerchFilters>({ sort: 'newest' });

  // Don't fire a request on every keystroke.
  const deferred = useDeferredValue(filters);
  const { data: products, isFetching, isLoading, isError, refetch } = useGetMerchProductsQuery(
    deferred
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Marketplace</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Official merch from MOD artists and brands — tees, prints, mugs and more.
          </p>
        </div>
      </header>

      <MarketplaceFilters value={filters} onChange={setFilters} />

      {isLoading ? (
        <ProductGridSkeleton />
      ) : isError ? (
        <div className="mx-auto max-w-lg rounded-xl border border-destructive/30 bg-destructive/5 p-10 text-center">
          <h2 className="text-lg font-semibold text-destructive">Couldn&apos;t load the marketplace</h2>
          <Button className="mt-4" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      ) : products && products.length > 0 ? (
        <div
          className={`grid grid-cols-1 gap-6 transition-opacity sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${
            isFetching ? 'opacity-60' : ''
          }`}
        >
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 rounded-xl border bg-muted/30 p-10 text-center">
          <PackageSearch className="h-10 w-10 text-muted-foreground" />
          <p className="text-lg font-medium">Nothing matches yet</p>
          <p className="text-sm text-muted-foreground">
            Try a different search, or check back soon — new drops land regularly.
          </p>
          <Button variant="outline" asChild>
            <Link href="/gallery">Browse the gallery instead</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
