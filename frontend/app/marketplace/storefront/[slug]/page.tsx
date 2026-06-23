'use client';

import { use, useState } from 'react';
import Image from 'next/image';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search } from '@/components/search';
import { Instagram, Twitter, Globe } from 'lucide-react';

// Sample data for storefronts
const storefronts = {
  marvel: {
    id: 'store-1',
    name: 'Marvel Official',
    type: 'brand',
    description:
      'Official Marvel merchandise featuring licensed fan art from talented artists around the world. From apparel to collectibles, find unique interpretations of your favorite Marvel characters.',
    bannerUrl: '/placeholder.svg?height=300&width=1200',
    logoUrl: '/placeholder.svg?height=150&width=150',
    socialLinks: {
      website: 'https://marvel.com',
      twitter: 'https://twitter.com/marvel',
      instagram: 'https://instagram.com/marvel',
    },
    products: [
      {
        id: 'prod-1',
        title: 'Hulk Nature T-Shirt',
        price: 29.99,
        imageUrl:
          'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hulk%20nature-2.jpg-ivaqVZqmxWtiQzqj7KrfCIH3S8XKHP.jpeg',
        artist: 'Sarah Johnson',
        brand: 'Marvel',
        isNew: true,
        isBestseller: false,
        slug: 'hulk-nature-tshirt',
      },
      {
        id: 'prod-5',
        title: 'Spider-Man Web Backpack',
        price: 39.99,
        imageUrl: '/placeholder.svg?height=300&width=300',
        artist: "Miguel O'Hara",
        brand: 'Marvel',
        isNew: false,
        isBestseller: true,
        slug: 'spiderman-web-backpack',
      },
    ],
  },
  'star-wars': {
    id: 'store-2',
    name: 'Star Wars Collection',
    type: 'brand',
    description:
      'Officially licensed Star Wars fan art merchandise. Featuring unique designs from the galaxy far, far away, created by passionate artists and approved by Lucasfilm.',
    bannerUrl: '/placeholder.svg?height=300&width=1200',
    logoUrl: '/placeholder.svg?height=150&width=150',
    socialLinks: {
      website: 'https://starwars.com',
      twitter: 'https://twitter.com/starwars',
      instagram: 'https://instagram.com/starwars',
    },
    products: [
      {
        id: 'prod-2',
        title: 'Ahsoka Tano Poster',
        price: 19.99,
        imageUrl:
          'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ahsoka-FINAL-01%20%282%29-PO2rMTckglJ6t9uWAalnbK7kR10iY9.png',
        artist: 'Alex Rivera',
        brand: 'Star Wars',
        isNew: false,
        isBestseller: true,
        slug: 'ahsoka-tano-poster',
      },
      {
        id: 'prod-7',
        title: 'Star Wars Chibi Sticker Pack',
        price: 12.99,
        imageUrl: '/placeholder.svg?height=300&width=300',
        artist: 'Beskar Forge',
        brand: 'Star Wars',
        isNew: false,
        isBestseller: true,
        slug: 'star-wars-chibi-stickers',
      },
    ],
  },
  'sarah-johnson': {
    id: 'store-3',
    name: 'Sarah Johnson Art',
    type: 'artist',
    description:
      'Sarah Johnson specializes in nature-inspired superhero art. Her unique style blends organic elements with iconic characters, creating pieces that celebrate both pop culture and the natural world.',
    bannerUrl: '/placeholder.svg?height=300&width=1200',
    logoUrl: '/placeholder.svg?height=150&width=150',
    socialLinks: {
      website: 'https://sarahjohnsonart.com',
      twitter: 'https://twitter.com/sarahjart',
      instagram: 'https://instagram.com/sarahjohnsonart',
    },
    products: [
      {
        id: 'prod-1',
        title: 'Hulk Nature T-Shirt',
        price: 29.99,
        imageUrl:
          'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hulk%20nature-2.jpg-ivaqVZqmxWtiQzqj7KrfCIH3S8XKHP.jpeg',
        artist: 'Sarah Johnson',
        brand: 'Marvel',
        isNew: true,
        isBestseller: false,
        slug: 'hulk-nature-tshirt',
      },
    ],
  },
};

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default function StorefrontPage({ params }: PageProps) {
  const { slug } = use(params);

  const storefront = storefronts[slug as keyof typeof storefronts];
  const [filteredProducts, setFilteredProducts] = useState(storefront?.products || []);

  if (!storefront) {
    return (
      <div className="container flex h-[50vh] items-center justify-center px-4 py-8 md:px-6 md:py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Storefront Not Found</h1>
          <p className="mt-2 text-muted-foreground">
            The storefront you're looking for doesn't exist or has been removed.
          </p>
          <Button className="mt-4" asChild>
            <a href="/marketplace">Back to Marketplace</a>
          </Button>
        </div>
      </div>
    );
  }

  const handleSearch = (query: string) => {
    if (!query) {
      setFilteredProducts(storefront.products);
      return;
    }

    const filtered = storefront.products.filter((product) => {
      const searchTerm = query.toLowerCase();
      return (
        product.title.toLowerCase().includes(searchTerm) ||
        product.artist.toLowerCase().includes(searchTerm)
      );
    });

    setFilteredProducts(filtered);
  };

  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      {/* Banner */}
      <div className="relative mb-8 h-48 w-full overflow-hidden rounded-lg md:h-64">
        <Image
          src={storefront.bannerUrl || '/placeholder.svg'}
          alt={`${storefront.name} banner`}
          fill
          className="object-cover"
        />
      </div>

      {/* Storefront Info */}
      <div className="mb-8 flex flex-col items-center gap-6 md:flex-row md:items-start">
        <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-background md:h-32 md:w-32">
          <Image
            src={storefront.logoUrl || '/placeholder.svg'}
            alt={`${storefront.name} logo`}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{storefront.name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {storefront.type === 'brand' ? 'Official Brand Storefront' : 'Artist Storefront'}
          </p>
          <p className="mt-4 max-w-3xl">{storefront.description}</p>
          <div className="mt-4 flex justify-center gap-4 md:justify-start">
            {storefront.socialLinks.website && (
              <a
                href={storefront.socialLinks.website}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Globe className="h-5 w-5" />
                <span className="sr-only">Website</span>
              </a>
            )}
            {storefront.socialLinks.twitter && (
              <a
                href={storefront.socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </a>
            )}
            {storefront.socialLinks.instagram && (
              <a
                href={storefront.socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Products</h2>
        <div className="w-full sm:max-w-xs">
          <Search onSearch={handleSearch} />
        </div>
      </div>

      <Tabs defaultValue="all" className="mb-8">
        <TabsList>
          <TabsTrigger value="all">All Products</TabsTrigger>
          <TabsTrigger value="new">New Arrivals</TabsTrigger>
          <TabsTrigger value="bestsellers">Bestsellers</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-6">
          {filteredProducts.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <p className="text-muted-foreground">No products found</p>
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
              .filter((product) => product.isNew)
              .map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
          </div>
        </TabsContent>
        <TabsContent value="bestsellers" className="mt-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts
              .filter((product) => product.isBestseller)
              .map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
