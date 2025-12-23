import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // In a real implementation, this would fetch from your database
    // For now, we'll return sample gallery items that represent approved fan art
    const approvedArtwork = [
      {
        id: "art-001",
        title: "Superhero in Action",
        description: "Dynamic illustration of a popular superhero in action",
        imageUrl: "/placeholder.svg?height=400&width=400&text=Superhero+Art",
        artistName: "Jane Artist",
        artistId: "jane-123",
        originalIp: "Marvel",
        approvedDate: "2023-02-15T10:30:00Z",
        featured: true,
        category: "apparel",
        tags: ["superhero", "action", "illustration"],
        price: 29.99,
      },
      {
        id: "art-002",
        title: "Game Character Portrait",
        description: "Detailed portrait of a beloved video game character",
        imageUrl: "/placeholder.svg?height=400&width=400&text=Game+Character",
        artistName: "John Creator",
        artistId: "john-456",
        originalIp: "Nintendo",
        approvedDate: new Date().toISOString(), // Today (new)
        featured: false,
        category: "posters",
        tags: ["gaming", "portrait", "digital-art"],
        price: 24.99,
      },
      {
        id: "art-003",
        title: "Fantasy World Map",
        description: "Intricate map of a popular fantasy world",
        imageUrl: "/placeholder.svg?height=400&width=400&text=Fantasy+Map",
        artistName: "Map Maker",
        artistId: "map-789",
        originalIp: "Fantasy Realms",
        approvedDate: "2023-01-20T14:45:00Z",
        featured: true,
        category: "posters",
        tags: ["fantasy", "map", "illustration"],
        price: 34.99,
      },
      {
        id: "art-004",
        title: "Anime Character Collection",
        description: "Stylized collection of popular anime characters",
        imageUrl: "/placeholder.svg?height=400&width=400&text=Anime+Collection",
        artistName: "Anime Artist",
        artistId: "anime-101",
        originalIp: "Anime Studio",
        approvedDate: "2023-03-05T09:15:00Z",
        featured: false,
        category: "stickers",
        tags: ["anime", "characters", "collection"],
        price: 14.99,
      },
      {
        id: "art-005",
        title: "Sci-Fi Spaceship Design",
        description: "Detailed technical drawing of an iconic sci-fi spaceship",
        imageUrl: "/placeholder.svg?height=400&width=400&text=Spaceship+Design",
        artistName: "Space Designer",
        artistId: "space-202",
        originalIp: "Sci-Fi Universe",
        approvedDate: new Date().toISOString(), // Today (new)
        featured: true,
        category: "posters",
        tags: ["sci-fi", "spaceship", "technical"],
        price: 29.99,
      },
      {
        id: "art-006",
        title: "Magical Creatures Set",
        description: "Collection of magical creatures from a fantasy series",
        imageUrl: "/placeholder.svg?height=400&width=400&text=Magical+Creatures",
        artistName: "Fantasy Artist",
        artistId: "fantasy-303",
        originalIp: "Magic World",
        approvedDate: "2023-02-28T16:20:00Z",
        featured: false,
        category: "collectibles",
        tags: ["fantasy", "creatures", "collection"],
        price: 49.99,
      },
      {
        id: "art-007",
        title: "Retro Game Tribute",
        description: "Nostalgic artwork celebrating classic video games",
        imageUrl: "/placeholder.svg?height=400&width=400&text=Retro+Games",
        artistName: "Retro Designer",
        artistId: "retro-404",
        originalIp: "Classic Gaming",
        approvedDate: "2023-03-10T11:30:00Z",
        featured: true,
        category: "apparel",
        tags: ["retro", "gaming", "nostalgia"],
        price: 27.99,
      },
      {
        id: "art-008",
        title: "Comic Book Heroes",
        description: "Group portrait of iconic comic book heroes",
        imageUrl: "/placeholder.svg?height=400&width=400&text=Comic+Heroes",
        artistName: "Comic Artist",
        artistId: "comic-505",
        originalIp: "Comic Universe",
        approvedDate: new Date().toISOString(), // Today (new)
        featured: false,
        category: "posters",
        tags: ["comics", "heroes", "group"],
        price: 32.99,
      },
    ]

    return NextResponse.json({
      success: true,
      items: approvedArtwork,
    })
  } catch (error) {
    console.error("Error fetching approved gallery items:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch approved gallery items",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

