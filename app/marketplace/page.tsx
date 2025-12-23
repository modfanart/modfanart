"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { ProductCard } from "@/components/product-card"
import { MarketplaceFilters } from "@/components/marketplace-filters"
import { Search } from "@/components/search"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight, Filter } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

export default function MarketplacePage() {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [featuredStorefronts, setFeaturedStorefronts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)

        // Fetch approved artwork from the Gallery
        const galleryResponse = await fetch("/api/gallery/approved")
        if (!galleryResponse.ok) {
          throw new Error("Failed to fetch gallery items")
        }
        const galleryData = await galleryResponse.json()

        // Transform gallery items into marketplace products
        const productsFromGallery = galleryData.items.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description || "Licensed fan art available for purchase",
          price: item.price || Math.floor(Math.random() * 40) + 10 + 0.99, // Random price between $10.99 and $49.99 if not set
          imageUrl: item.imageUrl,
          additionalImages: item.additionalImages || [],
          artist: item.artistName,
          artistId: item.artistId,
          brand: item.originalIp || "Various",
          isNew: new Date(item.approvedDate).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000, // New if approved in last 30 days
          isBestseller: item.featured || false,
          slug: item.slug || `product-${item.id}`,
          category: item.category || "apparel",
          tags: item.tags || [],
          status: "active",
          variants: item.variants || [
            {
              id: `variant-${item.id}-1`,
              name: "Standard",
              price: item.price || Math.floor(Math.random() * 40) + 10 + 0.99,
              options: {
                size: "M",
                color: "Default",
              },
              inventory: 100,
              sku: `SKU-${item.id}-STD`,
            },
          ],
        }))

        // Fetch featured storefronts
        const featuredBrands = [
          {
            id: "brand-marvel",
            name: "Marvel Entertainment",
            type: "brand",
            imageUrl: "/placeholder.svg?height=400&width=600&text=Marvel",
            slug: "marvel",
            productCount: 42,
            featured: true,
            description: "Official Marvel merchandise featuring your favorite superheroes",
            ownerId: "marvel-official",
          },
          {
            id: "brand-nintendo",
            name: "Nintendo",
            type: "brand",
            imageUrl: "/placeholder.svg?height=400&width=600&text=Nintendo",
            slug: "nintendo",
            productCount: 38,
            featured: true,
            description: "Licensed Nintendo character merchandise and collectibles",
            ownerId: "nintendo-official",
          },
          {
            id: "artist-johndoe",
            name: "John Doe Art Studio",
            type: "artist",
            imageUrl: "/placeholder.svg?height=400&width=600&text=John+Doe",
            slug: "john-doe-art",
            productCount: 24,
            featured: true,
            description: "Unique fan art creations by renowned digital artist John Doe",
            ownerId: "john-doe-123",
          },
        ]

        setProducts(productsFromGallery)
        setFilteredProducts(productsFromGallery)
        setFeaturedStorefronts(featuredBrands)
      } catch (err) {
        console.error("Error fetching marketplace data:", err)

        // Fallback to sample data if gallery fetch fails
        const sampleProducts = [
          {
            id: "sample-1",
            title: "Superhero T-Shirt",
            description: "Premium cotton t-shirt with licensed superhero design",
            price: 29.99,
            imageUrl: "/placeholder.svg?height=300&width=300&text=Superhero+Tee",
            artist: "Jane Artist",
            artistId: "jane-123",
            brand: "Marvel",
            isNew: true,
            isBestseller: true,
            slug: "superhero-tshirt",
            category: "apparel",
            tags: ["superhero", "t-shirt", "cotton"],
            status: "active",
          },
          {
            id: "sample-2",
            title: "Game Character Poster",
            description: "High-quality art print featuring your favorite game character",
            price: 19.99,
            imageUrl: "/placeholder.svg?height=300&width=300&text=Game+Poster",
            artist: "John Creator",
            artistId: "john-456",
            brand: "Nintendo",
            isNew: false,
            isBestseller: true,
            slug: "game-character-poster",
            category: "posters",
            tags: ["gaming", "poster", "wall-art"],
            status: "active",
          },
          {
            id: "sample-3",
            title: "Fantasy Creature Figurine",
            description: "Hand-painted collectible figurine",
            price: 49.99,
            imageUrl: "/placeholder.svg?height=300&width=300&text=Fantasy+Figurine",
            artist: "Sculpture Studio",
            artistId: "studio-789",
            brand: "Fantasy World",
            isNew: true,
            isBestseller: false,
            slug: "fantasy-figurine",
            category: "collectibles",
            tags: ["fantasy", "figurine", "collectible"],
            status: "active",
          },
          {
            id: "sample-4",
            title: "Anime Character Stickers",
            description: "Set of 10 waterproof vinyl stickers",
            price: 12.99,
            imageUrl: "/placeholder.svg?height=300&width=300&text=Anime+Stickers",
            artist: "Sticker Artist",
            artistId: "sticker-101",
            brand: "Anime Studio",
            isNew: false,
            isBestseller: false,
            slug: "anime-stickers",
            category: "stickers",
            tags: ["anime", "stickers", "vinyl"],
            status: "active",
          },
        ]

        const sampleStorefronts = [
          {
            id: "brand-marvel",
            name: "Marvel Entertainment",
            type: "brand",
            imageUrl: "/placeholder.svg?height=400&width=600&text=Marvel",
            slug: "marvel",
            productCount: 42,
            featured: true,
            description: "Official Marvel merchandise featuring your favorite superheroes",
            ownerId: "marvel-official",
          },
          {
            id: "brand-nintendo",
            name: "Nintendo",
            type: "brand",
            imageUrl: "/placeholder.svg?height=400&width=600&text=Nintendo",
            slug: "nintendo",
            productCount: 38,
            featured: true,
            description: "Licensed Nintendo character merchandise and collectibles",
            ownerId: "nintendo-official",
          },
          {
            id: "artist-johndoe",
            name: "John Doe Art Studio",
            type: "artist",
            imageUrl: "/placeholder.svg?height=400&width=600&text=John+Doe",
            slug: "john-doe-art",
            productCount: 24,
            featured: true,
            description: "Unique fan art creations by renowned digital artist John Doe",
            ownerId: "john-doe-123",
          },
        ]

        setProducts(sampleProducts)
        setFilteredProducts(sampleProducts)
        setFeaturedStorefronts(sampleStorefronts)
        setError("Unable to load gallery items. Showing sample products instead.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Memoize the filter change handler to prevent unnecessary re-renders
  const handleFilterChange = useCallback(
    (filters) => {
      let filtered = [...products]

      // Apply category filters
      if (filters.categories && filters.categories.length > 0) {
        filtered = filtered.filter((product) => filters.categories.includes(product.category))
      }

      // Apply brand filters
      if (filters.brands && filters.brands.length > 0) {
        filtered = filtered.filter((product) => {
          const brandId = product.brand?.toLowerCase().replace(/\s+/g, "") || ""
          return filters.brands.some((b) => brandId.includes(b))
        })
      }

      // Apply price range filter
      if (filters.priceRange && filters.priceRange.length === 2) {
        filtered = filtered.filter(
          (product) => product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1],
        )
      }

      // Apply search query if exists
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        filtered = filtered.filter(
          (product) =>
            product.title?.toLowerCase().includes(query) ||
            product.artist?.toLowerCase().includes(query) ||
            product.brand?.toLowerCase().includes(query),
        )
      }

      setFilteredProducts(filtered)
    },
    [products, searchQuery],
  )

  const handleSearch = useCallback(
    (query) => {
      setSearchQuery(query)

      if (!query) {
        setFilteredProducts(products)
        return
      }

      const filtered = products.filter((product) => {
        const searchTerm = query.toLowerCase()
        return (
          product.title?.toLowerCase().includes(searchTerm) ||
          product.artist?.toLowerCase().includes(searchTerm) ||
          product.brand?.toLowerCase().includes(searchTerm)
        )
      })

      setFilteredProducts(filtered)
    },
    [products],
  )

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading marketplace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Marketplace</h1>
        <p className="mt-2 text-muted-foreground">Browse and purchase officially licensed fan art merchandise</p>
        {error && (
          <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-amber-700 text-sm">{error}</div>
        )}
      </div>

      <div className="flex flex-col gap-6 md:flex-row">
        {/* Filters - Desktop */}
        <div className="hidden w-64 shrink-0 md:block">
          <div className="sticky top-24">
            <MarketplaceFilters onFilterChange={handleFilterChange} />
          </div>
        </div>

        {/* Filters - Mobile */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="mb-4 flex items-center gap-2 md:hidden">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>Narrow down products by applying filters</SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <MarketplaceFilters onFilterChange={handleFilterChange} />
            </div>
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <div className="flex-1">
          {/* Search and Sort */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="w-full sm:max-w-md">
              <Search onSearch={handleSearch} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <select className="rounded-md border border-input bg-background px-3 py-1 text-sm">
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>

          {/* Product Tabs */}
          <Tabs defaultValue="all" className="mb-8">
            <TabsList>
              <TabsTrigger value="all">All Products</TabsTrigger>
              <TabsTrigger value="new">New Arrivals</TabsTrigger>
              <TabsTrigger value="bestsellers">Bestsellers</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-6">
              {filteredProducts.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                  <p className="text-muted-foreground">No products match your filters</p>
                  <Button
                    variant="link"
                    onClick={() => {
                      setFilteredProducts(products)
                      setSearchQuery("")
                    }}
                  >
                    Clear all filters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} {...product} />
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="new" className="mt-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts
                  .filter((product) => product.isNew)
                  .map((product) => (
                    <ProductCard key={product.id} {...product} />
                  ))}
              </div>
            </TabsContent>
            <TabsContent value="bestsellers" className="mt-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts
                  .filter((product) => product.isBestseller)
                  .map((product) => (
                    <ProductCard key={product.id} {...product} />
                  ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Featured Storefronts */}
          <div className="mt-12">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight">Featured Storefronts</h2>
              <Link href="/marketplace/storefronts" className="flex items-center text-sm text-primary hover:underline">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredStorefronts.map((storefront) => (
                <Link key={storefront.id} href={`/marketplace/storefront/${storefront.slug}`}>
                  <div className="group overflow-hidden rounded-lg border">
                    <div className="relative h-40 w-full overflow-hidden">
                      <Image
                        src={storefront.imageUrl || "/placeholder.svg"}
                        alt={storefront.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold">{storefront.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {storefront.type === "brand" ? "Official Brand" : "Artist Storefront"}
                      </p>
                      <p className="mt-1 text-sm">{storefront.productCount} products</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

