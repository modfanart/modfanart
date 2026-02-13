'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Filter, Search as SearchIcon, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

import { useGetArtworksQuery } from '../../services/api/artworkApi';
// ── Types ───────────────────────────────────────────────────────────────
interface MarketplaceProduct {
  id: string;
  title: string;
  description: string | null;
  price: number;
  imageUrl: string;
  artistName: string;
  artistId: string;
  isNew: boolean;
  isPopular: boolean;
  slug: string;
  favoritesCount: number;
  createdAt: string;
}

// ── Product Card ────────────────────────────────────────────────────────
function ProductCard({ product }: { product: MarketplaceProduct }) {
  return (
    <Link
      href={`/marketplace/product/${product.id}`}
      className="group block overflow-hidden rounded-xl border bg-card hover:shadow-xl hover:border-primary/30 transition-all duration-300"
    >
      <div className="relative aspect-square overflow-hidden bg-muted/40">
        <Image
          src={product.imageUrl}
          alt={product.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          placeholder="blur"
          blurDataURL="/placeholder-product-lowres.jpg"
        />
        {product.isNew && (
          <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-medium px-2.5 py-1 rounded-full shadow-sm">
            New
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-medium line-clamp-2 leading-tight mb-1 group-hover:text-primary transition-colors">
          {product.title}
        </h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <span>by {product.artistName}</span>
        </div>
        <div className="font-semibold text-lg">${product.price.toFixed(2)}</div>
      </div>
    </Link>
  );
}

// ── Main Component ──────────────────────────────────────────────────────
export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const {
    data: artworksResponse,
    isLoading: artworksLoading,
    isError: artworksError,
  } = useGetArtworksQuery(
    {
      status: 'published',
      limit: 60,
      page: 1,
    },
    { refetchOnMountOrArgChange: true }
  );
  // Transform artworks → products (using placeholder artist info)
  const products = useMemo<MarketplaceProduct[]>(() => {
    const artworks = artworksResponse?.artworks ?? [];

    return artworks.map((art: any) => {
      const daysOld = (Date.now() - new Date(art.created_at).getTime()) / (1000 * 60 * 60 * 24);

      // Option A: Simple placeholder artist name
      const shortId = art.creator_id.slice(0, 8);
      const artistName = `Creator ${shortId}`; // or just "Anonymous Creator"

      return {
        id: art.id,
        title: art.title,
        description: art.description,
        price: 49.99, // placeholder — to be replaced with real pricing later
        imageUrl: art.thumbnail_url || art.file_url || '/placeholder-artwork.jpg',
        artistName,
        artistId: art.creator_id,
        isNew: daysOld <= 14,
        isPopular: (art.favorites_count || 0) >= 10,
        slug: `${art.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${art.id.slice(0, 8)}`,
        favoritesCount: art.favorites_count || 0,
        createdAt: art.created_at,
      };
    });
  }, [artworksResponse]);

  // Client-side search & tab filtering
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;

    const q = searchQuery.toLowerCase().trim();
    return products.filter(
      (p) => p.title.toLowerCase().includes(q) || p.artistName.toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  const displayedProducts = useMemo(() => {
    if (activeTab === 'new') return filteredProducts.filter((p) => p.isNew);
    if (activeTab === 'popular') return filteredProducts.filter((p) => p.isPopular);
    return filteredProducts;
  }, [filteredProducts, activeTab]);

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:py-12 max-w-7xl">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Marketplace</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Discover unique digital art & officially licensed designs
        </p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-10 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-lg">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search artwork, characters..."
            className="pl-12 h-11 text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2 h-11 px-6">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[90%] sm:w-96">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>More options coming soon</SheetDescription>
            </SheetHeader>
            <div className="py-10 text-center text-muted-foreground">
              Categories • Price • License type • Sort
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {artworksLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
          <Loader2 className="h-14 w-14 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground animate-pulse">Loading fresh creations...</p>
        </div>
      ) : artworksError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-12 text-center max-w-2xl mx-auto">
          <h3 className="text-xl font-semibold text-destructive mb-4">
            Couldn't load the marketplace
          </h3>
          <Button onClick={() => window.location.reload()}>Refresh</Button>
        </div>
      ) : (
        <>
          <Tabs defaultValue="all" className="space-y-8" onValueChange={setActiveTab as any}>
            <TabsList className="inline-flex h-auto border-b bg-transparent p-0 rounded-none w-full justify-start gap-10">
              <TabsTrigger
                value="all"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary pb-3 text-base"
              >
                All
              </TabsTrigger>
              <TabsTrigger
                value="new"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary pb-3 text-base"
              >
                New Arrivals
              </TabsTrigger>
              <TabsTrigger
                value="popular"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary pb-3 text-base"
              >
                Popular
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-10">
              <ProductGrid products={displayedProducts} />
            </TabsContent>
            <TabsContent value="new" className="mt-10">
              <ProductGrid
                products={displayedProducts}
                emptyMessage="No new pieces in the last 14 days"
              />
            </TabsContent>
            <TabsContent value="popular" className="mt-10">
              <ProductGrid products={displayedProducts} emptyMessage="Nothing popular yet" />
            </TabsContent>
          </Tabs>

          {/* Featured Creators & Brands - optional / disabled for now */}
          {/* Uncomment when you're ready to show brands & creators */}
          {/* 
          {featuredStorefronts.length > 0 && (
            <section className="mt-20 pt-10 border-t">
              ...
            </section>
          )}
          */}
        </>
      )}
    </div>
  );
}

function ProductGrid({
  products,
  emptyMessage = 'No artworks found',
}: {
  products: MarketplaceProduct[];
  emptyMessage?: string;
}) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-12 border rounded-xl bg-muted/30">
        <p className="text-xl font-medium text-muted-foreground mb-3">{emptyMessage}</p>
        <p className="text-sm text-muted-foreground">Try a different search or check back soon</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 md:gap-8">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
