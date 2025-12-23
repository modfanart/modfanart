"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useToast } from "@/components/ui/use-toaster"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ProductReviews } from "@/components/marketplace/product-reviews"
import { ProductCard } from "@/components/product-card"
import { ArrowLeft, Check, Heart, Minus, Plus, Share2, ShoppingCart, Star } from "lucide-react"

interface ProductDetailProps {
  product: any
  relatedProducts: any[]
}

export default function ProductDetail({ product, relatedProducts }: ProductDetailProps) {
  const { toast } = useToast()
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState(product.variations.sizes[0] || "")
  const [selectedColor, setSelectedColor] = useState(product.variations.colors[0] || "")

  const handleAddToCart = () => {
    toast({
      title: "Added to cart",
      description: `${product.title} (${selectedSize}${selectedColor ? `, ${selectedColor}` : ""}) × ${quantity}`,
      action: (
        <Link href="/marketplace/cart">
          <Button variant="outline" size="sm">
            View Cart
          </Button>
        </Link>
      ),
    })
  }

  const handleBuyNow = () => {
    toast({
      title: "Proceeding to checkout",
      description: `${product.title} (${selectedSize}${selectedColor ? `, ${selectedColor}` : ""}) × ${quantity}`,
    })
    // In a real app, this would redirect to checkout
  }

  const handleWishlist = () => {
    toast({
      title: "Added to wishlist",
      description: `${product.title} has been added to your wishlist.`,
    })
  }

  const handleShare = () => {
    // In a real app, this would open a share dialog
    navigator.clipboard.writeText(window.location.href)
    toast({
      title: "Link copied",
      description: "Product link has been copied to clipboard.",
    })
  }

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
            <div className="relative aspect-square overflow-hidden rounded-lg border bg-background">
              <Image
                src={product.images[selectedImage] || "/placeholder.svg"}
                alt={product.title}
                fill
                className="object-contain"
                priority
              />
              {product.isNew && <Badge className="absolute left-2 top-2 bg-blue-500 hover:bg-blue-600">New</Badge>}
              {product.isBestseller && (
                <Badge className="absolute left-2 top-2 bg-amber-500 hover:bg-amber-600">Bestseller</Badge>
              )}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.images.map((image: string, index: number) => (
                <button
                  key={index}
                  className={`relative h-20 w-20 overflow-hidden rounded-md border ${
                    selectedImage === index ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedImage(index)}
                >
                  <Image
                    src={image || "/placeholder.svg"}
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
                      href={`/marketplace/brand/${product.brandId}`}
                      className="text-sm text-muted-foreground hover:text-primary hover:underline"
                    >
                      {product.brand}
                    </Link>
                    {" • "}
                    <Link
                      href={`/marketplace/artist/${product.artistId}`}
                      className="text-sm text-muted-foreground hover:text-primary hover:underline"
                    >
                      Artist: {product.artist}
                    </Link>
                  </div>
                </div>
                <div className="text-2xl font-bold">${product.price.toFixed(2)}</div>
              </div>

              <div className="mt-2 flex items-center">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(product.rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : i < product.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm font-medium">{product.rating}</span>
                <span className="mx-2 text-sm text-muted-foreground">•</span>
                <Link href="#reviews" className="text-sm text-muted-foreground hover:text-primary hover:underline">
                  {product.reviewCount} reviews
                </Link>
                <span className="mx-2 text-sm text-muted-foreground">•</span>
                <span className={`text-sm ${product.inStock ? "text-green-600" : "text-red-600"}`}>
                  {product.inStock ? "In stock" : "Out of stock"}
                </span>
              </div>

              <p className="mt-4">{product.description}</p>

              <div className="mt-6 space-y-6">
                {/* Size Selection */}
                {product.variations.sizes.length > 0 && (
                  <div>
                    <h3 className="mb-3 text-sm font-medium">Size</h3>
                    <RadioGroup value={selectedSize} onValueChange={setSelectedSize} className="flex flex-wrap gap-2">
                      {product.variations.sizes.map((size: string) => (
                        <div key={size}>
                          <RadioGroupItem value={size} id={`size-${size}`} className="peer sr-only" />
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
                {product.variations.colors.length > 0 && (
                  <div>
                    <h3 className="mb-3 text-sm font-medium">Color</h3>
                    <RadioGroup value={selectedColor} onValueChange={setSelectedColor} className="flex flex-wrap gap-2">
                      {product.variations.colors.map((color: string) => (
                        <div key={color}>
                          <RadioGroupItem value={color} id={`color-${color}`} className="peer sr-only" />
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
                      <Minus className="h-4 w-4" />
                      <span className="sr-only">Decrease quantity</span>
                    </Button>
                    <div className="flex h-full flex-1 items-center justify-center border-y">{quantity}</div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-full rounded-l-none"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                      <span className="sr-only">Increase quantity</span>
                    </Button>
                  </div>
                </div>

                {/* Add to Cart / Buy Now */}
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button className="flex-1 gap-2" onClick={handleAddToCart} disabled={!product.inStock}>
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                  </Button>
                  <Button
                    variant="secondary"
                    className="flex-1 gap-2"
                    onClick={handleBuyNow}
                    disabled={!product.inStock}
                  >
                    Buy Now
                  </Button>
                </div>

                {/* Wishlist & Share */}
                <div className="flex gap-4">
                  <Button variant="outline" size="sm" className="gap-2" onClick={handleWishlist}>
                    <Heart className="h-4 w-4" />
                    Add to Wishlist
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                </div>
              </div>
            </div>

            <Separator className="my-8" />

            {/* Product Details */}
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
                <p>This product features officially licensed fan art approved by {product.brand}.</p>
                <p>The design was created by {product.artist} and is protected under copyright law.</p>
                <p>A portion of each sale goes to the original IP holder and the artist.</p>
                <p>For licensing inquiries, please contact licensing@modplatform.com</p>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Customer Reviews */}
      <div id="reviews" className="mt-16 scroll-mt-16">
        <h2 className="mb-6 text-2xl font-bold">Customer Reviews</h2>
        <ProductReviews productId={product.id} rating={product.rating} reviewCount={product.reviewCount} />
      </div>

      {/* Related Products */}
      <div className="mt-16">
        <h2 className="mb-6 text-2xl font-bold">You May Also Like</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {relatedProducts.map((relatedProduct) => (
            <ProductCard key={relatedProduct.id} {...relatedProduct} />
          ))}
        </div>
      </div>
    </div>
  )
}

