import { LayoutWrapper } from "@/components/layout-wrapper"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"
import { Filter, Search } from "lucide-react"

export default function AvailableGalleryPage() {
  // Available artwork data with the provided images
  const availableArtwork = [
    {
      id: "avail-1",
      title: "Astro Boy Pixel Art",
      artist: "Thomas Wright",
      imageUrl:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/astroboy%201080X1350-06.jpg-HGXeQRkp0BweHMKLiYilSQYIsQUaob.jpeg",
      ipOwner: "Tezuka Productions",
      price: "$150",
      licenseType: "Commercial",
      tags: ["anime", "character", "geometric"],
    },
    {
      id: "avail-2",
      title: "Hello Kitty Pixel Art",
      artist: "Lily Chen",
      imageUrl:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HELLO%20KITTY%20-%201080X1350-11.jpg-yxorTxP88ikT1SC3GbUKIs3BAqNKIO.jpeg",
      ipOwner: "Sanrio",
      price: "$120",
      licenseType: "Limited Commercial",
      tags: ["character", "geometric", "kawaii"],
    },
    {
      id: "avail-3",
      title: "Mickey Mouse Pixel Art",
      artist: "Marcus Johnson",
      imageUrl:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/MICKEY%201080X1350-10.jpg-5bVq3gp47AgxB5AUrIeAYXqZmB40n2.jpeg",
      ipOwner: "Disney",
      price: "$200",
      licenseType: "Commercial",
      tags: ["character", "geometric", "classic"],
    },
    {
      id: "avail-4",
      title: "Super Mario Pixel Art",
      artist: "Emma Rodriguez",
      imageUrl:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/super%20mario%201080X1350-08.jpg-MNJva68t8vrqzDrzMHvRpiKiN9AoGl.jpeg",
      ipOwner: "Nintendo",
      price: "$180",
      licenseType: "Limited Commercial",
      tags: ["videogame", "character", "geometric"],
    },
    // New artwork
    {
      id: "avail-5",
      title: "Jujutsu Kaisen Character",
      artist: "Yuki Nakamura",
      imageUrl:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/jujutsukaisenhelen.jpg-FB9CZ6zZlUitofAwg6OpccuEmmW077.jpeg",
      ipOwner: "Shueisha",
      price: "$165",
      licenseType: "Limited Commercial",
      tags: ["anime", "character", "manga"],
    },
    {
      id: "avail-6",
      title: "Chun-Li",
      artist: "Ken Masters",
      imageUrl:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Chun-Li-big%20%281%29-nBmQfCVZTm6pVWrinBMhLbiJb9DFQ7.png",
      ipOwner: "Capcom",
      price: "$190",
      licenseType: "Commercial",
      tags: ["videogame", "character", "fighting game"],
    },
    {
      id: "avail-7",
      title: "Wolverine",
      artist: "Logan Howlett",
      imageUrl:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Deathwing_low.jpg-1k5LIionosgjQfRdYSI5t2upjvuI9G.jpeg",
      ipOwner: "Marvel Comics",
      price: "$210",
      licenseType: "Commercial",
      tags: ["superhero", "character", "comic book"],
    },
    {
      id: "avail-8",
      title: "Samurai Warrior II",
      artist: "Kenji Yamamoto",
      imageUrl:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Mizu_2_Colour__Correcred_Reduced%20%281%29-SVOVfYgrRiCXMeZvcRPH9kVW1rXH3w.png",
      ipOwner: "Original Creation",
      price: "$175",
      licenseType: "Personal",
      tags: ["samurai", "watercolor", "illustration"],
    },
  ]

  return (
    <LayoutWrapper>
      <div className="container py-10">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Available for Licensing</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Browse and license fan art for your commercial projects
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search artwork..." className="pl-10" />
          </div>
          <div className="flex gap-2">
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="IP Owner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All IP Owners</SelectItem>
                <SelectItem value="disney">Disney</SelectItem>
                <SelectItem value="nintendo">Nintendo</SelectItem>
                <SelectItem value="marvel">Marvel</SelectItem>
                <SelectItem value="capcom">Capcom</SelectItem>
                <SelectItem value="shueisha">Shueisha</SelectItem>
                <SelectItem value="sanrio">Sanrio</SelectItem>
                <SelectItem value="tezuka">Tezuka Productions</SelectItem>
                <SelectItem value="original">Original Creation</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="License Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Licenses</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="limited">Limited Commercial</SelectItem>
                <SelectItem value="personal">Personal Use</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="mb-8">
          <div className="flex justify-center">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="characters">Characters</TabsTrigger>
              <TabsTrigger value="anime">Anime & Manga</TabsTrigger>
              <TabsTrigger value="videogame">Video Game</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableArtwork.map((artwork) => (
                <Card key={artwork.id} className="overflow-hidden">
                  <div className="aspect-square relative">
                    <Image
                      src={artwork.imageUrl || "/placeholder.svg"}
                      alt={artwork.title}
                      fill
                      className="object-cover"
                    />
                    <Badge className="absolute top-2 right-2 bg-primary">{artwork.price}</Badge>
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
                  <CardFooter className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      Preview
                    </Button>
                    <Button className="flex-1" asChild>
                      <Link href={`/gallery/license/${artwork.id}`}>License Now</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="characters" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableArtwork
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
                      <Badge className="absolute top-2 right-2 bg-primary">{artwork.price}</Badge>
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
                    <CardFooter className="flex gap-2">
                      <Button variant="outline" className="flex-1">
                        Preview
                      </Button>
                      <Button className="flex-1" asChild>
                        <Link href={`/gallery/license/${artwork.id}`}>License Now</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="anime" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableArtwork
                .filter((art) => art.tags.includes("anime") || art.tags.includes("manga"))
                .map((artwork) => (
                  <Card key={artwork.id} className="overflow-hidden">
                    <div className="aspect-square relative">
                      <Image
                        src={artwork.imageUrl || "/placeholder.svg"}
                        alt={artwork.title}
                        fill
                        className="object-cover"
                      />
                      <Badge className="absolute top-2 right-2 bg-primary">{artwork.price}</Badge>
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
                    <CardFooter className="flex gap-2">
                      <Button variant="outline" className="flex-1">
                        Preview
                      </Button>
                      <Button className="flex-1" asChild>
                        <Link href={`/gallery/license/${artwork.id}`}>License Now</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="videogame" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableArtwork
                .filter((art) => art.tags.includes("videogame") || art.tags.includes("fighting game"))
                .map((artwork) => (
                  <Card key={artwork.id} className="overflow-hidden">
                    <div className="aspect-square relative">
                      <Image
                        src={artwork.imageUrl || "/placeholder.svg"}
                        alt={artwork.title}
                        fill
                        className="object-cover"
                      />
                      <Badge className="absolute top-2 right-2 bg-primary">{artwork.price}</Badge>
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
                    <CardFooter className="flex gap-2">
                      <Button variant="outline" className="flex-1">
                        Preview
                      </Button>
                      <Button className="flex-1" asChild>
                        <Link href={`/gallery/license/${artwork.id}`}>License Now</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="text-center mt-10">
          <p className="text-muted-foreground mb-4">Are you an artist? Submit your own fan art for licensing!</p>
          <Button asChild size="lg">
            <Link href="/submissions/new">Submit Your Artwork</Link>
          </Button>
        </div>
      </div>
    </LayoutWrapper>
  )
}

