'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { AddressForm, AddressSummary } from '@/components/marketplace/address-form';
import { PaymentForm } from '@/components/marketplace/payment-form';
import { ProductImage } from '@/components/marketplace/product-image';
import { RequireAuth } from '@/components/marketplace/require-auth';
import {
  useCheckoutCartMutation,
  useGetAddressesQuery,
  useGetCartQuery,
  type CartItem,
} from '@/services/api/marketplaceApi';
import { formatMoney, priceCents, titleCase } from '@/lib/marketplace/format';
import { cartItemProblem } from '@/lib/marketplace/cart';

function CheckoutContent() {
  const router = useRouter();

  const { data: cart, isLoading: cartLoading } = useGetCartQuery();
  const { data: addresses, isLoading: addressesLoading } = useGetAddressesQuery();
  const [checkout] = useCheckoutCartMutation();

  const [addressId, setAddressId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  // Creating the orders converts (empties) the cart server-side. Freeze what
  // was ordered at that moment so a declined card can be retried against the
  // same orders with the summary and amount still showing.
  const [snapshot, setSnapshot] = useState<{
    items: CartItem[];
    needsShipping: boolean;
  } | null>(null);

  const liveItems = cart?.items ?? [];
  const items = snapshot?.items ?? liveItems;
  const needsShipping =
    snapshot?.needsShipping ?? liveItems.some((i) => i.item_type === 'merch_variant');
  const subtotal = items.reduce(
    (sum, i) => sum + (priceCents(i) ?? 0) * i.quantity,
    0
  );
  const hasProblem = !snapshot && liveItems.some((i) => cartItemProblem(i));

  // Preselect the default (or only) address.
  useEffect(() => {
    if (addressId || !addresses?.length) return;
    setAddressId((addresses.find((a) => a.is_default) ?? addresses[0])!.id);
  }, [addresses, addressId]);

  if (cartLoading || addressesLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
        <h1 className="text-xl font-semibold">Your cart is empty</h1>
        <Button asChild>
          <Link href="/marketplace">Back to marketplace</Link>
        </Button>
      </div>
    );
  }

  const canPay = !hasProblem && (!needsShipping || Boolean(addressId));

  return (
    <div className="space-y-8">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/marketplace/cart">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to cart
        </Link>
      </Button>

      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Checkout</h1>
          <p className="mt-1 text-muted-foreground">Review your order and pay securely.</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {snapshot && (
            <p className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
              Your order has been created and is waiting for payment. Retry the payment below, or
              finish later from <Link href="/marketplace/orders" className="underline">your orders</Link>.
            </p>
          )}

          {needsShipping && !snapshot && (
            <section className="space-y-4 rounded-lg border bg-card p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <MapPin className="h-5 w-5" /> Shipping address
              </h2>

              {addresses && addresses.length > 0 && (
                <RadioGroup value={addressId ?? ''} onValueChange={setAddressId} className="gap-3">
                  {addresses.map((a) => (
                    <label
                      key={a.id}
                      htmlFor={`addr-${a.id}`}
                      className={`flex cursor-pointer items-start gap-3 rounded-md border p-4 ${
                        addressId === a.id ? 'border-primary bg-primary/5' : ''
                      }`}
                    >
                      <RadioGroupItem id={`addr-${a.id}`} value={a.id} className="mt-1" />
                      <div className="flex-1">
                        <AddressSummary address={a} />
                        {a.is_default && (
                          <span className="mt-1 inline-block text-xs text-muted-foreground">
                            Default
                          </span>
                        )}
                      </div>
                    </label>
                  ))}
                </RadioGroup>
              )}

              {adding || !addresses?.length ? (
                <div className="rounded-md border p-4">
                  <h3 className="mb-4 font-medium">New address</h3>
                  <AddressForm
                    onSaved={(a) => {
                      setAddressId(a.id);
                      setAdding(false);
                    }}
                    onCancel={addresses?.length ? () => setAdding(false) : undefined}
                  />
                </div>
              ) : (
                <Button variant="outline" onClick={() => setAdding(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Add a new address
                </Button>
              )}
            </section>
          )}

          <section className="space-y-4 rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold">Payment</h2>

            <PaymentForm
              disabled={!canPay}
              label={`Pay ${formatMoney(subtotal)}`}
              prepare={async () => {
                const orders = await checkout({
                  address_id: needsShipping ? addressId : null,
                }).unwrap();
                setSnapshot({ items: liveItems, needsShipping });
                return orders.map((o) => o.id);
              }}
              onPaid={(ids) => router.push(`/marketplace/checkout/success?orders=${ids.join(',')}`)}
            />

            {!canPay && (
              <p className="text-sm text-muted-foreground">
                {hasProblem
                  ? 'Fix the unavailable items in your cart first.'
                  : 'Choose or add a shipping address to continue.'}
              </p>
            )}
          </section>
        </div>

        <aside className="h-fit space-y-4 rounded-lg border p-6">
          <h2 className="text-lg font-semibold">Order summary</h2>

          <ul className="space-y-4">
            {items.map((i) => (
              <li key={i.id} className="flex gap-3">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded border">
                  <ProductImage src={i.image_url} alt={i.title ?? 'Item'} />
                </div>
                <div className="min-w-0 flex-1 text-sm">
                  <p className="truncate font-medium">{i.title}</p>
                  <p className="text-muted-foreground">
                    {i.item_type === 'license'
                      ? `${titleCase(i.license_type)} license`
                      : [i.size, i.color].filter(Boolean).join(' · ')}{' '}
                    × {i.quantity}
                  </p>
                </div>
                <span className="text-sm font-medium">
                  {formatMoney((priceCents(i) ?? 0) * i.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatMoney(subtotal)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <RequireAuth message="Sign in to check out.">
      <CheckoutContent />
    </RequireAuth>
  );
}
