'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  useGetProductQuery,
} from '@/services/api/merchApi';
import { useAddMerchItemMutation } from '@/services/api/cartApi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toaster';
import { Loader2, ShoppingCart, ArrowLeft } from 'lucide-react';
import type { MerchVariant } from '@/types/merch';

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { toast } = useToast();

  const { data, isLoading, isError } = useGetProductQuery(id);
  const [addMerchItem, { isLoading: isAdding }] = useAddMerchItemMutation();

  const product = data?.product;
  const variants = (product?.variants ?? []).filter((v) => v.is_active);

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null
  );
  const [quantity, setQuantity] = useState(1);

  // Auto-select first variant when loaded
  const activeVariant: MerchVariant | null = useMemo(() => {
    if (!variants.length) return null;
    if (selectedVariantId) {
      return variants.find((v) => v.id === selectedVariantId) ?? variants[0];
    }
    return variants[0];
  }, [variants, selectedVariantId]);

  const sizes = useMemo(
    () =>
      Array.from(
        new Set(variants.map((v) => v.size).filter(Boolean) as string[])
      ),
    [variants]
  );
  const colors = useMemo(
    () =>
      Array.from(
        new Set(variants.map((v) => v.color).filter(Boolean) as string[])
      ),
    [variants]
  );

  const handleAddToCart = async () => {
    if (!activeVariant) {
      toast({
        title: 'Select options',
        description: 'Please choose a variant first.',
        variant: 'destructive',
      });
      return;
    }
    try {
      await addMerchItem({
        merch_variant_id: activeVariant.id,
        quantity,
      }).unwrap();
      toast({
        title: 'Added to cart',
        description: `${product?.title} × ${quantity}`,
      });
    } catch (err: any) {
      toast({
        title: 'Could not add to cart',
        description: err?.data?.error || 'Please sign in and try again.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[50vh] items-center justify-center px-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="container mx-auto flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4">
        <p className="text-muted-foreground">Product not found.</p>
        <Button asChild variant="outline">
          <Link href="/storefront">Back to marketplace</Link>
        </Button>
      </div>
    );
  }

  const imageUrl =
    product.primary_image_url ||
    product.artwork?.thumbnail_url ||
    '/placeholder-product.png';

  const priceCents = activeVariant?.price_usd_cents ?? 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        size="sm"
        className="mb-6"
        onClick={() => router.back()}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-xl border bg-muted">
          <Image
            src={imageUrl}
            alt={product.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <div className="mb-2 flex flex-wrap gap-2">
              <Badge variant="secondary" className="capitalize">
                {product.base_product_type.replace('_', ' ')}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {product.fulfillment_type.replace(/_/g, ' ')}
              </Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              {product.title}
            </h1>
            {product.seller?.username && (
              <p className="mt-1 text-sm text-muted-foreground">
                Sold by {product.seller.username}
              </p>
            )}
          </div>

          <p className="text-2xl font-semibold">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(priceCents / 100)}
          </p>

          {product.description && (
            <p className="text-muted-foreground whitespace-pre-wrap">
              {product.description}
            </p>
          )}

          {variants.length > 0 && (
            <div className="space-y-4">
              {sizes.length > 0 && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Size
                  </label>
                  <Select
                    value={activeVariant?.size ?? undefined}
                    onValueChange={(size) => {
                      const match = variants.find(
                        (v) =>
                          v.size === size &&
                          (activeVariant?.color
                            ? v.color === activeVariant.color
                            : true)
                      );
                      if (match) setSelectedVariantId(match.id);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {sizes.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {colors.length > 0 && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Color
                  </label>
                  <Select
                    value={activeVariant?.color ?? undefined}
                    onValueChange={(color) => {
                      const match = variants.find(
                        (v) =>
                          v.color === color &&
                          (activeVariant?.size
                            ? v.size === activeVariant.size
                            : true)
                      );
                      if (match) setSelectedVariantId(match.id);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select color" />
                    </SelectTrigger>
                    <SelectContent>
                      {colors.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Quantity
                </label>
                <Select
                  value={String(quantity)}
                  onValueChange={(v) => setQuantity(Number(v))}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              size="lg"
              onClick={handleAddToCart}
              disabled={!activeVariant || isAdding}
            >
              {isAdding ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ShoppingCart className="mr-2 h-4 w-4" />
              )}
              Add to cart
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/cart">Go to cart</Link>
            </Button>
          </div>

          {activeVariant?.stock_qty != null && (
            <p className="text-sm text-muted-foreground">
              {activeVariant.stock_qty > 0
                ? `${activeVariant.stock_qty} in stock`
                : 'Out of stock'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
