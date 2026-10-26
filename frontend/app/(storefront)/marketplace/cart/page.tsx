'use client';

import Link from 'next/link';
import { AlertTriangle, ArrowLeft, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { CurrencyToggle } from '@/components/marketplace/currency-toggle';
import { ProductImage } from '@/components/marketplace/product-image';
import { RequireAuth } from '@/components/marketplace/require-auth';
import {
  getApiErrorMessage,
  useGetCartQuery,
  useRemoveCartItemMutation,
  useUpdateCartItemMutation,
} from '@/services/api/marketplaceApi';
import { cartItemProblem } from '@/lib/marketplace/cart';
import { formatMoney, priceCents, titleCase } from '@/lib/marketplace/format';
import { useCurrency } from '@/lib/marketplace/use-currency';

function CartContent() {
  const { toast } = useToast();
  const [currency] = useCurrency();

  const { data: cart, isLoading, isError } = useGetCartQuery();
  const [updateItem, { isLoading: updating }] = useUpdateCartItemMutation();
  const [removeItem] = useRemoveCartItemMutation();

  const onError = (err: unknown) =>
    toast({ title: 'Cart update failed', description: getApiErrorMessage(err), variant: 'destructive' });

  const items = cart?.items ?? [];
  const subtotal = items.reduce((sum, i) => sum + (priceCents(i, currency) ?? 0) * i.quantity, 0);
  const problems = items.filter((i) => cartItemProblem(i));
  const sellerCount = new Set(items.map((i) => i.seller_id ?? i.artwork_id)).size;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (isError) {
    return <p className="text-destructive">We couldn&apos;t load your cart. Please refresh.</p>;
  }

  if (!items.length) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Your cart</h1>
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <ShoppingCart className="mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 text-xl font-semibold">Your cart is empty</h2>
          <p className="mb-6 text-muted-foreground">Find something you love in the marketplace.</p>
          <Button asChild>
            <Link href="/marketplace">Continue shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Your cart</h1>
        <CurrencyToggle />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <ul className="divide-y rounded-lg border">
            {items.map((item) => {
              const unit = priceCents(item, currency);
              const problem = cartItemProblem(item);
              const href =
                item.item_type === 'merch_variant' && item.merch_product_id
                  ? `/marketplace/product/${item.merch_product_id}`
                  : item.artwork_id
                    ? `/artwork/${item.artwork_id}`
                    : '#';

              return (
                <li key={item.id} className="flex flex-col gap-4 p-5 sm:flex-row">
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-md border">
                    <ProductImage src={item.image_url} alt={item.title ?? 'Cart item'} />
                  </div>

                  <div className="flex flex-1 flex-col gap-3">
                    <div className="flex flex-col justify-between gap-1 sm:flex-row">
                      <div>
                        <Link href={href} className="font-medium hover:underline">
                          {item.title ?? 'Item'}
                        </Link>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {item.item_type === 'license'
                            ? `${titleCase(item.license_type)} license`
                            : [item.size, item.color, item.material].filter(Boolean).join(' · ') ||
                              item.sku}
                        </p>
                        {problem && (
                          <Badge variant="destructive" className="mt-2 gap-1">
                            <AlertTriangle className="h-3 w-3" /> {problem}
                          </Badge>
                        )}
                      </div>
                      <div className="font-semibold">
                        {unit != null ? formatMoney(unit * item.quantity, currency) : '—'}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      {item.item_type === 'merch_variant' ? (
                        <div className="flex items-center">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-r-none"
                            disabled={updating || item.quantity <= 1}
                            onClick={() =>
                              updateItem({ itemId: item.id, quantity: item.quantity - 1 })
                                .unwrap()
                                .catch(onError)
                            }
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <div className="flex h-8 w-12 items-center justify-center border-y text-sm">
                            {item.quantity}
                          </div>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-l-none"
                            disabled={updating}
                            onClick={() =>
                              updateItem({ itemId: item.id, quantity: item.quantity + 1 })
                                .unwrap()
                                .catch(onError)
                            }
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Digital license</span>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground"
                        onClick={() =>
                          removeItem(item.id)
                            .unwrap()
                            .then(() => toast({ title: 'Item removed' }))
                            .catch(onError)
                        }
                      >
                        <Trash2 className="mr-1 h-4 w-4" /> Remove
                      </Button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <Button variant="outline" asChild>
            <Link href="/marketplace">
              <ArrowLeft className="mr-2 h-4 w-4" /> Continue shopping
            </Link>
          </Button>
        </div>

        <aside className="h-fit space-y-4 rounded-lg border p-6">
          <h2 className="text-lg font-semibold">Order summary</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatMoney(subtotal, currency)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping &amp; tax</span>
              <span>Included</span>
            </div>
            <Separator />
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span>{formatMoney(subtotal, currency)}</span>
            </div>
          </div>

          {sellerCount > 1 && (
            <p className="rounded-md bg-muted/60 p-3 text-xs text-muted-foreground">
              Your items come from {sellerCount} sellers, so they&apos;ll arrive as separate orders
              under one payment.
            </p>
          )}

          {problems.length > 0 && (
            <p role="alert" className="text-sm text-destructive">
              Remove or fix the unavailable items to continue.
            </p>
          )}

          <Button size="lg" className="w-full" asChild disabled={problems.length > 0}>
            <Link
              href="/marketplace/checkout"
              aria-disabled={problems.length > 0}
              className={problems.length > 0 ? 'pointer-events-none opacity-50' : ''}
            >
              Proceed to checkout
            </Link>
          </Button>
        </aside>
      </div>
    </div>
  );
}

export default function CartPage() {
  return (
    <RequireAuth message="Sign in to see your cart.">
      <CartContent />
    </RequireAuth>
  );
}
