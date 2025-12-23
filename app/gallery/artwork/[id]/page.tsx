import { LayoutWrapper } from "@/components/layout-wrapper"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Download, Share2, Heart } from "lucide-react"

// This would normally come from a database
const getArtworkData = (id: string) => {
  const allArtwork = [
    {
      id: "art-1",
      title: "Philippine Eagle Study",
      artist: "Elena Rodriguez",
      imageUrl:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Philippine%20Eagle-2.jpg-VjOQtJxMTxu8VI5ym5jsfB1f9kbF0d.jpeg",
      ipOwner: "Wildlife Conservation",
      licenseType: "Commercial",
      price: "$180",
      description:
        "A detailed study of the endangered Philippine Eagle, showcasing the majestic bird's features in intricate black and white illustration.",
      createdAt: "2023-09-15",
      medium: "Digital Illustration",
      dimensions: "3000 x 3000 px",
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
      price: "$150",
      description:
        "A striking portrait of the Philippine Eagle, highlighting the bird's distinctive features through detailed line work.",
      createdAt: "2023-10-22",
      medium: "Digital Illustration",
      dimensions: "2800 x 3200 px",
      tags: ["wildlife", "illustration", "black and white"],
    },
    // Add more artwork data as needed
  ]

  return allArtwork.find((art) => art.id === id) || allArtwork[0]
}

export default function ArtworkDetailPage({ params }: { params: { id: string } }) {
  const artwork = getArtworkData(params.id)

  return (
    <LayoutWrapper>
      <div className="container py-10">
        <div className="mb-6">
          <Link
            href="/gallery/featured"
            className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Gallery
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-black rounded-lg overflow-hidden">
            <div className="aspect-square relative">
              <Image src={artwork.imageUrl || "/placeholder.svg"} alt={artwork.title} fill className="object-contain" />
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-bold mb-2">{artwork.title}</h1>
            <p className="text-xl mb-4">by {artwork.artist}</p>

            <div className="flex items-center gap-2 mb-6">
              <Badge variant="outline" className="text-sm font-normal">
                {artwork.licenseType} License
              </Badge>
              <Badge variant="outline" className="text-sm font-normal">
                Based on {artwork.ipOwner} IP
              </Badge>
            </div>

            <p className="text-muted-foreground mb-6">{artwork.description}</p>

            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold">{artwork.price}</span>
                  <Button size="lg">License This Artwork</Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>{artwork.createdAt}</span>
              </div>
              <Separator />

              <div className="flex justify-between">
                <span className="text-muted-foreground">Medium</span>
                <span>{artwork.medium}</span>
              </div>
              <Separator />

              <div className="flex justify-between">
                <span className="text-muted-foreground">Dimensions</span>
                <span>{artwork.dimensions}</span>
              </div>
              <Separator />

              <div className="flex justify-between">
                <span className="text-muted-foreground">Tags</span>
                <div className="flex flex-wrap gap-2 justify-end">
                  {artwork.tags.map((tag) => (
                    <span key={tag} className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-8">
              <Button variant="outline" size="icon">
                <Heart className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">More from this artist</h2>
          {/* More artwork would go here */}
        </div>
      </div>
    </LayoutWrapper>
  )
}

