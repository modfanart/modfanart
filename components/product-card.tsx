import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

export function ProductCard({ id, title, price, imageUrl, artist, brand, isNew, isBestseller, slug, category }) {
  return (
    <Link href={`/marketplace/product/${slug || id}`}>
      <Card className="overflow-hidden transition-all hover:shadow-md">
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={imageUrl || "/placeholder.svg?height=300&width=300"}
            alt={title}
            fill
            className="object-cover transition-transform hover:scale-105"
          />
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {isNew && (
              <Badge variant="secondary" className="bg-blue-500 text-white hover:bg-blue-600">
                New
              </Badge>
            )}
            {isBestseller && (
              <Badge variant="secondary" className="bg-amber-500 text-white hover:bg-amber-600">
                Bestseller
              </Badge>
            )}
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-medium line-clamp-1">{title}</h3>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{artist}</span>
            <span className="text-sm text-muted-foreground">{brand}</span>
          </div>
        </CardContent>
        <CardFooter className="border-t p-4">
          <div className="flex w-full items-center justify-between">
            <span className="font-semibold">${price?.toFixed(2) || "0.00"}</span>
            <Badge variant="outline" className="text-xs capitalize">
              {category}
            </Badge>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}

