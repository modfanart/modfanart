'use client';

import React from 'react';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Heart, Share2, ArrowLeft, Check, Star, StarHalf } from 'lucide-react';
import { useToast } from '@/components/ui/use-toaster';
import { ProductCard } from '@/components/product-card';
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
interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  helpfulCount: number;
  verified: boolean;
}

// Sample product data
const products = {
  'hulk-nature-tshirt': {
    id: 'prod-1',
    slug: 'hulk-nature-tshirt',
    title: 'Hulk Nature T-Shirt',
    price: 29.99,
    imageUrl:
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hulk%20nature-2.jpg-ivaqVZqmxWtiQzqj7KrfCIH3S8XKHP.jpeg',
    images: [
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hulk%20nature-2.jpg-ivaqVZqmxWtiQzqj7KrfCIH3S8XKHP.jpeg',
      '/placeholder.svg?height=600&width=600&text=Hulk+T-Shirt+Back',
      '/placeholder.svg?height=600&width=600&text=Hulk+T-Shirt+Detail',
    ],
    artist: 'Sarah Johnson',
    artistSlug: 'sarah-johnson',
    brand: 'Marvel',
    brandSlug: 'marvel',
    category: 'apparel',
    description:
      "This unique t-shirt features the Hulk seamlessly integrated with natural elements, showcasing the character's raw power alongside the beauty of nature. The design is printed on a premium cotton blend for comfort and durability.",
    details: [
      '100% premium cotton',
      'Machine washable',
      'Officially licensed Marvel merchandise',
      'Designed by Sarah Johnson',
      'Available in multiple sizes and colors',
    ],
    variants: {
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Black', 'White', 'Green'],
    },
    relatedProducts: ['ahsoka-tano-poster', 'dark-knight-hoodie', 'spiderman-web-backpack'],
    rating: 4.7,
    reviewCount: 124,
    inStock: true,
    isNew: true,
    isBestseller: false,
  },
  'ahsoka-tano-poster': {
    id: 'prod-2',
    slug: 'ahsoka-tano-poster',
    title: 'Ahsoka Tano Poster',
    price: 19.99,
    imageUrl:
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ahsoka-FINAL-01%20%282%29-PO2rMTckglJ6t9uWAalnbK7kR10iY9.png',
    images: [
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ahsoka-FINAL-01%20%282%29-PO2rMTckglJ6t9uWAalnbK7kR10iY9.png',
      '/placeholder.svg?height=600&width=600&text=Ahsoka+Poster+Detail',
      '/placeholder.svg?height=600&width=600&text=Ahsoka+Poster+Frame',
    ],
    artist: 'Alex Rivera',
    artistSlug: 'alex-rivera',
    brand: 'Star Wars',
    brandSlug: 'star-wars',
    category: 'posters',
    description:
      "This stunning Ahsoka Tano poster features the beloved character in a dynamic pose with her iconic dual lightsabers. Perfect for any Star Wars fan's collection, this high-quality print captures the essence of the character's journey.",
    details: [
      'High-quality 250gsm art paper',
      'Available in multiple sizes',
      'Officially licensed Star Wars merchandise',
      'Designed by Alex Rivera',
      'Ships in protective tube',
    ],
    variants: {
      sizes: ['11x17', '18x24', '24x36'],
      colors: [],
    },
    relatedProducts: ['hulk-nature-tshirt', 'dark-knight-hoodie', 'star-wars-chibi-stickers'],
    rating: 4.9,
    reviewCount: 87,
    inStock: true,
    isNew: false,
    isBestseller: true,
  },
  'dark-knight-hoodie': {
    id: 'prod-3',
    slug: 'dark-knight-hoodie',
    title: 'Dark Knight Hoodie',
    price: 49.99,
    imageUrl:
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Absolute_Batman_low.jpg-jbjBkbHD8un1TKig37wzR4G3RvZFbk.jpeg',
    images: [
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Absolute_Batman_low.jpg-jbjBkbHD8un1TKig37wzR4G3RvZFbk.jpeg',
      '/placeholder.svg?height=600&width=600&text=Batman+Hoodie+Back',
      '/placeholder.svg?height=600&width=600&text=Batman+Hoodie+Detail',
    ],
    artist: 'Thomas Wayne',
    artistSlug: 'thomas-wayne',
    brand: 'DC Comics',
    brandSlug: 'dc-comics',
    category: 'apparel',
    description:
      "Stay warm while representing Gotham's protector with this premium Dark Knight hoodie. Features a striking Batman design on a comfortable cotton-polyester blend.",
    details: [
      '80% cotton, 20% polyester blend',
      'Machine washable',
      'Officially licensed DC Comics merchandise',
      'Designed by Thomas Wayne',
      'Available in multiple sizes',
    ],
    variants: {
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Black', 'Navy'],
    },
    relatedProducts: ['hulk-nature-tshirt', 'ahsoka-tano-poster', 'spiderman-web-backpack'],
    rating: 4.5,
    reviewCount: 56,
    inStock: true,
    isNew: false,
    isBestseller: false,
  },
  'spiderman-web-backpack': {
    id: 'prod-5',
    slug: 'spiderman-web-backpack',
    title: 'Spider-Man Web Backpack',
    price: 39.99,
    imageUrl: '/placeholder.svg?height=600&width=600&text=Spider-Man+Backpack',
    images: [
      '/placeholder.svg?height=600&width=600&text=Spider-Man+Backpack',
      '/placeholder.svg?height=600&width=600&text=Spider-Man+Backpack+Inside',
      '/placeholder.svg?height=600&width=600&text=Spider-Man+Backpack+Side',
    ],
    artist: "Miguel O'Hara",
    artistSlug: 'miguel-ohara',
    brand: 'Marvel',
    brandSlug: 'marvel',
    category: 'accessories',
    description:
      'Carry your essentials in style with this Spider-Man inspired backpack featuring a unique web pattern design. Durable, comfortable, and perfect for fans of the friendly neighborhood hero.',
    details: [
      'Durable polyester construction',
      'Padded laptop compartment',
      'Multiple storage compartments',
      'Officially licensed Marvel merchandise',
      "Designed by Miguel O'Hara",
    ],
    variants: {
      sizes: ['Standard'],
      colors: ['Red/Blue', 'Black/Red'],
    },
    relatedProducts: ['hulk-nature-tshirt', 'dark-knight-hoodie', 'ahsoka-tano-poster'],
    rating: 4.3,
    reviewCount: 42,
    inStock: true,
    isNew: true,
    isBestseller: false,
  },
  'star-wars-chibi-stickers': {
    id: 'prod-7',
    slug: 'star-wars-chibi-stickers',
    title: 'Star Wars Chibi Sticker Pack',
    price: 12.99,
    imageUrl: '/placeholder.svg?height=600&width=600&text=Star+Wars+Stickers',
    images: [
      '/placeholder.svg?height=600&width=600&text=Star+Wars+Stickers',
      '/placeholder.svg?height=600&width=600&text=Star+Wars+Stickers+Set',
      '/placeholder.svg?height=600&width=600&text=Star+Wars+Stickers+Detail',
    ],
    artist: 'Beskar Forge',
    artistSlug: 'beskar-forge',
    brand: 'Star Wars',
    brandSlug: 'star-wars',
    category: 'stickers',
    description:
      'Add some galactic charm to your belongings with this adorable set of chibi-style Star Wars character stickers. Each pack includes 6 high-quality vinyl stickers featuring your favorite characters in cute chibi form.',
    details: [
      'Set of 6 premium vinyl stickers',
      'Weather-resistant and durable',
      'Perfect for laptops, water bottles, or notebooks',
      'Officially licensed Star Wars merchandise',
      'Designed by Beskar Forge',
    ],
    variants: {
      sizes: ['3 inch', '4 inch', '5 inch'],
      colors: [],
    },
    relatedProducts: ['ahsoka-tano-poster', 'hulk-nature-tshirt', 'dark-knight-hoodie'],
    rating: 4.8,
    reviewCount: 31,
    inStock: true,
    isNew: false,
    isBestseller: true,
  },
};

