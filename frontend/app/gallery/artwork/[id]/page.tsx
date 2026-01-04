import { LayoutWrapper } from '@/components/layout-wrapper';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Download, Share2, Heart } from 'lucide-react';

type Artwork = {
  id: string;
  title: string;
  artist: string;
  imageUrl: string;
  ipOwner: string;
  licenseType: string;
  price: string;
  description: string;
  createdAt: string;
  medium: string;
  dimensions: string;
  tags: string[];
};

const allArtwork: Artwork[] = [
  {
    id: 'art-1',
    title: 'Philippine Eagle Pencil Portrait',
    artist: 'Elena Rodriguez',
    imageUrl:
      'https://i.etsystatic.com/8079347/r/il/bbcf40/2142700466/il_570xN.2142700466_23f2.jpg',
    ipOwner: 'Wildlife Conservation Society',
    licenseType: 'Commercial',
    price: '$180',
    description:
      'A highly detailed pencil drawing capturing the intense gaze and distinctive crest of the Philippine Eagle in stunning black and white.',
    createdAt: 'September 15, 2023',
    medium: 'Pencil Drawing',
    dimensions: 'High Resolution Printable',
    tags: ['wildlife', 'pencil', 'black and white', 'portrait', 'bird of prey', 'endangered'],
  },
  {
    id: 'art-2',
    title: 'Philippine Eagle Line Art Symbol',
    artist: 'Michael Chen',
    imageUrl:
      'https://www.shutterstock.com/image-vector/philippine-eagle-symbol-line-art-260nw-1714646440.jpg',
    ipOwner: 'Wildlife Conservation Society',
    licenseType: 'Limited Commercial',
    price: '$150',
    description:
      'Clean and bold line art symbol of the Philippine Eagle, perfect for logos and conservation branding.',
    createdAt: 'October 22, 2023',
    medium: 'Line Art Illustration',
    dimensions: 'Vector Style (Scalable)',
    tags: ['minimalist', 'line art', 'symbol', 'black and white', 'bird of prey'],
  },
  {
    id: 'art-3',
    title: 'Philippine Eagle in Flight',
    artist: 'Elena Rodriguez',
    imageUrl: 'https://i.pinimg.com/1200x/b9/14/f8/b914f80ed18618cf00c418f5ea68bf8e.jpg',
    ipOwner: 'Wildlife Conservation Society',
    licenseType: 'Commercial',
    price: '$200',
    description:
      'Dynamic black and white illustration of the Philippine Eagle soaring with powerful wings extended.',
    createdAt: 'November 5, 2023',
    medium: 'Digital Line Art',
    dimensions: 'High Resolution',
    tags: ['wildlife', 'flight', 'line art', 'black and white', 'endangered'],
  },
  {
    id: 'art-4',
    title: 'Philippine Eagle Head Vector',
    artist: 'Michael Chen',
    imageUrl:
      'https://www.clipartmax.com/png/middle/333-3336405_philippine-eagle-clipart-eagle-head-vector-png.png',
    ipOwner: 'Wildlife Conservation Society',
    licenseType: 'Extended Commercial',
    price: '$120',
    description:
      'Crisp vector line art of the Philippine Eagle head, ideal for icons and symbolic use.',
    createdAt: 'December 12, 2023',
    medium: 'Vector Illustration',
    dimensions: 'Fully Scalable Vector',
    tags: ['minimalist', 'vector', 'head', 'symbol', 'conservation'],
  },
];

const getArtworkData = (id: string): Artwork => {
  const found = allArtwork.find((art) => art.id === id);
  return found ?? allArtwork[0]!;
};

export default async function ArtworkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const artwork = getArtworkData(id);

  const relatedArtworks = allArtwork
    .filter((a) => a.id !== artwork.id && a.artist === artwork.artist)
    .slice(0, 3);

  return (
    <LayoutWrapper>
      <div className="container py-10 max-w-7xl">
        <div className="mb-8">
          <Link
            href="/gallery/featured"
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Gallery
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Main Image */}
          <div className="bg-muted/30 rounded-xl overflow-hidden border">
            <div className="aspect-square relative">
              <Image
                src={artwork.imageUrl}
                alt={artwork.title}
                fill
                className="object-contain p-8"
                priority
                unoptimized // Needed for external hosts without remotePatterns config
              />
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col justify-start">
            <h1 className="text-4xl font-bold mb-3">{artwork.title}</h1>
            <p className="text-xl text-muted-foreground mb-6">by {artwork.artist}</p>

            <div className="flex flex-wrap gap-3 mb-8">
              <Badge variant="secondary">{artwork.licenseType} License</Badge>
              <Badge variant="outline">Based on {artwork.ipOwner} IP</Badge>
            </div>

            <p className="text-muted-foreground mb-8 leading-relaxed">{artwork.description}</p>

            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-3xl font-bold">{artwork.price}</span>
                    <p className="text-sm text-muted-foreground mt-1">One-time license fee</p>
                  </div>
                  <Button size="lg" className="px-8">
                    License This Artwork
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
              <div>
                <span className="text-muted-foreground">Created</span>
                <p className="font-medium">{artwork.createdAt}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Medium</span>
                <p className="font-medium">{artwork.medium}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Dimensions</span>
                <p className="font-medium">{artwork.dimensions}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Tags</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {artwork.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-10">
              <Button variant="outline" size="icon">
                <Heart className="h-5 w-5" />
                <span className="sr-only">Like</span>
              </Button>
              <Button variant="outline" size="icon">
                <Share2 className="h-5 w-5" />
                <span className="sr-only">Share</span>
              </Button>
              <Button variant="outline" size="icon">
                <Download className="h-5 w-5" />
                <span className="sr-only">Download Preview</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Related Artworks from Same Artist */}
        {relatedArtworks.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-8">More from {artwork.artist}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedArtworks.map((related) => (
                <Link
                  key={related.id}
                  href={`/gallery/artwork/${related.id}`}
                  className="group block"
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-square relative bg-muted/30">
                      <Image
                        src={related.imageUrl}
                        alt={related.title}
                        fill
                        className="object-contain p-6 group-hover:scale-105 transition-transform"
                        unoptimized
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold truncate">{related.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{related.price}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </LayoutWrapper>
  );
}
