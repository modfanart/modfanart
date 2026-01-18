'use client';

import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { Filter, Search } from 'lucide-react';

// Import RTK Query hook
import { useGetArtworksQuery } from '@/app/api/artworkApi'; // adjust path if needed

// Type for the shape your UI expects
interface GalleryArtwork {
  id: string;
  title: string;
  artist: string;
  imageUrl: string;
  ipOwner: string;
  price: string;
  licenseType: string;
  tags: string[];
}

export default function AvailableGalleryPage() {
  // Fetch artworks from API
  const { data, isLoading, isError, error } = useGetArtworksQuery(
    { limit: 20 }, // you can make these dynamic later
    {
      refetchOnMountOrArgChange: true,
    }
  );

  // Map API data → UI-friendly shape
  const artworks: GalleryArtwork[] = (data?.artworks ?? []).map((item) => ({
    id: item.id,
    title: item.title || 'Untitled Artwork',
    artist: 'Unknown Artist', // ← API doesn't return this yet
    imageUrl: item.thumbnail_url || '/placeholder-600x600.png',
    ipOwner: 'Various / Fan Art', // ← missing in current API
    price: '$149', // ← placeholder – add to backend later
    licenseType: 'Commercial', // ← placeholder
    tags: ['character', 'fanart'], // ← placeholder – ideally come from backend
  }));

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIpOwner, setSelectedIpOwner] = useState('all');
  const [selectedLicense, setSelectedLicense] = useState('all');

  // Client-side filtering (you can later move some to query params)
  const filteredArtworks = artworks.filter((art) => {
    const matchesSearch =
      art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.artist.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesIp = selectedIpOwner === 'all' || art.ipOwner === selectedIpOwner;
    const matchesLicense = selectedLicense === 'all' || art.licenseType === selectedLicense;

    return matchesSearch && matchesIp && matchesLicense;
  });

  if (isLoading) {
    return (
      <LayoutWrapper>
        <div className="container py-10">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold tracking-tight mb-2">Available for Licensing</h1>
            <p className="text-xl text-muted-foreground">Loading amazing artwork...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden animate-pulse">
                <div className="aspect-square bg-muted" />
                <CardHeader>
                  <div className="h-6 w-3/4 bg-muted rounded mb-2" />
                  <div className="h-4 w-1/2 bg-muted rounded" />
                </CardHeader>
                <CardContent>
                  <div className="h-4 w-2/3 bg-muted rounded mb-2" />
                  <div className="flex gap-2">
                    <div className="h-5 w-16 bg-muted rounded-full" />
                    <div className="h-5 w-20 bg-muted rounded-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </LayoutWrapper>
    );
  }

  if (isError) {
    return (
      <LayoutWrapper>
        <div className="container py-16 text-center">
          <h2 className="text-2xl font-bold text-destructive mb-4">Failed to load artworks</h2>
          <p className="text-muted-foreground mb-6">
            {(error as any)?.data?.message || 'Something went wrong. Please try again later.'}
          </p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper>
      <div className="container py-10">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Available for Licensing</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Browse and license high-quality fan art for your commercial projects
          </p>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title or artist..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Select value={selectedIpOwner} onValueChange={setSelectedIpOwner}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="IP Owner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All IP Owners</SelectItem>
                <SelectItem value="Disney">Disney</SelectItem>
                <SelectItem value="Nintendo">Nintendo</SelectItem>
                <SelectItem value="Marvel Comics">Marvel</SelectItem>
                <SelectItem value="Capcom">Capcom</SelectItem>
                <SelectItem value="Shueisha">Shueisha</SelectItem>
                <SelectItem value="Sanrio">Sanrio</SelectItem>
                <SelectItem value="Tezuka Productions">Tezuka</SelectItem>
                <SelectItem value="Original Creation">Original</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedLicense} onValueChange={setSelectedLicense}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="License Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Licenses</SelectItem>
                <SelectItem value="Commercial">Commercial</SelectItem>
                <SelectItem value="Limited Commercial">Limited Commercial</SelectItem>
                <SelectItem value="Personal">Personal Use</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="mb-12">
          <div className="flex justify-center mb-6">
            <TabsList className="grid w-full max-w-md grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="characters">Characters</TabsTrigger>
              <TabsTrigger value="anime">Anime & Manga</TabsTrigger>
              <TabsTrigger value="videogame">Video Games</TabsTrigger>
            </TabsList>
          </div>

          {['all', 'characters', 'anime', 'videogame'].map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredArtworks
                  .filter((art) => {
                    if (tab === 'all') return true;
                    if (tab === 'characters') return art.tags.includes('character');
                    if (tab === 'anime')
                      return art.tags.some((t) => ['anime', 'manga'].includes(t));
                    if (tab === 'videogame')
                      return art.tags.some((t) => ['videogame', 'fighting game'].includes(t));
                    return true;
                  })
                  .map((artwork) => (
                    <Card
                      key={artwork.id}
                      className="overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="aspect-[4/5] relative">
                        <Image
                          src={artwork.imageUrl}
                          alt={artwork.title}
                          fill
                          className="object-cover transition-transform hover:scale-105"
                        />
                        <Badge className="absolute top-3 right-3 bg-primary/90 backdrop-blur-sm">
                          {artwork.price}
                        </Badge>
                      </div>
                      <CardHeader className="pb-3">
                        <CardTitle className="line-clamp-1">{artwork.title}</CardTitle>
                        <CardDescription className="line-clamp-1">
                          By {artwork.artist} • {artwork.licenseType}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-4">
                        <p className="text-sm text-muted-foreground mb-3">IP: {artwork.ipOwner}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {artwork.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter className="gap-2 pt-2">
                        <Button variant="outline" className="flex-1">
                          Preview
                        </Button>
                        <Button className="flex-1" asChild>
                          <Link href={`/gallery/license/${artwork.id}`}>License Now</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}

                {filteredArtworks.length === 0 && (
                  <div className="col-span-full py-16 text-center text-muted-foreground">
                    No artworks found matching your filters.
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="text-center mt-16 border-t pt-10">
          <p className="text-lg text-muted-foreground mb-6">
            Are you an artist? Join our platform and start licensing your fan art today!
          </p>
          <Button asChild size="lg" className="px-8">
            <Link href="/submissions/new">Submit Your Artwork</Link>
          </Button>
        </div>
      </div>
    </LayoutWrapper>
  );
}