// Related products data (for ProductCard usage)
const relatedProductsData = {
  'hulk-nature-tshirt': {
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
  'ahsoka-tano-poster': {
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
  'dark-knight-hoodie': {
    id: 'prod-3',
    title: 'Dark Knight Hoodie',
    price: 49.99,
    imageUrl:
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Absolute_Batman_low.jpg-jbjBkbHD8un1TKig37wzR4G3RvZFbk.jpeg',
    artist: 'Thomas Wayne',
    brand: 'DC Comics',
    isNew: false,
    isBestseller: false,
    slug: 'dark-knight-hoodie',
  },
  'spiderman-web-backpack': {
    id: 'prod-5',
    title: 'Spider-Man Web Backpack',
    price: 39.99,
    imageUrl: '/placeholder.svg?height=300&width=300&text=Spider-Man+Backpack',
    artist: "Miguel O'Hara",
    brand: 'Marvel',
    isNew: true,
    isBestseller: false,
    slug: 'spiderman-web-backpack',
  },
  'star-wars-chibi-stickers': {
    id: 'prod-7',
    title: 'Star Wars Chibi Sticker Pack',
    price: 12.99,
    imageUrl: '/placeholder.svg?height=300&width=300&text=Star+Wars+Stickers',
    artist: 'Beskar Forge',
    brand: 'Star Wars',
    isNew: false,
    isBestseller: true,
    slug: 'star-wars-chibi-stickers',
  },
};

// Sample reviews
const sampleReviews: Review[] = [
  {
    id: 'review-1',
    productId: 'prod-1',
    userId: 'user-1',
    userName: 'JohnDoe',
    userAvatar: '/placeholder.svg?height=40&width=40',
    rating: 5,
    title: 'Amazing quality and design!',
    comment:
      "This is one of the best fan art shirts I've ever purchased. The print quality is excellent and the fabric is super comfortable. Highly recommend!",
    date: '2023-10-15',
    helpfulCount: 12,
    verified: true,
  },
  {
    id: 'review-2',
    productId: 'prod-1',
    userId: 'user-2',
    userName: 'MarvelFan',
    userAvatar: '/placeholder.svg?height=40&width=40',
    rating: 4,
    title: 'Great shirt, runs a bit small',
    comment:
      'Love the design and quality, but I would recommend sizing up. I normally wear a medium but should have ordered a large.',
    date: '2023-09-22',
    helpfulCount: 8,
    verified: true,
  },
  {
    id: 'review-3',
    productId: 'prod-1',
    userId: 'user-3',
    userName: 'ArtCollector',
    userAvatar: '/placeholder.svg?height=40&width=40',
    rating: 5,
    title: 'Unique design that stands out',
    comment:
      'The artist did an amazing job blending nature elements with the Hulk character. I get compliments every time I wear this shirt!',
    date: '2023-08-30',
    helpfulCount: 5,
    verified: true,
  },
];

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  // Await params for Next.js 15+ compatibility
  const { slug } = React.use(params);

  const router = useRouter();
  const { toast } = useToast();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<Review[]>(sampleReviews);
  const [reviewFilter, setReviewFilter] = useState('all');
  const [reviewSort, setReviewSort] = useState('newest');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    comment: '',
  });

  useEffect(() => {
    const fetchProduct = () => {
      setLoading(true);
      try {
        const productData = products[slug as keyof typeof products];
        if (productData) {
          setProduct(productData);
          setSelectedSize(productData.variants.sizes[0] || '');
          setSelectedColor(productData.variants.colors[0] || '');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="container flex h-[70vh] items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container flex h-[50vh] items-center justify-center px-4 py-8 md:px-6 md:py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Product Not Found</h1>
          <p className="mt-2 text-muted-foreground">
            The product you're looking for doesn't exist or has been removed.
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
      description: (
        <div className="flex flex-col gap-2">
          <span>{`${product.title} (${selectedSize}${
            selectedColor ? `, ${selectedColor}` : ''
          }) × ${quantity}`}</span>
          <Button variant="outline" size="sm" asChild>
            <Link href="/marketplace/cart">View Cart</Link>
          </Button>
        </div>
      ),
    });
  };

  const handleBuyNow = () => {
    toast({
      title: 'Proceeding to checkout',
      description: `${product.title} (${selectedSize}${
        selectedColor ? `, ${selectedColor}` : ''
      }) × ${quantity}`,
    });
    router.push('/marketplace/checkout');
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();

    const newReviewObj: Review = {
      id: `review-${Date.now()}`,
      productId: product.id,
      userId: 'current-user',
      userName: 'You',
      userAvatar: '/placeholder.svg?height=40&width=40',
      rating: newReview.rating,
      title: newReview.title,
      comment: newReview.comment,
      date: new Date().toISOString().split('T')[0]!, // <-- add ! to assert it's not undefined
      helpfulCount: 0,
      verified: true,
    };

    setReviews([newReviewObj, ...reviews]);
    setNewReview({ rating: 5, title: '', comment: '' });
    setShowReviewForm(false);

    toast({
      title: 'Review submitted',
      description: 'Thank you for your feedback!',
    });
  };

  const handleMarkHelpful = (reviewId: string) => {
    setReviews(
      reviews.map((review) =>
        review.id === reviewId ? { ...review, helpfulCount: review.helpfulCount + 1 } : review
      )
    );

    toast({
      title: 'Feedback recorded',
      description: 'You marked this review as helpful',
    });
  };

  const filteredReviews = reviews.filter((review) => {
    if (reviewFilter === 'all') return true;
    return review.rating === Number.parseInt(reviewFilter);
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (reviewSort) {
      case 'newest':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'oldest':
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'highest':
        return b.rating - a.rating;
      case 'lowest':
        return a.rating - b.rating;
      case 'helpful':
        return b.helpfulCount - a.helpfulCount;
      default:
        return 0;
    }
  });

  const getRelatedProducts = () => {
    return product.relatedProducts.map(
      (slug: string): RelatedProductCardProps =>
        relatedProductsData[slug as keyof typeof relatedProductsData]
    );
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half-star" className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-star-${i}`} className="h-4 w-4 text-gray-300" />);
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
          {/* Product Images */}
          <div className="flex flex-col gap-4 lg:w-1/2">
            <div className="relative aspect-square overflow-hidden rounded-lg border">
              <Image
                src={product.images[selectedImage] || '/placeholder.svg'}
                alt={product.title}
                fill
                className="object-cover"
              />
              {product.isNew && (
                <div className="absolute left-2 top-2 rounded-full bg-blue-500 px-2 py-1 text-xs font-medium text-white">
                  New
                </div>
              )}
              {product.isBestseller && (
                <div className="absolute left-2 top-2 rounded-full bg-amber-500 px-2 py-1 text-xs font-medium text-white">
                  Bestseller
                </div>
              )}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.images.map((image: string, index: number) => (
                <button
                  key={index}
                  className={`relative h-20 w-20 overflow-hidden rounded-md border ${
                    selectedImage === index ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedImage(index)}
                >
                  <Image
                    src={image || '/placeholder.svg'}
                    alt={`${product.title} - view ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col lg:w-1/2">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold md:text-3xl">{product.title}</h1>
                  <div className="mt-1">
                    <Link
                      href={`/marketplace/storefront/${product.brandSlug}`}
                      className="text-sm text-muted-foreground hover:text-primary hover:underline"
                    >
                      {product.brand}
                    </Link>
                    {' • '}
                    <Link
                      href={`/marketplace/storefront/${product.artistSlug}`}
                      className="text-sm text-muted-foreground hover:text-primary hover:underline"
                    >
                      Artist: {product.artist}
                    </Link>
                  </div>
                  <div className="mt-2 flex items-center">
                    <div className="flex items-center">{renderStars(product.rating)}</div>
                    <span className="ml-2 text-sm text-muted-foreground">
                      ({product.reviewCount} reviews)
                    </span>
                    {product.inStock ? (
                      <span className="ml-4 text-sm font-medium text-green-600">In Stock</span>
                    ) : (
                      <span className="ml-4 text-sm font-medium text-red-600">Out of Stock</span>
                    )}
                  </div>
                </div>
                <div className="text-2xl font-bold">${product.price.toFixed(2)}</div>
              </div>

              <p className="mt-4">{product.description}</p>

              <div className="mt-6 space-y-6">
                {/* Size Selection */}
                {product.variants.sizes.length > 0 && (
                  <div>
                    <h3 className="mb-3 text-sm font-medium">Size</h3>
                    <RadioGroup
                      value={selectedSize}
                      onValueChange={setSelectedSize}
                      className="flex flex-wrap gap-2"
                    >
                      {product.variants.sizes.map((size: string) => (
                        <div key={size}>
                          <RadioGroupItem
                            value={size}
                            id={`size-${size}`}
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor={`size-${size}`}
                            className="flex h-10 w-14 cursor-pointer items-center justify-center rounded-md border border-muted bg-transparent text-sm font-medium ring-offset-background peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary"
                          >
                            {size}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}

                {/* Color Selection */}
                {product.variants.colors.length > 0 && (
                  <div>
                    <h3 className="mb-3 text-sm font-medium">Color</h3>
                    <RadioGroup
                      value={selectedColor}
                      onValueChange={setSelectedColor}
                      className="flex flex-wrap gap-2"
                    >
                      {product.variants.colors.map((color: string) => (
                        <div key={color}>
                          <RadioGroupItem
                            value={color}
                            id={`color-${color}`}
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor={`color-${color}`}
                            className="flex h-10 min-w-[2.5rem] cursor-pointer items-center justify-center rounded-md border border-muted bg-transparent px-3 text-sm font-medium ring-offset-background peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary"
                          >
                            {color}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}

                {/* Quantity */}
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

                {/* Add to Cart / Buy Now */}
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button className="flex-1 gap-2" onClick={handleAddToCart}>
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                  </Button>
                  <Button variant="secondary" className="flex-1 gap-2" onClick={handleBuyNow}>
                    Buy Now
                  </Button>
                </div>

                {/* Wishlist & Share */}
                <div className="flex gap-4">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Heart className="h-4 w-4" />
                    Add to Wishlist
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                </div>
              </div>
            </div>

            <Separator className="my-8" />

            {/* Product Details Tabs */}
            <Tabs defaultValue="details">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="shipping">Shipping</TabsTrigger>
                <TabsTrigger value="licensing">Licensing Info</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="mt-4 space-y-4">
                <ul className="space-y-2">
                  {product.details.map((detail: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 shrink-0 text-green-500" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </TabsContent>
              <TabsContent value="shipping" className="mt-4 space-y-4">
                <p>Standard shipping (3-5 business days): $4.99</p>
                <p>Express shipping (1-2 business days): $9.99</p>
                <p>Free shipping on orders over $50</p>
                <p>International shipping available to select countries</p>
              </TabsContent>
              <TabsContent value="licensing" className="mt-4 space-y-4">
                <p>
                  This product features officially licensed fan art approved by {product.brand}.
                </p>
                <p>
                  The design was created by {product.artist} and is protected under copyright law.
                </p>
                <p>A portion of each sale goes to the original IP holder and the artist.</p>
                <p>For licensing inquiries, please contact licensing@modplatform.com</p>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Customer Reviews */}
      <div className="mt-16">
        <h2 className="mb-6 text-2xl font-bold">Customer Reviews</h2>

        <div className="mb-8 flex flex-col gap-6 md:flex-row">
          {/* Review Summary */}
          <div className="rounded-lg border p-6 md:w-1/3">
            <div className="mb-4 text-center">
              <div className="text-5xl font-bold">{product.rating.toFixed(1)}</div>
              <div className="mt-2 flex justify-center">{renderStars(product.rating)}</div>
              <div className="mt-1 text-sm text-muted-foreground">
                Based on {product.reviewCount} reviews
              </div>
            </div>

            <div className="mt-6 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const percentage =
                  Math.round(
                    (reviews.filter((r) => r.rating === star).length / reviews.length) * 100
                  ) || 0;
                return (
                  <div key={star} className="flex items-center gap-2">
                    <div className="text-sm">{star} stars</div>
                    <div className="h-2 flex-1 rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-yellow-400"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-sm">{percentage}%</div>
                  </div>
                );
              })}
            </div>

            <Button className="mt-6 w-full" onClick={() => setShowReviewForm(!showReviewForm)}>
              {showReviewForm ? 'Cancel Review' : 'Write a Review'}
            </Button>
          </div>

          {/* Review List */}
          <div className="flex-1">
            {showReviewForm && (
              <div className="mb-8 rounded-lg border p-6">
                <h3 className="mb-4 text-lg font-semibold">Write a Review</h3>
                <form onSubmit={handleSubmitReview}>
                  <div className="mb-4">
                    <label className="mb-2 block text-sm font-medium">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => setNewReview({ ...newReview, rating })}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`h-6 w-6 ${
                              newReview.rating >= rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="review-title" className="mb-2 block text-sm font-medium">
                      Review Title
                    </label>
                    <input
                      id="review-title"
                      type="text"
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                      placeholder="Summarize your experience"
                      value={newReview.title}
                      onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="review-comment" className="mb-2 block text-sm font-medium">
                      Review
                    </label>
                    <textarea
                      id="review-comment"
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                      placeholder="Share your experience with this product"
                      rows={4}
                      value={newReview.comment}
                      onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                      required
                    ></textarea>
                  </div>

                  <Button type="submit">Submit Review</Button>
                </form>
              </div>
            )}

            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm">Filter:</span>
                <select
                  className="rounded-md border border-input bg-background px-3 py-1 text-sm"
                  value={reviewFilter}
                  onChange={(e) => setReviewFilter(e.target.value)}
                >
                  <option value="all">All Stars</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm">Sort by:</span>
                <select
                  className="rounded-md border border-input bg-background px-3 py-1 text-sm"
                  value={reviewSort}
                  onChange={(e) => setReviewSort(e.target.value)}
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="highest">Highest Rated</option>
                  <option value="lowest">Lowest Rated</option>
                  <option value="helpful">Most Helpful</option>
                </select>
              </div>
            </div>

            {sortedReviews.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <p className="text-muted-foreground">No reviews match your filter</p>
                <Button variant="link" onClick={() => setReviewFilter('all')}>
                  Clear filter
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {sortedReviews.map((review) => (
                  <div key={review.id} className="rounded-lg border p-4">
                    <div className="mb-2 flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="relative h-10 w-10 overflow-hidden rounded-full">
                          <Image
                            src={review.userAvatar || '/placeholder.svg'}
                            alt={review.userName}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-medium">{review.userName}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(review.date).toLocaleDateString()}
                            {review.verified && (
                              <span className="ml-2 text-green-600">✓ Verified Purchase</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex">{renderStars(review.rating)}</div>
                    </div>

                    <h4 className="mb-1 font-semibold">{review.title}</h4>
                    <p className="text-sm">{review.comment}</p>

                    <div className="mt-4 flex items-center justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkHelpful(review.id)}
                      >
                        Was this helpful? ({review.helpfulCount})
                      </Button>
                      <Button variant="ghost" size="sm">
                        Report
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Products */}
      <div className="mt-16">
        <h2 className="mb-6 text-2xl font-bold">You May Also Like</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {getRelatedProducts().map((relatedProduct: RelatedProductCardProps) => (
            <ProductCard key={relatedProduct.id} {...relatedProduct} />
          ))}
        </div>
      </div>
    </div>
  );
}
