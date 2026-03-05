// app/dashboard/brand/[brand-slug]/[brand_manager_id]/artworks/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PlusCircle, Star, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DashboardShell } from '@/components/dashboard-shell';

import {
  useGetBrandArtworksQuery,
  useAddArtworkToBrandMutation,
  useRemoveArtworkFromBrandMutation,
} from '@/services/api/brands';

import { useAuth } from '@/store/AuthContext';
export default function BrandArtworksPage() {
  const { user } = useAuth();
  const brandId = user?.brands?.[0]?.id ?? '';
  const brandSlug = user?.brands?.[0]?.slug ?? '';

  const { data: artworks = [], isLoading } = useGetBrandArtworksQuery(brandId, {
    skip: !brandId,
  });

  const [addArtwork] = useAddArtworkToBrandMutation();
  const [removeArtwork] = useRemoveArtworkFromBrandMutation();

  if (isLoading) return <div className="p-8">Loading artworks...</div>;

  return (
    <DashboardShell>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Storefront Artworks</h1>
          <Button asChild>
            <Link href={`/dashboard/brand/${brandSlug}/${user?.id}/artworks/new`}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Artwork
            </Link>
          </Button>
        </div>

        {artworks.length === 0 ? (
          <div className="text-center py-16 border rounded-lg">
            <p className="text-lg text-muted-foreground">No artworks in storefront yet</p>
            <Button className="mt-4" asChild>
              <Link href={`/dashboard/brand/${brandSlug}/${user?.id}/artworks/new`}>
                Add your first artwork
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {artworks.map((art) => (
              <Card key={art.id} className="overflow-hidden">
                <div className="aspect-square relative">
                  <Image
                    src={art.preview_url || '/placeholder.svg'}
                    alt={art.title}
                    fill
                    className="object-cover"
                  />
                  {art.is_featured && (
                    <Badge className="absolute top-2 right-2 bg-yellow-500">Featured</Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium line-clamp-1">{art.title}</h3>
                  <div className="mt-4 flex justify-end gap-2">
                    <Button variant="outline" size="sm">
                      <Star className="mr-2 h-4 w-4" />
                      {art.is_featured ? 'Unfeature' : 'Feature'}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (confirm('Remove this artwork from storefront?')) {
                          removeArtwork({ brandId, artworkId: art.id });
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
