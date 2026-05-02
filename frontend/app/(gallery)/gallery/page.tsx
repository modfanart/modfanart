'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, Eye, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useGetArtworksQuery } from '@/services/api/artworkApi';

export default function FeaturedGalleryPage() {
  const { data, isLoading, error } = useGetArtworksQuery({ limit: 30 });

  const artworks = data?.artworks ?? [];
  const [activeFilter, setActiveFilter] = useState('all');

  const filters = [
    { value: 'all', label: 'All' },
    { value: 'characters', label: 'Characters' },
    { value: 'superhero', label: 'Superhero' },
    { value: 'anime', label: 'Anime & Games' },
    { value: 'other', label: 'Other' },
  ];

  const getFilteredArtworks = (category: string) => {
    if (category === 'all') return artworks;

    const lower = category.toLowerCase();

    return artworks.filter((art) => {
      const title = art.title.toLowerCase();

      if (lower === 'characters') {
        return (
          title.includes('hulk') ||
          title.includes('batman') ||
          title.includes('superman') ||
          title.includes('ahsoka') ||
          title.includes('squid') ||
          title.includes('character') ||
          title.includes('portrait')
        );
      }

      if (lower === 'superhero') {
        return title.includes('hulk') || title.includes('batman') || title.includes('superman');
      }

      if (lower === 'anime') {
        return (
          title.includes('anime') ||
          title.includes('cherry') ||
          title.includes('squid') ||
          title.includes('ahsoka') ||
          title.includes('game') ||
          title.includes('pixel')
        );
      }

      if (lower === 'other') {
        return !(
          title.includes('hulk') ||
          title.includes('batman') ||
          title.includes('superman') ||
          title.includes('ahsoka') ||
          title.includes('squid') ||
          title.includes('cherry') ||
          title.includes('anime') ||
          title.includes('pixel') ||
          title.includes('game')
        );
      }

      return true;
    });
  };

  const filteredArtworks = getFilteredArtworks(activeFilter);

  /* ---------------- LOADING ---------------- */
  if (isLoading) {
    return (
      <div className="container py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-3">
            <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl shadow-lg p-6 space-y-4">
              {filters.map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-xl bg-muted" />
              ))}
            </div>
          </aside>

          <div className="lg:col-span-9 columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-6 space-y-6">
            {Array.from({ length: 15 }).map((_, i) => (
              <Skeleton key={i} className="w-full h-60 rounded-2xl break-inside-avoid bg-muted" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- ERROR ---------------- */
  if (error) {
    return (
      <div className="text-center space-y-6 px-6 py-20">
        <h2 className="text-4xl font-bold text-foreground">Failed to load gallery</h2>
        <Button variant="outline" size="lg" asChild>
          <Link href="/gallery/featured">Try Again</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-10 lg:py-14">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ---------------- SIDEBAR ---------------- */}
        <aside className="lg:col-span-3">
          <div className="sticky top-24">
            <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl shadow-lg p-5 space-y-2">
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setActiveFilter(filter.value)}
                  className={cn(
                    'w-full px-4 py-3 rounded-xl text-left font-medium transition-all duration-200',
                    activeFilter === filter.value
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'text-muted-foreground hover:text-primary hover:bg-accent'
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ---------------- GRID ---------------- */}
        <div className="lg:col-span-9">
          <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-6 space-y-6">
            {filteredArtworks.map((art) => (
              <Link
                key={art.id}
                href={`/artwork/${art.id}`}
                className="group block break-inside-avoid"
              >
                <div className="relative rounded-2xl overflow-hidden bg-muted/30 border border-white/20 shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md">
                  {art.thumbnail_url || art.file_url ? (
                    <Image
                      src={art.thumbnail_url || art.file_url}
                      alt={art.title}
                      width={500}
                      height={700}
                      className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-60 bg-muted">
                      <ImageIcon className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition" />

                  {/* Stats */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition">
                    <div className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-sm rounded-xl px-3 py-2 flex justify-between text-xs">
                      <div className="flex gap-3 text-foreground">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5" />
                          {art.views_count.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="h-3.5 w-3.5" />
                          {art.favorites_count.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Title */}
                <div className="px-1 pt-2">
                  <p className="text-sm font-medium text-foreground line-clamp-2">{art.title}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* EMPTY */}
          {filteredArtworks.length === 0 && (
            <div className="text-center py-32 text-muted-foreground">
              <ImageIcon className="mx-auto h-20 w-20 mb-6 opacity-60" />
              <p className="text-2xl font-medium">No artworks found in this category</p>
            </div>
          )}
        </div>
      </div>

      {/* ---------------- CTA ---------------- */}
      <div className="text-center mt-16 pb-8">
        <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
          Explore All Available Artwork
        </Button>
      </div>
    </div>
  );
}
