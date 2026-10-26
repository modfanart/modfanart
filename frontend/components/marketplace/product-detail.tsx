'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Minus, Plus, ShoppingBag, Store, Truck } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/store/AuthContext';
import {
  getApiErrorMessage,
  useAddMerchToCartMutation,
  useGetMerchProductQuery,
  type MerchVariant,
} from '@/services/api/marketplaceApi';
import {
  FULFILLMENT_LABEL,
  formatMoney,
  priceCents,
  titleCase,
  variantAvailability,
} from '@/lib/marketplace/format';
import { useCurrency } from '@/lib/marketplace/use-currency';
import { CurrencyToggle } from './currency-toggle';
import { ProductImage } from './product-image';
import { ProductReviews, Stars } from './product-reviews';

type Attr = 'size' | 'color' | 'material';
const ATTRS: Attr[] = ['size', 'color', 'material'];

export function ProductDetail({ id }: { id: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [currency] = useCurrency();

  const { data: product, isLoading, isError } = useGetMerchProductQuery(id);
  const [addToCart, { isLoading: adding }] = useAddMerchToCartMutation();

  const variants = useMemo(() => (product?.variants ?? []).filter((v) => v.is_active), [product]);

  const [selection, setSelection] = useState<Partial<Record<Attr, string>>>({});
  const [quantity, setQuantity] = useState(1);

  // Which attributes actually vary across this product's variants.
  const options = useMemo(() => {
    const out: Partial<Record<Attr, string[]>> = {};
    for (const attr of ATTRS) {
      const values = Array.from(
        new Set(variants.map((v) => v[attr]).filter((x): x is string => Boolean(x)))
      );
      if (values.length) out[attr] = values;
    }
    return out;
  }, [variants]);

  // Start on the first purchasable variant.
  useEffect(() => {
    if (!product || !variants.length) return;
    const first =
      variants.find((v) => variantAvailability(v, product.fulfillment_type).available) ??
      variants[0];
    if (!first) return;
    setSelection({
      ...(first.size ? { size: first.size } : {}),
      ...(first.color ? { color: first.color } : {}),
      ...(first.material ? { material: first.material } : {}),
    });
  }, [product, variants]);

  const selected: MerchVariant | undefined = useMemo(
    () =>
      variants.find((v) =>
        ATTRS.every((a) => !options[a] || (v[a] ?? undefined) === selection[a])
      ),
    [variants, options, selection]
  );

  const availability = selected && product ? variantAvailability(selected, product.fulfillment_type) : null;
  const maxQty =
    product?.fulfillment_type === 'in_house_stock' && selected?.stock_qty != null
      ? Math.max(selected.stock_qty, 1)
      : 10;

  useEffect(() => setQuantity((q) => Math.min(q, maxQty)), [maxQty]);

  const handleAdd = async (goToCart: boolean) => {
    if (!user) {
      router.push(`/login?from=${encodeURIComponent(`/marketplace/product/${id}`)}`);
      return;
    }
    if (!selected) return;

    try {
      await addToCart({ merch_variant_id: selected.id, quantity }).unwrap();
      if (goToCart) {
        router.push('/marketplace/cart');
      } else {
        toast({ title: 'Added to cart', description: `${product?.title} × ${quantity}` });
      }
    } catch (err) {
      toast({
        title: "Couldn't add to cart",
        description: getApiErrorMessage(err),
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-10 lg:grid-cols-2">
        <Skeleton className="aspect-square w-full rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !product || product.status !== 'published') {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center">
        <h1 className="text-2xl font-bold">Product not available</h1>
        <p className="text-muted-foreground">It may have been removed or is still under review.</p>
        <Button asChild>
          <Link href="/marketplace">Back to marketplace</Link>
        </Button>
      </div>
    );
  }

  const unit = selected ? priceCents(selected, currency) : null;

  return (
    <div className="space-y-12">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/marketplace">
          <ArrowLeft className="mr-2 h-4 w-4" /> Marketplace
        </Link>
      </Button>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-xl border bg-muted">
          <ProductImage src={selected?.print_file_url || product.image_url} alt={product.title} />
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{titleCase(product.base_product_type)}</Badge>
              <Badge variant="outline">{FULFILLMENT_LABEL[product.fulfillment_type]}</Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{product.title}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Store className="h-4 w-4" />
                {product.brand_slug ? (
                  <Link
                    href={`/marketplace/storefront/${product.brand_id}`}
                    className="hover:underline"
                  >
                    {product.brand_name}
                  </Link>
                ) : (
                  product.seller_name || 'MOD creator'
                )}
              </span>
              {product.rating_count > 0 && (
                <span className="flex items-center gap-2">
                  <Stars value={product.rating_avg} /> {product.rating_avg.toFixed(1)} (
                  {product.rating_count})
                </span>
              )}
            </div>
          </div>

          <div className="flex items-end justify-between gap-4">
            <p className="text-3xl font-semibold">
              {unit != null ? formatMoney(unit, currency) : 'Select options'}
            </p>
            <CurrencyToggle />
          </div>

          {product.description && (
            <p className="whitespace-pre-line text-muted-foreground">{product.description}</p>
          )}

          <Separator />

          {ATTRS.map((attr) =>
            options[attr] ? (
              <fieldset key={attr} className="space-y-2">
                <legend className="text-sm font-medium">{titleCase(attr)}</legend>
                <div className="flex flex-wrap gap-2">
                  {options[attr]!.map((value) => {
                    const active = selection[attr] === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setSelection((s) => ({ ...s, [attr]: value }))}
                        className={`rounded-md border px-4 py-2 text-sm transition-colors ${
                          active
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'hover:border-primary/50'
                        }`}
                      >
                        {value}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ) : null
          )}

          {selected ? (
            <p
              className={`flex items-center gap-1.5 text-sm ${
                availability?.available ? 'text-emerald-600' : 'text-destructive'
              }`}
            >
              {availability?.available && <Check className="h-4 w-4" />}
              {availability?.label}
            </p>
          ) : (
            <p className="text-sm text-destructive">This combination is unavailable.</p>
          )}

          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-r-none"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div className="flex h-10 w-14 items-center justify-center border-y text-sm" aria-live="polite">
                {quantity}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-l-none"
                onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                disabled={quantity >= maxQty}
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <Button
              size="lg"
              className="flex-1"
              disabled={!selected || !availability?.available || adding}
              onClick={() => handleAdd(false)}
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              {adding ? 'Adding…' : 'Add to cart'}
            </Button>
          </div>

          <Button
            variant="outline"
            size="lg"
            className="w-full"
            disabled={!selected || !availability?.available || adding}
            onClick={() => handleAdd(true)}
          >
            Buy now
          </Button>

          <div className="flex items-start gap-3 rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
            <Truck className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              {product.fulfillment_type === 'print_on_demand'
                ? 'Printed on demand for you after you order — allow a few extra days before it ships.'
                : 'Ships directly from the seller. Tracking is added to your order once it is on its way.'}
            </p>
          </div>
        </div>
      </div>

      <Separator />
      <ProductReviews targetType="merch_product" targetId={product.id} />
    </div>
  );
}
