'use client';

import { useState, useMemo } from 'react';
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
  Settings,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ProductCard } from '@/components/marketplace/product-card';

import { useGetBrandBySlugQuery } from '@/services/api/brands';

// ── SAFE IMAGE HELPER ───────────────────────────────────────
function getImage(src?: string | null) {
  if (!src) return '/placeholder.svg';
  if (src.startsWith('http')) return src;
  return src;
}

export default function BrandStorefrontPage() {
  const params = useParams();
  const slug = typeof params?.['slug'] === 'string' ? params['slug'] : '';

  const { data: brand, isLoading, isError, error } = useGetBrandBySlugQuery(slug, { skip: !slug });

  const [searchQuery, setSearchQuery] = useState('');

  const artworks = useMemo(() => brand?.artworks ?? [], [brand?.artworks]);

  const filteredArtworks = useMemo(() => {
    const sorted = [...artworks].sort((a: any, b: any) => {
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;
      return (a.sort_order ?? 0) - (b.sort_order ?? 0);
    });

    return sorted.filter((art: any) =>
      art.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [artworks, searchQuery]);

  const socialEntries = useMemo(() => {
    return Object.entries(brand?.social_links ?? {}).filter(([, url]) => !!url);
  }, [brand?.social_links]);

  // ── LOADING ────────────────────────────────────────────────
  if (isLoading) return <BrandStorefrontSkeleton />;

  // ── ERROR STATE ────────────────────────────────────────────
  if (!slug || isError || !brand) {
    return (
      <div className="container mx-auto py-20 flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Brand Not Found</AlertTitle>
          <AlertDescription>
            {(error as any)?.data?.message ||
              'This brand profile does not exist or is currently unavailable.'}
          </AlertDescription>
        </Alert>

        <Button className="mt-8" asChild>
          <Link href="/marketplace">Back to Marketplace</Link>
        </Button>
      </div>
    );
  }

  const {
    name = 'Unnamed Brand',
    description = 'No description available.',
    logo_url,
    banner_url,
    website,
  } = brand;

  return (
    <div className="min-h-screen bg-background">
      {/* Banner */}
      <div className="relative h-64 w-full md:h-80 lg:h-96 overflow-hidden">
        <Image
          src={getImage(banner_url)}
          alt={`${name} banner`}
          fill
          className="object-cover brightness-[0.9]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
      </div>

      <div className="container relative -mt-20 px-4 pb-20 md:px-6 lg:-mt-28">
        {/* HEADER CARD */}
        <Card className="shadow-lg border bg-background/95 backdrop-blur">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
              {/* LEFT SIDE */}
              <div className="flex flex-col md:flex-row md:items-end gap-6">
                {/* LOGO */}
                <div className="relative h-28 w-28 md:h-36 md:w-36 rounded-2xl overflow-hidden border bg-muted shadow-md">
                  <Image
                    src={getImage(logo_url)}
                    alt={`${name} logo`}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* INFO */}
                <div className="text-center md:text-left">
                  <h1 className="text-3xl md:text-5xl font-bold tracking-tight">{name}</h1>

                  <p className="mt-3 text-muted-foreground max-w-2xl">{description}</p>

                  {/* SOCIALS */}
                  {socialEntries.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-2 justify-center md:justify-start">
                      {website && (
                        <Badge variant="secondary">
                          <a href={website} target="_blank">
                            <Globe className="h-4 w-4 mr-1" />
                            Website
                          </a>
                        </Badge>
                      )}

                      {socialEntries.map(([platform, url]) => (
                        <Badge key={platform} variant="outline">
                          <a href={url as string} target="_blank">
                            {platform === 'twitter' && <Twitter className="h-4 w-4 mr-1" />}
                            {platform === 'instagram' && <Instagram className="h-4 w-4 mr-1" />}
                            {platform}
                          </a>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ACTION */}
              <Button variant="outline" asChild className="gap-2">
                <Link href={`/dashboard/brand/${slug}`}>
                  <Settings className="h-4 w-4" />
                  Manage Brand
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* DIVIDER */}
        <Separator className="my-10" />

        {/* ARTWORK HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <h2 className="text-2xl md:text-4xl font-bold">Available Works</h2>

          <div className="relative w-full sm:w-80">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search artworks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* GRID */}
        {filteredArtworks.length === 0 ? (
          <div className="mt-10 flex flex-col items-center justify-center py-20 text-center border rounded-xl bg-muted/30">
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">No works found</h3>
            <p className="text-muted-foreground mt-2 max-w-md">
              {searchQuery
                ? `No results for "${searchQuery}"`
                : "This brand hasn't added artworks yet."}
            </p>

            {searchQuery && (
              <Button variant="outline" className="mt-6" onClick={() => setSearchQuery('')}>
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filteredArtworks.map((art: any) => (
              <ProductCard
                key={art.id}
                id={art.id}
                title={art.title}
                price={art.price ?? 0}
                imageUrl={getImage(art.thumbnail_url)}
                artist={name}
                slug={art.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ───────────────── SKELETON (UNCHANGED LOGIC) ───────────────── */
function BrandStorefrontSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-64 w-full bg-muted animate-pulse" />

      <div className="container -mt-20 px-4 pb-20">
        <div className="flex gap-8">
          <Skeleton className="h-32 w-32 rounded-2xl" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-6 w-2/3" />
          </div>
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
