'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ProductCard, ProductGridSkeleton } from '@/components/marketplace/product-card';
import { useGetMerchProductsQuery } from '@/services/api/marketplaceApi';
import { useGetBrandQuery } from '@/services/api/brands';

// A single brand's merch (linked from contest pages and product pages).
export default function BrandStorefrontMerchPage() {
  const { brandId } = useParams<{ brandId: string }>();
  const { data: products, isLoading, isError, refetch } = useGetMerchProductsQuery({
    brand_id: brandId,
  });
  // The heading used to depend on the first product, so a brand with no
  // merch showed a generic "Brand storefront" title.
  const { data: brand } = useGetBrandQuery(brandId, { skip: !brandId });

  const brandName = brand?.name ?? products?.[0]?.brand_name;

  return (
    <div className="space-y-8">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/marketplace">
          <ArrowLeft className="mr-2 h-4 w-4" /> Marketplace
        </Link>
      </Button>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-3xl font-bold">{brandName ? `${brandName} storefront` : 'Brand storefront'}</h1>
        {brand?.slug && (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/brand/${brand.slug}`}>View brand page</Link>
          </Button>
        )}
      </header>

      {isLoading ? (
        <ProductGridSkeleton count={4} />
      ) : isError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive-subtle p-10 text-center">
          <p className="font-medium text-destructive">Couldn&apos;t load this storefront.</p>
          <Button className="mt-4" variant="outline" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      ) : products && products.length ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <p className="rounded-xl border bg-muted/30 p-10 text-center text-muted-foreground">
          This brand hasn&apos;t listed any merch yet.
        </p>
      )}
    </div>
  );
}
