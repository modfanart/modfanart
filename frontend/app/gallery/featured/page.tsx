'use client';
import { LayoutWrapper } from '@/components/layout-wrapper';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';
import Link from 'next/link';
import { useGetArtworksQuery } from '@/app/api/artworkApi';
import { Skeleton } from '@/components/ui/skeleton'; // optional – for loading state
import type { ArtworkListItem } from '@/app/api/artworkApi'; // make sure this is exportedimport type { ArtworkListItem } from '@/services/api/artworkApi';   // make sure this is exported
export default function FeaturedGalleryPage() {
  // Fetch real artworks (you can later add ?featured=true when backend supports it)
  const { data, isLoading, error } = useGetArtworksQuery();

  const artworks = data?.artworks ?? [];

  // Optional: better loading + error handling
  if (isLoading) {
    return (
      <LayoutWrapper>
        <div className="container py-10">
          <h1 className="text-4xl font-bold tracking-tight mb-8 text-center">
            Featured Fan Art Gallery
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-square w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </LayoutWrapper>
    );
  }

  if (error) {
    return (
      <LayoutWrapper>
        <div className="container py-10 text-center">
          <h2 className="text-2xl font-bold text-destructive">Failed to load featured artworks</h2>
          <p className="mt-2 text-muted-foreground">Please try again later</p>
        </div>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper>
      <div className="container py-10">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Featured Fan Art Gallery</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover exceptional fan art that has been licensed through our platform
          </p>
        </div>

        <Tabs defaultValue="all" className="mb-8">
          <div className="flex justify-center">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="characters">Characters</TabsTrigger>
              <TabsTrigger value="superhero">Superhero</TabsTrigger>
              <TabsTrigger value="anime">Anime & Games</TabsTrigger>
              <TabsTrigger value="other">Other</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="mt-6">
            <ArtworkGrid artworks={artworks} />
          </TabsContent>

          <TabsContent value="characters" className="mt-6">
            <ArtworkGrid
              artworks={artworks.filter(
                (art) =>
                  art.title.toLowerCase().includes('hulk') ||
                  art.title.toLowerCase().includes('batman') ||
                  art.title.toLowerCase().includes('superman') ||
                  art.title.toLowerCase().includes('ahsoka') ||
                  art.title.toLowerCase().includes('squid')
              )}
            />
          </TabsContent>

          <TabsContent value="superhero" className="mt-6">
            <ArtworkGrid
              artworks={artworks.filter(
                (art) =>
                  art.title.toLowerCase().includes('hulk') ||
                  art.title.toLowerCase().includes('batman') ||
                  art.title.toLowerCase().includes('superman')
              )}
            />
          </TabsContent>

          <TabsContent value="anime" className="mt-6">
            <ArtworkGrid
              artworks={artworks.filter(
                (art) =>
                  art.title.toLowerCase().includes('cherry') ||
                  art.title.toLowerCase().includes('squid') ||
                  art.title.toLowerCase().includes('ahsoka')
              )}
            />
          </TabsContent>

          <TabsContent value="other" className="mt-6">
            <ArtworkGrid
              artworks={artworks.filter(
                (art) =>
                  !art.title.toLowerCase().includes('hulk') &&
                  !art.title.toLowerCase().includes('batman') &&
                  !art.title.toLowerCase().includes('superman') &&
                  !art.title.toLowerCase().includes('cherry') &&
                  !art.title.toLowerCase().includes('squid') &&
                  !art.title.toLowerCase().includes('ahsoka')
              )}
            />
          </TabsContent>
        </Tabs>

        <div className="text-center mt-10">
          <Button asChild size="lg">
            <Link href="/gallery/available">Browse Available Artwork</Link>
          </Button>
        </div>
      </div>
    </LayoutWrapper>
  );
}

// Reusable grid component (DRY)
function ArtworkGrid({ artworks }: { artworks: ArtworkListItem[] }) {
  if (artworks.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No artworks found in this category yet...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {artworks.map((art) => (
        <Card key={art.id} className="overflow-hidden">
          <div className="aspect-square relative bg-muted">
            {art.thumbnail_url ? (
              <Image
                src={art.thumbnail_url}
                alt={art.title}
                fill
                className="object-cover transition-transform hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                No preview
              </div>
            )}
          </div>
          <CardHeader>
            <CardTitle className="line-clamp-1">{art.title}</CardTitle>
            {/* 
              Missing artist & license info in current API response
              → you will need to extend ArtworkListItem in the future
            */}
            <CardDescription>Published artwork</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Views: {art.views_count} • ♥ {art.favorites_count}
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="default" className="w-full">
              <Link href={`/gallery/artwork/${art.id}`}>View Details</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
