import { LayoutWrapper } from "@/components/layout-wrapper"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import Link from "next/link"

export default function FeaturedGalleryPage() {
  // Featured artwork data with the provided images
  const featuredArtwork = [
    {
      id: "art-1",
      title: "Philippine Eagle Study",
      artist: "Elena Rodriguez",
      imageUrl:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Philippine%20Eagle-2.jpg-VjOQtJxMTxu8VI5ym5jsfB1f9kbF0d.jpeg",
      ipOwner: "Wildlife Conservation",
      licenseType: "Commercial",
      tags: ["wildlife", "illustration", "black and white"],
    },
    {
      id: "art-2",
      title: "Philippine Eagle Portrait",
      artist: "Michael Chen",
      imageUrl:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Philippine%20Eagle-1.jpg-OAS06nLzeyogy0P4YFPYqagYQYSsWF.jpeg",
      ipOwner: "Wildlife Conservation",
      licenseType: "Limited Commercial",
      tags: ["wildlife", "illustration", "black and white"],
    },
    {
      id: "art-3",
      title: "Apple Nest",
      artist: "James Wilson",
      imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/APPLE.jpg-59OkRVSwUfpaheS9HO6YlRCy4JDyca.jpeg",
      ipOwner: "Tech Inspirations",
      licenseType: "Personal",
      tags: ["tech", "illustration", "black and white"],
    },
    {
      id: "art-4",
      title: "Nature Hulk",
      artist: "Sarah Johnson",
      imageUrl:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hulk%20nature-2.jpg-ivaqVZqmxWtiQzqj7KrfCIH3S8XKHP.jpeg",
      ipOwner: "Marvel Comics",
      licenseType: "Commercial",
      tags: ["superhero", "character", "illustration"],
    },
    {
      id: "art-5",
      title: "Hulk Fusion",
      artist: "David Park",
      imageUrl:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hulk%20nature.jpg-OQGAtfx41MiBFnTF4sYxLXLu3Zqbmg.jpeg",
      ipOwner: "Marvel Comics",
      licenseType: "Limited Commercial",
      tags: ["superhero", "character", "illustration"],
    },
    {
      id: "art-6",
      title: "Geometric Batman",
      artist: "Olivia Martinez",
      imageUrl:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/red%201080X1350-05.jpg-RdoV5YVfj6ZnUOfkceHpJIcTjJut1a.jpeg",
      ipOwner: "DC Comics",
      licenseType: "Commercial",
      tags: ["superhero", "character", "geometric"],
    },
    // New artwork
    {
      id: "art-7",
      title: "Squid Game Player 456",
      artist: "Min-Ji Park",
      imageUrl:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/456-01.jpg-j6apCWvfzlCr1D8ZyxmoJhhdIfhxNF.jpeg",
      ipOwner: "Netflix",
      licenseType: "Limited Commercial",
      tags: ["tv series", "character", "illustration"],
    },
    {
      id: "art-8",
      title: "Ahsoka Tano",
      artist: "Alex Rivera",
      imageUrl:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ahsoka-FINAL-01%20%282%29-PO2rMTckglJ6t9uWAalnbK7kR10iY9.png",
      ipOwner: "Lucasfilm",
      licenseType: "Commercial",
      tags: ["star wars", "character", "vector art"],
    },
    {
      id: "art-9",
      title: "Samurai Warrior",
      artist: "Hiroshi Tanaka",
      imageUrl:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Mizu_1_Colour_Reduced%20%281%29-mjT22q6qW7cm30IdGDCWTYfsxvd7fw.png",
      ipOwner: "Original Creation",
      licenseType: "Personal",
      tags: ["samurai", "watercolor", "illustration"],
    },
    {
      id: "art-10",
      title: "Cherry - Cytus II",
      artist: "Wei Chen",
      imageUrl:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/CHERRY-CYTUS-II.jpg-KZxxwPf0sVDgP8RhQq8p5D6Rm4r1cv.jpeg",
      ipOwner: "Rayark Inc.",
      licenseType: "Limited Commercial",
      tags: ["game", "character", "minimalist"],
    },
    {
      id: "art-11",
      title: "Dark Knight",
      artist: "Thomas Wayne",
      imageUrl:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Absolute_Batman_low.jpg-jbjBkbHD8un1TKig37wzR4G3RvZFbk.jpeg",
      ipOwner: "DC Comics",
      licenseType: "Commercial",
      tags: ["superhero", "batman", "dark art"],
    },
    {
      id: "art-12",
      title: "Man of Steel",
      artist: "Clark Kent",
      imageUrl:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Kingdomcome_Superman_Cage.jpg-s85NukrW7EgB7MBvecYgG3p33JcPMZ.jpeg",
      ipOwner: "DC Comics",
      licenseType: "Commercial",
      tags: ["superhero", "superman", "abstract"],
    },
  ]

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredArtwork.map((artwork) => (
                <Card key={artwork.id} className="overflow-hidden">
                  <div className="aspect-square relative">
                    <Image
                      src={artwork.imageUrl || "/placeholder.svg"}
                      alt={artwork.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle>{artwork.title}</CardTitle>
                    <CardDescription>
                      By {artwork.artist} • {artwork.licenseType} License
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Based on IP from {artwork.ipOwner}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {artwork.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full">
                      <Link href={`/gallery/artwork/${artwork.id}`}>View Details</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="characters" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredArtwork
                .filter((art) => art.tags.includes("character"))
                .map((artwork) => (
                  <Card key={artwork.id} className="overflow-hidden">
                    <div className="aspect-square relative">
                      <Image
                        src={artwork.imageUrl || "/placeholder.svg"}
                        alt={artwork.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <CardHeader>
                      <CardTitle>{artwork.title}</CardTitle>
                      <CardDescription>
                        By {artwork.artist} • {artwork.licenseType} License
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">Based on IP from {artwork.ipOwner}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {artwork.tags.map((tag) => (
                          <span
                            key={tag}
                            className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button asChild className="w-full">
                        <Link href={`/gallery/artwork/${artwork.id}`}>View Details</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="superhero" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredArtwork
                .filter(
                  (art) =>
                    art.tags.includes("superhero") || art.tags.includes("batman") || art.tags.includes("superman"),
                )
                .map((artwork) => (
                  <Card key={artwork.id} className="overflow-hidden">
                    <div className="aspect-square relative">
                      <Image
                        src={artwork.imageUrl || "/placeholder.svg"}
                        alt={artwork.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <CardHeader>
                      <CardTitle>{artwork.title}</CardTitle>
                      <CardDescription>
                        By {artwork.artist} • {artwork.licenseType} License
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">Based on IP from {artwork.ipOwner}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {artwork.tags.map((tag) => (
                          <span
                            key={tag}
                            className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button asChild className="w-full">
                        <Link href={`/gallery/artwork/${artwork.id}`}>View Details</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="anime" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredArtwork
                .filter(
                  (art) => art.tags.includes("anime") || art.tags.includes("game") || art.tags.includes("vector art"),
                )
                .map((artwork) => (
                  <Card key={artwork.id} className="overflow-hidden">
                    <div className="aspect-square relative">
                      <Image
                        src={artwork.imageUrl || "/placeholder.svg"}
                        alt={artwork.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <CardHeader>
                      <CardTitle>{artwork.title}</CardTitle>
                      <CardDescription>
                        By {artwork.artist} • {artwork.licenseType} License
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">Based on IP from {artwork.ipOwner}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {artwork.tags.map((tag) => (
                          <span
                            key={tag}
                            className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button asChild className="w-full">
                        <Link href={`/gallery/artwork/${artwork.id}`}>View Details</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="other" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredArtwork
                .filter(
                  (art) => art.tags.includes("wildlife") || art.tags.includes("tech") || art.tags.includes("samurai"),
                )
                .map((artwork) => (
                  <Card key={artwork.id} className="overflow-hidden">
                    <div className="aspect-square relative">
                      <Image
                        src={artwork.imageUrl || "/placeholder.svg"}
                        alt={artwork.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <CardHeader>
                      <CardTitle>{artwork.title}</CardTitle>
                      <CardDescription>
                        By {artwork.artist} • {artwork.licenseType} License
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">Based on IP from {artwork.ipOwner}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {artwork.tags.map((tag) => (
                          <span
                            key={tag}
                            className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button asChild className="w-full">
                        <Link href={`/gallery/artwork/${artwork.id}`}>View Details</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="text-center mt-10">
          <Button asChild size="lg">
            <Link href="/gallery/available">Browse Available Artwork</Link>
          </Button>
        </div>
      </div>
    </LayoutWrapper>
  )
}

