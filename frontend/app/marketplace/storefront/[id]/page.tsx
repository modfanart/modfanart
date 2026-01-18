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

import { useGetUserByIdQuery } from '@/app/api/userApi'; // adjust path if needed

// Note: In real app, you would fetch products via another query (e.g. useGetArtworksByUserQuery)
// Here we simulate with placeholder products – replace with real query later
const mockProducts = [
  {
    id: 'prod-1',
    title: 'Hulk Nature T-Shirt',
    price: 29.99,
    imageUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hulk%20nature-2.jpg-ivaqVZqmxWtiQzqj7KrfCIH3S8XKHP.jpeg',
    artist: 'Sarah Johnson',
    brand: 'Marvel',
    isNew: true,
    isBestseller: false,
    slug: 'hulk-nature-tshirt',
  },
  // ... more mock items
];

export default function StorefrontPage() {
  const params = useParams<{ id: string }>();
  const userId = params.id;

  const { data: user, isLoading, isError } = useGetUserByIdQuery(userId!, {
    skip: !userId,
  });

  const [searchQuery, setSearchQuery] = useState('');

  // In real app → replace with actual products query filtered by userId/artistId/brandId
  const products = mockProducts; // ← placeholder

  const filteredProducts = products.filter((p) =>
    searchQuery
      ? p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.artist?.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  if (isLoading) {
    return (
      <div className="container py-12 flex justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="container flex h-[60vh] items-center justify-center text-center">
        <div>
          <h1 className="text-3xl font-bold">Storefront Not Found</h1>
          <p className="mt-4 text-muted-foreground">
            The artist or brand profile you're looking for doesn't exist or is private.
          </p>
          <Button className="mt-6" asChild>
            <Link href="/marketplace">Back to Marketplace</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Derive storefront-like data from UserProfile
  const isBrand = user.role?.name?.toLowerCase().includes('brand') || false;
  const displayName = user.username || user.profile?.displayName || 'Unknown Creator';
  const bio = user.bio || user.profile?.bio || 'No description available.';
  const avatar = user.avatar_url || '/placeholder.svg?height=150&width=150';
  const banner = user.banner_url || '/placeholder.svg?height=300&width=1200';

  const socialLinks = {
    website: user.website || user.profile?.website,
    twitter: user.profile?.twitter,
    instagram: user.profile?.instagram,
  };

  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      {/* Banner */}
      <div className="relative mb-8 h-48 w-full overflow-hidden rounded-lg md:h-64">
        <Image
          src={banner}
          alt={`${displayName} banner`}
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Profile / Storefront Info */}
      <div className="mb-10 flex flex-col items-center gap-6 md:flex-row md:items-start">
        <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-background shadow-md md:h-32 md:w-32">
          <Image src={avatar} alt={`${displayName} avatar`} fill className="object-cover" />
        </div>

        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{displayName}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isBrand ? 'Official Brand' : 'Artist'}
          </p>

          <p className="mt-4 max-w-3xl text-muted-foreground">{bio}</p>

          <div className="mt-5 flex justify-center gap-4 md:justify-start">
            {socialLinks.website && (
              <a
                href={socialLinks.website}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full p-2.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <Globe className="h-5 w-5" />
              </a>
            )}
            {socialLinks.twitter && (
              <a
                href={socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full p-2.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
            )}
            {socialLinks.instagram && (
              <a
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full p-2.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Products</h2>
        <div className="w-full sm:max-w-xs">
          <Search
            placeholder="Search products or artist..."
            onSearch={(q) => setSearchQuery(q)}
          />
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
              .map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="bestsellers" className="mt-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts
              .filter((p) => p.isBestseller)
              .map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}