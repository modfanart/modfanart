'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { CurrencyToggle } from '@/components/marketplace/currency-toggle';
import { ProductCard, ProductGridSkeleton } from '@/components/marketplace/product-card';
import { useGetMerchProductsQuery } from '@/services/api/marketplaceApi';
import { useCurrency } from '@/lib/marketplace/use-currency';

// A single brand's merch (linked from contest pages and product pages).
export default function BrandStorefrontMerchPage() {
  const { brandId } = useParams<{ brandId: string }>();
  const [currency] = useCurrency();
  const { data: products, isLoading } = useGetMerchProductsQuery({ brand_id: brandId });

  const brandName = products?.[0]?.brand_name;

  return (
    <div className="space-y-8">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/marketplace">
          <ArrowLeft className="mr-2 h-4 w-4" /> Marketplace
        </Link>
      </Button>

      <header className="flex items-end justify-between gap-4">
        <h1 className="text-3xl font-bold">{brandName ? `${brandName} storefront` : 'Brand storefront'}</h1>
        <CurrencyToggle />
      </header>

      {isLoading ? (
        <ProductGridSkeleton count={4} />
      ) : products && products.length ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} currency={currency} />
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
