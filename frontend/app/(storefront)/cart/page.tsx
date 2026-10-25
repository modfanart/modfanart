'use client';

import Link from 'next/link';
import {
  useGetCartQuery,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
} from '@/services/api/cartApi';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toaster';
import {
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  ShoppingCart,
  Loader2,
} from 'lucide-react';
import type { CartItem } from '@/services/types/merch';

export default function CartPage() {
  const { data, isLoading, isError, refetch } = useGetCartQuery();
  const [updateItem, { isLoading: isUpdating }] = useUpdateCartItemMutation();
  const [removeItem, { isLoading: isRemoving }] = useRemoveCartItemMutation();
  const { toast } = useToast();

  const cart = data?.cart;
  const items: CartItem[] = cart?.items ?? [];

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      await updateItem({ itemId, quantity: newQuantity }).unwrap();
    } catch (err: any) {
      toast({
        title: 'Update failed',
        description: err?.data?.error || 'Could not update quantity',
        variant: 'destructive',
      });
    }
  };

  const handleRemove = async (itemId: string) => {
    try {
      await removeItem(itemId).unwrap();
      toast({ title: 'Item removed' });
    } catch (err: any) {
      toast({
        title: 'Remove failed',
        description: err?.data?.error || 'Could not remove item',
        variant: 'destructive',
      });
    }
  };

  const subtotalCents = items.reduce((sum, item) => {
    const unit =
      item.price_usd_cents ??
      item.price_inr_cents ??
      0;
    return sum + unit * item.quantity;
  }, 0);

  const formatUSD = (cents: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[50vh] items-center justify-center px-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4">
        <p className="text-muted-foreground">
          Could not load cart. Please sign in.
        </p>
        <Button onClick={() => refetch()}>Retry</Button>
        <Button asChild variant="outline">
          <Link href="/login">Sign in</Link>
        </Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <ShoppingCart className="h-12 w-12 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="text-muted-foreground">
          Browse the marketplace and add something you like.
        </p>
        <Button asChild>
          <Link href="/storefront">Go to marketplace</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Shopping cart</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => {
            const title =
              item.title || item.merch_title || item.license_type || 'Item';
            const unitCents =
              item.price_usd_cents ?? item.price_inr_cents ?? 0;
            const lineTotal = unitCents * item.quantity;

            return (
              <div
                key={item.id}
                className="flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center"
              >
                <div className="flex-1">
                  <p className="font-medium">{title}</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {item.item_type.replace('_', ' ')}
                    {item.size ? ` · ${item.size}` : ''}
                    {item.color ? ` · ${item.color}` : ''}
                    {item.sku ? ` · SKU ${item.sku}` : ''}
                  </p>
                  <p className="mt-1 text-sm font-medium">
                    {formatUSD(unitCents)} each
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={isUpdating || item.quantity <= 1}
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center tabular-nums">
                    {item.quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={isUpdating}
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-3 sm:w-32 sm:justify-end">
                  <span className="font-semibold">{formatUSD(lineTotal)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={isRemoving}
                    onClick={() => handleRemove(item.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="h-fit rounded-xl border p-6">
          <h2 className="mb-4 text-lg font-semibold">Order summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatUSD(subtotalCents)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>Calculated at checkout</span>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span>{formatUSD(subtotalCents)}</span>
          </div>
          <Button asChild className="mt-6 w-full" size="lg">
            <Link href="/checkout">
              Proceed to checkout
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="ghost" className="mt-2 w-full">
            <Link href="/storefront">Continue shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
