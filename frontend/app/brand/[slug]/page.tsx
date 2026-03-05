// app/brand/[slug]/page.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Globe,
  Instagram,
  Twitter,
  Search as SearchIcon,
  AlertCircle,
  ImageIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

import { skipToken } from '@reduxjs/toolkit/query';
import { ProductCard } from '@/components/product-card';
import { LayoutWrapper } from '@/components/layout-wrapper';

// ── Brand API ────────────────────────────────────────────────
import { useGetBrandBySlugQuery, Brand } from '@/services/api/brands';

import { useGetProductsQuery, Product, ProductFilters } from '@/services/api/productApi';
export default function BrandStorefrontPage() {
  const params = useParams();
  const slug = typeof params?.['slug'] === 'string' ? params['slug'] : '';
  // Fetch brand data
  const {
    data: brand,
    isLoading: brandLoading,
    isError: brandError,
    error: brandErrorData,
  } = useGetBrandBySlugQuery(slug, { skip: !slug });

  const [searchQuery, setSearchQuery] = useState('');

  // Prepare product filters
  const filters: ProductFilters = {
    ...(brand?.id && { brandId: brand.id }),
    ...(searchQuery.trim() && { search: searchQuery.trim() }),
    status: 'approved',
  };
  // Fetch products only when we have brand.id
  const {
    data: productsResponse,
    isLoading: productsLoading,
    isError: productsError,
  } = useGetProductsQuery(brand?.id ? filters : skipToken, {
    skip: !brand?.id,
  });

  const products = productsResponse?.data ?? [];

  // ── Combined loading state ─────────────────────────────────
  if (brandLoading || (brand?.id && productsLoading)) {
    return <BrandStorefrontSkeleton />;
  }

  // ── Brand not found or error ───────────────────────────────
  if (!slug || brandError || !brand) {
    return (
      <div className="container mx-auto py-20 flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Brand Not Found</AlertTitle>
          <AlertDescription>
            {(brandErrorData as any)?.data?.message ||
              'This brand profile does not exist or is currently unavailable.'}
          </AlertDescription>
        </Alert>
        <Button className="mt-8" asChild>
          <Link href="/marketplace">Back to Marketplace</Link>
        </Button>
      </div>
    );
  }

  // ── Safe destructuring with defaults ───────────────────────
  const {
    name = 'Unnamed Brand',
    description = 'No description available.',
    logo_url = '/placeholder.svg?height=120&width=120',
    banner_url = '/placeholder.svg?height=400&width=1200',
    website,
    social_links = {},
  } = brand;

  const socialEntries = Object.entries(social_links ?? {}).filter(([, url]) => !!url);
  return (
    <LayoutWrapper>
      <div className="min-h-screen bg-background">
        {/* Banner */}
        <div className="relative h-64 w-full md:h-80 lg:h-96 overflow-hidden">
          <Image
            src={banner_url ?? '/placeholder.svg'}
            alt={`${name} banner`}
            fill
            className="object-cover brightness-[0.88]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/45 to-transparent" />
        </div>

        <div className="container relative -mt-20 px-4 pb-20 md:px-6 lg:-mt-28">
          {/* Brand Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div className="flex flex-col items-center md:items-start md:flex-row md:gap-8 gap-6">
              {/* Logo */}
              <div className="relative h-32 w-32 md:h-40 md:w-40 rounded-2xl border-4 border-background shadow-2xl overflow-hidden bg-background shrink-0">
                <Image
                  src={logo_url ?? '/placeholder.svg'}
                  alt={`${name} logo`}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Name + Description + Social */}
              <div className="text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{name}</h1>
                <p className="mt-3 text-lg text-muted-foreground max-w-3xl">{description}</p>

                {socialEntries.length > 0 && (
                  <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-5">
                    {website && (
                      <a
                        href={website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Globe className="h-5 w-5" />
                        <span className="text-sm font-medium">Website</span>
                      </a>
                    )}
                    {socialEntries.map(([platform, url]) => (
                      <a
                        key={platform}
                        href={url as string}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {platform.toLowerCase() === 'twitter' && <Twitter className="h-5 w-5" />}
                        {platform.toLowerCase() === 'instagram' && (
                          <Instagram className="h-5 w-5" />
                        )}
                        <span className="text-sm font-medium capitalize">{platform}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Manage Button */}
            <Button variant="outline" asChild className="self-center md:self-end">
              <Link href={`/dashboard/brand/${slug}`}>Manage Brand</Link>
            </Button>
          </div>

          {/* Products Section */}
          <section className="mt-16 space-y-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Available Works</h2>

              <div className="relative w-full sm:w-80">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search this brand's works..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background"
                />
              </div>
            </div>

            {productsError ? (
              <div className="text-center py-16 text-muted-foreground border rounded-lg bg-muted/30">
                <p>Unable to load products right now. Please try again later.</p>
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center border rounded-xl bg-muted/30">
                <ImageIcon className="h-14 w-14 text-muted-foreground mb-5" />
                <h3 className="text-2xl font-semibold mb-3">No works found</h3>
                <p className="text-muted-foreground max-w-md">
                  {searchQuery
                    ? `No results matching "${searchQuery}". Try a different keyword.`
                    : "This brand hasn't added any works to their storefront yet."}
                </p>
                {searchQuery && (
                  <Button variant="outline" className="mt-6" onClick={() => setSearchQuery('')}>
                    Clear Search
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {products.map((product: Product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    title={product.title}
                    price={product.price}
                    imageUrl={
                      product.images?.[0] ||
                      '/placeholder.svg?height=420&width=420&text=' +
                        encodeURIComponent(product.title)
                    }
                    artist={product.artist?.name || product.artist?.username || brand.name}
                    slug={product.id} // ← use real slug if you add slug field later

                    // isNew={new Date(product.createdAt) > some date threshold}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </LayoutWrapper>
  );
}

// ────────────────────────────────────────────────────────────────
// Skeleton (unchanged but kept for completeness)
// ────────────────────────────────────────────────────────────────
function BrandStorefrontSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="relative h-64 w-full md:h-80 lg:h-96 bg-muted animate-pulse" />

      <div className="container relative -mt-20 px-4 pb-20 md:px-6 lg:-mt-28">
        <div className="flex flex-col md:flex-row md:items-end gap-8">
          <Skeleton className="h-32 w-32 md:h-40 md:w-40 rounded-2xl" />
          <div className="flex-1 space-y-5">
            <Skeleton className="h-12 w-3/4 max-w-md" />
            <Skeleton className="h-6 w-full max-w-2xl" />
            <Skeleton className="h-6 w-64" />
          </div>
        </div>

        <div className="mt-16 space-y-10">
          <div className="flex flex-col sm:flex-row justify-between gap-6">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-80" />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-[3/4] rounded-xl" />
                <Skeleton className="h-6 w-4/5" />
                <Skeleton className="h-5 w-3/5" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
