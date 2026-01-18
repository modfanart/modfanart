'use client';

import { useParams } from 'next/navigation';
import { LayoutWrapper } from '@/components/layout-wrapper';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Download, Share2, Heart } from 'lucide-react';
import { useGetArtworkQuery } from '@/app/api/artworkApi';
import { useGetArtworkTagsQuery } from '@/app/api/artworkTagsApi';
import { useGetArtworkCategoriesQuery } from '@/app/api/artworkApi';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

// ────────────────────────────────────────────────
// Exact models converted to TypeScript interfaces
// ────────────────────────────────────────────────

export interface ArtworkRow {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  file_url: string;
  thumbnail_url: string | null;
  source_file_url: string | null;
  status: 'draft' | 'published' | 'archived' | 'moderation_pending' | 'rejected';
  moderation_status: string;
  moderation_notes: string | null;
  moderated_by: string | null;
  moderated_at: string | null;
  views_count: number;
  favorites_count: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ArtworkPricingTierRow {
  id: string;
  artwork_id: string;
  license_type: 'personal' | 'commercial' | 'exclusive';
  price_inr_cents: number;
  price_usd_cents: number;
  is_active: boolean;
  created_at: string;
}

export interface ArtworkCategoryRow {
  artwork_id: string;
  category_id: string;
}

// Extend with joined/attached data your endpoint likely returns
export interface ArtworkDetail extends ArtworkRow {
  pricing_tiers: ArtworkPricingTierRow[];
  // If your /artwork/:id endpoint already joins category names, you could add:
  // categories?: { id: string; name: string; slug?: string }[];
  // For now we use separate query → categoryRows
}

export default function ArtworkDetailPage() {
  const params = useParams();
  const { id } = useParams<{ id: string }>();
  // id is now string | undefined automatically
  // Queries with skip guard to prevent invalid fetches
  const {
    data: artworkRaw,
    isLoading: artworkLoading,
    isError,
    error,
  } = useGetArtworkQuery(id!, {
    skip: !id,
  });

  const artwork = artworkRaw as ArtworkDetail | undefined;

  const { data: tags = [], isLoading: tagsLoading } = useGetArtworkTagsQuery(id!, {
    skip: !id,
  });

  const { data: categoryRows = [], isLoading: categoriesLoading } = useGetArtworkCategoriesQuery(
    id!,
    {
      skip: !id,
    }
  );

  const isLoading = artworkLoading || tagsLoading || categoriesLoading;

  // Sort categories alphabetically by name
  const sortedCategories = [...categoryRows].sort((a, b) => a.name.localeCompare(b.name));

  if (isLoading) {
    return (
      <LayoutWrapper>
        <div className="container py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12">
            <Skeleton className="aspect-square w-full rounded-xl" />
            <div className="space-y-6">
              <Skeleton className="h-10 lg:h-12 w-4/5" />
              <Skeleton className="h-6 w-2/5" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          </div>
        </div>
      </LayoutWrapper>
    );
  }

  if (isError || !artwork) {
    return (
      <LayoutWrapper>
        <div className="container py-20 text-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl lg:text-3xl font-bold mb-4">Artwork Not Found</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            {(error as any)?.data?.message || 'The requested artwork could not be loaded.'}
          </p>
          <Button asChild size="lg">
            <Link href="/gallery/featured">Back to Gallery</Link>
          </Button>
        </div>
      </LayoutWrapper>
    );
  }

  const isPublished = artwork.status === 'published';

  const formatPrice = (cents: number, currency: 'USD' | 'INR' = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: currency === 'INR' ? 0 : 2,
    }).format(cents / 100);
  };

  const createdDate = format(new Date(artwork.created_at), 'MMMM d, yyyy');

  return (
    <LayoutWrapper>
      <div className="container py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/gallery/featured"
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Gallery
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 mb-16">
          {/* Image Section */}
          <div className="bg-muted/40 rounded-2xl overflow-hidden border shadow-sm">
            <div className="aspect-square relative">
              <Image
                src={artwork.file_url || artwork.thumbnail_url || '/placeholder-artwork.svg'}
                alt={artwork.title}
                fill
                className="object-contain p-6 sm:p-10 md:p-12"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>

          {/* Details Section */}
          <div className="flex flex-col gap-7">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold leading-tight">{artwork.title}</h1>
              <p className="mt-3 text-lg text-muted-foreground">
                by Creator • {artwork.creator_id.slice(0, 8)}…
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Badge variant={isPublished ? 'default' : 'secondary'} className="text-sm px-3 py-1">
                {artwork.status.charAt(0).toUpperCase() + artwork.status.slice(1)}
              </Badge>
              <Badge variant="outline" className="text-sm px-3 py-1">
                {artwork.moderation_status}
              </Badge>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2.5">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag.id} variant="secondary" className="text-xs px-2.5 py-0.5">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Categories */}
            {sortedCategories.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2.5">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {sortedCategories.map((category) => (
                    <Badge key={category.id} variant="outline" className="text-xs px-2.5 py-0.5">
                      {category.name}
                      {/* Optional: add more info if desired */}
                      {/* {category.slug && ` (${category.slug})`} */}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-base">
              {artwork.description || 'No description provided for this artwork.'}
            </p>

            <Card className="border shadow-sm">
              <CardContent className="p-6 sm:p-7">
                <h3 className="text-xl font-semibold mb-5">Licensing Options</h3>

                {artwork.pricing_tiers?.length > 0 ? (
                  <div className="space-y-5">
                    {artwork.pricing_tiers
                      .filter((tier) => tier.is_active)
                      .map((tier) => (
                        <div
                          key={tier.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 last:border-b-0 last:pb-0"
                        >
                          <div>
                            <p className="font-medium capitalize text-lg">{tier.license_type}</p>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {formatPrice(tier.price_usd_cents, 'USD')} •{' '}
                              {formatPrice(tier.price_inr_cents, 'INR')}
                            </p>
                          </div>
                          <Button variant="outline" size="sm" className="w-full sm:w-auto">
                            Choose
                          </Button>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground py-2">
                    No pricing tiers defined yet. Please contact us for custom licensing options.
                  </p>
                )}

                <div className="mt-8 pt-6 border-t">
                  <Button size="lg" className="w-full" disabled={!isPublished}>
                    {isPublished ? 'Proceed to License' : 'Not Available for Licensing'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-3 gap-5 text-sm">
              <div>
                <span className="text-muted-foreground block mb-1">Created</span>
                <p className="font-medium">{createdDate}</p>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Views</span>
                <p className="font-medium">{artwork.views_count.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Favorites</span>
                <p className="font-medium">{artwork.favorites_count.toLocaleString()}</p>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex gap-4">
              <Button variant="outline" size="icon" title="Add to favorites">
                <Heart className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon" title="Share">
                <Share2 className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                disabled={!artwork.file_url}
                title="Download preview"
              >
                <Download className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
