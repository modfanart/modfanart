'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Heart, Share2, ArrowLeft, Check, Star, StarHalf } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// → Import your RTK Query hook
import { useGetArtworkQuery } from '@/services/api/artworkApi';

// You can keep or remove this type — we're moving toward Artwork shape
interface RelatedProductCardProps {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  artist: string;
  brand: string;
  isNew: boolean;
  isBestseller: boolean;
  slug: string;
}

export default function ProductPage() {
  const params = useParams();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();

  // Fetch real artwork from backend
  const {
    data: artwork,
    isLoading,
    isError,
    error,
  } = useGetArtworkQuery(id, {
    skip: !id,
  });

  const [selectedImage] = useState(0); // only one image for now
  const [quantity, setQuantity] = useState(1);

  // You can derive these from artwork later (or add pricing to backend)
  const price = 24.99; // ← placeholder — add to Artwork model?
  const rating = 4.6; // ← placeholder
  const reviewCount = 83; // ← placeholder
  const inStock = true;

  // You can map categories or hardcode brand/artist for display
  const brand = 'Marvel'; // ← derive from categories / metadata later
  const artist = 'Official Studio'; // ← placeholder

  if (isLoading) {
    return (
      <div className="container flex h-[70vh] items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-muted-foreground">Loading artwork...</p>
        </div>
      </div>
    );
  }

  if (isError || !artwork) {
    return (
      <div className="container flex h-[50vh] items-center justify-center px-4 py-8 md:px-6 md:py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Artwork Not Found</h1>
          <p className="mt-2 text-muted-foreground">
            {error ? 'Failed to load artwork.' : "The item you're looking for doesn't exist."}
          </p>
          <Button className="mt-4" asChild>
            <Link href="/marketplace">Back to Marketplace</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    toast({
      title: 'Added to cart',
      description: `${artwork.title} × ${quantity}`,
    });
  };

  const handleBuyNow = () => {
    toast({ title: 'Proceeding to checkout...' });
    router.push('/marketplace/checkout');
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;

    for (let i = 0; i < full; i++) {
      stars.push(<Star key={`f-${i}`} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }
    if (half) {
      stars.push(<StarHalf key="half" className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }
    const empty = 5 - stars.length;
    for (let i = 0; i < empty; i++) {
      stars.push(<Star key={`e-${i}`} className="h-4 w-4 text-gray-300" />);
    }
    return stars;
  };

  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/marketplace" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Marketplace
          </Link>
        </Button>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Image Section */}
          <div className="flex flex-col gap-4 lg:w-1/2">
            <div className="relative aspect-square overflow-hidden rounded-lg border">
              <Image
                src={
                  artwork.file_url ||
                  artwork.thumbnail_url ||
                  '/placeholder.svg?height=600&width=600'
                }
                alt={artwork.title}
                fill
                className="object-cover"
                priority
              />
            </div>
            {/* Add thumbnail carousel later when multiple images supported */}
          </div>

          {/* Info Section */}
          <div className="flex flex-col lg:w-1/2">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold md:text-3xl">{artwork.title}</h1>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {brand} • {artist}
                  </div>
                  <div className="mt-2 flex items-center">
                    <div className="flex">{renderStars(rating)}</div>
                    <span className="ml-2 text-sm text-muted-foreground">
                      ({reviewCount} reviews)
                    </span>
                    {inStock ? (
                      <span className="ml-4 text-sm font-medium text-green-600">In Stock</span>
                    ) : (
                      <span className="ml-4 text-sm font-medium text-red-600">Out of Stock</span>
                    )}
                  </div>
                </div>
                <div className="text-2xl font-bold">${price.toFixed(2)}</div>
              </div>

              <p className="mt-4">{artwork.description || 'No description provided.'}</p>

              {/* Quantity + Actions */}
              <div className="mt-8 space-y-6">
                <div>
                  <h3 className="mb-3 text-sm font-medium">Quantity</h3>
                  <div className="flex h-10 w-32 items-center">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-full rounded-r-none"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      -
                    </Button>
                    <div className="flex h-full flex-1 items-center justify-center border-y">
                      {quantity}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-full rounded-l-none"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button className="flex-1 gap-2" onClick={handleAddToCart}>
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                  </Button>
                  <Button variant="secondary" className="flex-1 gap-2" onClick={handleBuyNow}>
                    Buy Now
                  </Button>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Heart className="h-4 w-4" /> Wishlist
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Share2 className="h-4 w-4" /> Share
                  </Button>
                </div>
              </div>
            </div>

            <Separator className="my-8" />

            <Tabs defaultValue="details">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="shipping">Shipping</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="mt-4 space-y-4">
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 shrink-0 text-green-500" />
                    <span>Digital download / Physical print (depending on product)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 shrink-0 text-green-500" />
                    <span>Created {new Date(artwork.created_at).toLocaleDateString()}</span>
                  </li>
                  {/* Add more from metadata when available */}
                </ul>
              </TabsContent>
              <TabsContent value="shipping" className="mt-4 space-y-4">
                <p>Shipping details coming soon...</p>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Reviews, related products — keep your existing code or placeholder */}
      <div className="mt-16">
        <h2 className="mb-6 text-2xl font-bold">Customer Reviews</h2>
        <p className="text-muted-foreground">Reviews coming soon...</p>
      </div>

      <div className="mt-16">
        <h2 className="mb-6 text-2xl font-bold">You May Also Like</h2>
        <p className="text-muted-foreground">Related products coming soon...</p>
      </div>
    </div>
  );
}
