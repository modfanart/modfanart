import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ArtistNotFound() {
  return (
    <div className="container mx-auto py-16 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4">Artist Not Found</h1>
      <p className="text-muted-foreground mb-8 text-center max-w-md">
        The artist profile you're looking for doesn't exist or may have been removed.
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/gallery">Browse Gallery</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    </div>
  )
}

