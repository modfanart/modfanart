'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search } from '@/components/search';
import { Instagram, Twitter, Globe } from 'lucide-react';

// ─── Import Brand type + queries from your RTK Query API ───
import {
  useGetBrandQuery,
  // useGetBrandBySlugQuery,   // ← uncomment if using slug-based routes
  Brand, // ← the interface we want to use
} from '@/services/api/brands'; // adjust path to match your structure

// Temporary mock products – replace with useGetBrandArtworksQuery later
const mockProducts = [
  {
    id: 'prod-1',
    title: 'Hulk Nature T-Shirt',
    price: 29.99,
    imageUrl:
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hulk%20nature-2.jpg-ivaqVZqmxWtiQzqj7KrfCIH3S8XKHP.jpeg',
    artist: 'Sarah Johnson',
    brand: 'Marvel',
    isNew: true,
    isBestseller: false,
    slug: 'hulk-nature-tshirt',
  },
  // ... more mock items
] as const;

export default function BrandStorefrontPage() {
  const params = useParams<{ id: string }>();
  const paramValue = params.id;

  // For UUID-based route:   /storefront/[id] where id = brand UUID
  const {
    data: brand,
    isLoading,
    isError,
    error,
  } = useGetBrandQuery(paramValue!, {
    skip: !paramValue,
  });

  // Alternative (uncomment if your route uses slug instead):
  // const { data: brand, isLoading, isError, error } = useGetBrandBySlugQuery(paramValue!, {
  //   skip: !paramValue,
  // });

  const [searchQuery, setSearchQuery] = useState('');

  // TODO: Replace with real data
  // const { data: brandArtworks = [] } = useGetBrandArtworksQuery(
  //   { brandId: brand?.id ?? '', limit: 20 },
  //   { skip: !brand?.id }
  // );
  const products = mockProducts;

  const filteredProducts = products.filter(
    (p) =>
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.artist ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.brand ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="container py-12 flex justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isError || !brand) {
    return (
      <div className="container flex h-[60vh] items-center justify-center text-center">
        <div>
          <h1 className="text-3xl font-bold">Brand Not Found</h1>
          <p className="mt-4 text-muted-foreground">
            {(error as any)?.data?.message ??
              'This brand profile does not exist or is unavailable.'}
          </p>
          <Button className="mt-6" asChild>
            <Link href="/marketplace">Back to Marketplace</Link>
          </Button>
        </div>
      </div>
    );
  }

  // ─── Use the Brand interface fields ───
  const displayName: string = brand.name || 'Unknown Brand';
  const bio: string = brand.description || 'No description available.';
  const avatar: string = brand.logo_url || '/placeholder.svg?height=150&width=150';
  const banner: string = brand.banner_url || '/placeholder.svg?height=300&width=1200';

  // Combine website + social_links (which is Record<string, string> | null)
  const socialLinks: Record<'website', string | undefined> = {
    website: brand.website ?? undefined,
  };
  const hasSocials = !!socialLinks.website;

  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      {/* Banner */}
      <div className="relative mb-8 h-48 w-full overflow-hidden rounded-lg md:h-64">
        <Image src={banner} alt={`${displayName} banner`} fill className="object-cover" priority />
      </div>

      {/* Brand Header */}
      <div className="mb-10 flex flex-col items-center gap-6 md:flex-row md:items-start">
        <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-background shadow-md md:h-32 md:w-32">
          <Image src={avatar} alt={`${displayName} logo`} fill className="object-cover" />
        </div>

        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{displayName}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Official Brand</p>

          <p className="mt-4 max-w-3xl text-muted-foreground">{bio}</p>

          {hasSocials && (
            <div className="mt-5 flex justify-center gap-4 md:justify-start">
              {socialLinks.website && (
                <a
                  href={socialLinks.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Website"
                  className="rounded-full p-2.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <Globe className="h-5 w-5" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Products Section */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Products</h2>
        <div className="w-full sm:max-w-xs">
          <Search onSearch={setSearchQuery} />
        </div>
      </div>

      <Tabs defaultValue="all" className="mb-8">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="new">New Arrivals</TabsTrigger>
          <TabsTrigger value="bestsellers">Bestsellers</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {filteredProducts.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <p className="text-muted-foreground">No products found</p>
              {searchQuery && (
                <Button variant="link" onClick={() => setSearchQuery('')}>
                  Clear search
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="new" className="mt-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts
              .filter((p) => p.isNew)
              .map((p) => (
                <ProductCard key={p.id} {...p} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="bestsellers" className="mt-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts
              .filter((p) => p.isBestseller)
              .map((p) => (
                <ProductCard key={p.id} {...p} />
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
