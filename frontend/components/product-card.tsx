import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

interface ProductCardProps {
  id: string | number;
  title: string;
  price: number;
  imageUrl?: string;
  artist?: string;
  brand?: string;
  isNew?: boolean;
  isBestseller?: boolean;
  slug?: string;
  category?: string;
}

export function ProductCard({
  id,
  title,
  price,
  imageUrl,
  artist,
  brand,
  isNew = false,
  isBestseller = false,
  slug,
  category,
}: ProductCardProps) {
  const href = `/marketplace/product/${slug || id}`;

  return (
    <Link href={href} className="block">
      <Card className="overflow-hidden transition-all hover:shadow-md hover:ring-2 hover:ring-primary/20">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={imageUrl || '/placeholder.svg?height=300&width=300'}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 hover:scale-105"
            priority={false}
          />
          {(isNew || isBestseller) && (
            <div className="absolute left-2 top-2 flex flex-col gap-1">
              {isNew && (
                <Badge variant="secondary" className="bg-blue-500 text-white">
                  New
                </Badge>
              )}
              {isBestseller && (
                <Badge variant="secondary" className="bg-amber-500 text-white">
                  Bestseller
                </Badge>
              )}
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <h3 className="font-medium line-clamp-2 text-base">{title}</h3>
          <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
            {artist ? <span>{artist}</span> : <span className="text-transparent">—</span>}
            {brand ? <span>{brand}</span> : <span className="text-transparent">—</span>}
          </div>
        </CardContent>

        <CardFooter className="border-t bg-muted/30 p-4">
          <div className="flex w-full items-center justify-between">
            <span className="font-bold text-lg">${price.toFixed(2)}</span>
            {category && (
              <Badge variant="outline" className="text-xs capitalize">
                {category}
              </Badge>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
