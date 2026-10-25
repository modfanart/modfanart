'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  useGetCartQuery,
  useCheckoutMutation,
} from '@/services/api/cartApi';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toaster';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { data, isLoading } = useGetCartQuery();
  const [checkout, { isLoading: isCheckingOut }] = useCheckoutMutation();
  const [currency, setCurrency] = useState<'USD' | 'INR'>('USD');

  const cart = data?.cart;
  const items = cart?.items ?? [];

  const subtotalCents = items.reduce((sum, item) => {
    const unit =
      currency === 'INR'
        ? item.price_inr_cents ?? 0
        : item.price_usd_cents ?? 0;
    return sum + unit * item.quantity;
  }, 0);

  const formatMoney = (cents: number) =>
    new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency,
    }).format(cents / 100);

  const handleCheckout = async () => {
    try {
      const result = await checkout({ currency }).unwrap();
      toast({
        title: 'Order placed',
        description: `${result.orders?.length ?? 0} order(s) created.`,
      });
      router.push('/checkout/success');
    } catch (err: any) {
      toast({
        title: 'Checkout failed',
        description: err?.data?.error || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Your cart is empty.</p>
        <Button asChild>
          <Link href="/storefront">Browse marketplace</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Button variant="ghost" size="sm" className="mb-6" asChild>
        <Link href="/cart">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to cart
        </Link>
      </Button>

      <h1 className="mb-6 text-3xl font-bold tracking-tight">Checkout</h1>

      <div className="space-y-6 rounded-xl border p-6">
        <div>
          <h2 className="mb-3 text-lg font-semibold">Items</h2>
          <ul className="space-y-2 text-sm">
            {items.map((item) => {
              const title =
                item.title || item.merch_title || item.license_type || 'Item';
              const unit =
                currency === 'INR'
                  ? item.price_inr_cents ?? 0
                  : item.price_usd_cents ?? 0;
              return (
                <li key={item.id} className="flex justify-between">
                  <span>
                    {title} × {item.quantity}
                  </span>
                  <span className="font-medium">
                    {formatMoney(unit * item.quantity)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <Separator />

        <div>
          <label className="mb-1.5 block text-sm font-medium">Currency</label>
          <Select
            value={currency}
            onValueChange={(v) => setCurrency(v as 'USD' | 'INR')}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="INR">INR</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-between text-lg font-semibold">
          <span>Total</span>
          <span>{formatMoney(subtotalCents)}</span>
        </div>

        <p className="text-xs text-muted-foreground">
          Multi-seller carts create one order per seller. Payment confirmation
          follows via your payment provider.
        </p>

        <Button
          size="lg"
          className="w-full"
          onClick={handleCheckout}
          disabled={isCheckingOut}
        >
          {isCheckingOut && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Place order
        </Button>
      </div>
    </div>
  );
}
