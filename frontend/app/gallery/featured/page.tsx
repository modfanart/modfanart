'use client';

import { LayoutWrapper } from '@/components/layout-wrapper';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, Eye, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useGetArtworksQuery } from '@/services/api/artworkApi';
import type { ArtworkListItem } from '@/services/api/artworkApi';

export default function FeaturedGalleryPage() {
  const { data, isLoading, error } = useGetArtworksQuery({ limit: 30 });

  const artworks = data?.artworks ?? [];

  const getFilteredArtworks = (category: string) => {
    if (category === 'all') return artworks;

    const lower = category.toLowerCase();
    return artworks.filter((art) => {
      const titleLower = art.title.toLowerCase();

      if (lower === 'characters') {
        return (
          titleLower.includes('hulk') ||
          titleLower.includes('batman') ||
          titleLower.includes('superman') ||
          titleLower.includes('ahsoka') ||
          titleLower.includes('squid') ||
          titleLower.includes('character') ||
          titleLower.includes('portrait')
        );
      }
      if (lower === 'superhero') {
        return (
          titleLower.includes('hulk') ||
          titleLower.includes('batman') ||
          titleLower.includes('superman')
        );
      }
      if (lower === 'anime') {
        return (
          titleLower.includes('anime') ||
          titleLower.includes('cherry') ||
          titleLower.includes('squid') ||
          titleLower.includes('ahsoka') ||
          titleLower.includes('game') ||
          titleLower.includes('pixel')
        );
      }
      if (lower === 'other') {
        return !(
          titleLower.includes('hulk') ||
          titleLower.includes('batman') ||
          titleLower.includes('superman') ||
          titleLower.includes('ahsoka') ||
          titleLower.includes('squid') ||
          titleLower.includes('cherry') ||
          titleLower.includes('anime') ||
          titleLower.includes('pixel') ||
          titleLower.includes('game')
        );
      }
      return true;
    });
  };

  if (isLoading) {
    return (
      <LayoutWrapper>
        <div className="container py-8 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar skeleton */}
            <aside className="lg:col-span-3">
              <div className="bg-white rounded-2xl p-6 space-y-4 border border-gray-200 shadow-sm">
                {['All', 'Characters', 'Superhero', 'Anime & Games', 'Other'].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-xl bg-gray-200" />
                ))}
              </div>
            </aside>

            {/* Main grid skeleton */}
            <div className="lg:col-span-9">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                {Array.from({ length: 15 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-[2/3] w-full rounded-2xl bg-gray-200" />
                    <Skeleton className="h-5 w-4/5 mx-auto rounded bg-gray-200" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </LayoutWrapper>
    );
  }

  if (error) {
    return (
      <LayoutWrapper>
        <div className="text-center space-y-6 px-6">
          <h2 className="text-4xl font-bold text-gray-900">Failed to load gallery</h2>
          <Button variant="outline" size="lg" className="border-gray-400 text-gray-700">
            <Link href="/gallery/featured">Try Again</Link>
          </Button>
        </div>
      </LayoutWrapper>
    );
  }

  const filters = [
    { value: 'all', label: 'All' },
    { value: 'characters', label: 'Characters' },
    { value: 'superhero', label: 'Superhero' },
    { value: 'anime', label: 'Anime & Games' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <LayoutWrapper>
      <div className="container py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar with Filters */}
          <aside className="lg:col-span-3">
            <div className="sticky top-6 lg:top-20">
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-5 space-y-2">
                  {filters.map((filter) => (
                    <button
                      key={filter.value}
                      className={cn(
                        'w-full flex items-center justify-start px-4 py-3.5 rounded-xl text-left transition-all duration-200 font-medium',
                        filter.value === 'all'
                          ? 'bg-indigo-100 text-indigo-800 border border-indigo-300 shadow-sm'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      )}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Gallery Area */}
          <div className="lg:col-span-9">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 md:gap-6">
              {getFilteredArtworks('all').map((art) => (
                <Link
                  key={art.id}
                  href={`/artwork/${art.id}`}
                  className="group block focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.04] hover:shadow-xl hover:shadow-gray-300/50"
                >
                  <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-gray-100">
                    {art.thumbnail_url || art.file_url ? (
                      <Image
                        src={art.thumbnail_url || art.file_url}
                        alt={art.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(min-width: 1024px) 20vw, (min-width: 768px) 25vw, 50vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                        <ImageIcon className="h-14 w-14 text-gray-400" />
                      </div>
                    )}

                    {/* Bottom overlay - light version */}
                    <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-white via-white/80 to-transparent" />

                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="font-semibold text-base md:text-lg line-clamp-2 drop-shadow-md text-gray-900">
                        {art.title}
                      </h3>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <Eye className="h-3.5 w-3.5" />
                          {art.views_count.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Heart className="h-3.5 w-3.5" />
                          {art.favorites_count.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer strip */}
                  <div className="flex items-center justify-between px-4 py-2.5 bg-white border-t border-gray-200">
                    <Badge
                      variant="outline"
                      className="text-xs border-indigo-400 bg-indigo-50 text-indigo-700 px-2.5 py-0.5"
                    >
                      Featured
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(art.created_at).getFullYear()}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {getFilteredArtworks('all').length === 0 && (
              <div className="text-center py-32 text-gray-500">
                <ImageIcon className="mx-auto h-20 w-20 mb-6 opacity-60" />
                <p className="text-2xl font-medium">No featured artworks yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 pb-8">
          <Button
            size="lg"
            className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 gap-2 shadow-md text-white"
          >
            Explore All Available Artwork
          </Button>
        </div>
      </div>
    </LayoutWrapper>
  );
}
