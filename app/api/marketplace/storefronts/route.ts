import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const featured = searchParams.get("featured") === "true"

    // Mock data for storefronts
    const allStorefronts = [
      {
        id: "store-1",
        name: "Official Brand Store",
        slug: "official-brand",
        imageUrl: "/placeholder.svg?height=400&width=600",
        type: "brand",
        productCount: 24,
        featured: true,
      },
      {
        id: "store-2",
        name: "Artist Collection",
        slug: "artist-collection",
        imageUrl: "/placeholder.svg?height=400&width=600",
        type: "artist",
        productCount: 12,
        featured: true,
      },
      {
        id: "store-3",
        name: "Indie Creator Shop",
        slug: "indie-creator",
        imageUrl: "/placeholder.svg?height=400&width=600",
        type: "artist",
        productCount: 8,
        featured: false,
      },
    ]

    // Filter by featured if requested
    const storefronts = featured ? allStorefronts.filter((store) => store.featured) : allStorefronts

    return NextResponse.json({ storefronts })
  } catch (error) {
    console.error("Error fetching storefronts:", error)
    return NextResponse.json({
      storefronts: [
        {
          id: "fallback-store",
          name: "Sample Store",
          slug: "sample-store",
          imageUrl: "/placeholder.svg?height=400&width=600",
          type: "brand",
          productCount: 5,
          featured: true,
        },
      ],
    })
  }
}

