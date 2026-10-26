'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Download, ExternalLink, Truck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { AddressSummary } from '@/components/marketplace/address-form';
import { PaymentForm } from '@/components/marketplace/payment-form';
import { ProductImage } from '@/components/marketplace/product-image';
import { RequireAuth } from '@/components/marketplace/require-auth';
import { ReviewDialog } from '@/components/marketplace/review-dialog';
import { StatusBadge } from '@/components/marketplace/status-badge';
import {
  getApiErrorMessage,
  useCancelOrderMutation,
  useGetOrderQuery,
} from '@/services/api/marketplaceApi';
import {
  FULFILLMENT_STATUS,
  ORDER_STATUS,
  formatDate,
  formatMoney,
  titleCase,
} from '@/lib/marketplace/format';

// Files generated server-side can be flagged "generation_failed" instead of a URL.
const isUrl = (v?: string | null) => Boolean(v && /^https?:\/\//.test(v));

function OrderContent({ id }: { id: string }) {
  const router = useRouter();
  const { toast } = useToast();

  // Poll while payment is still settling.
  const { data: order, isLoading, isError } = useGetOrderQuery(id, {
    pollingInterval: 0,
  });
  const [cancelOrder, { isLoading: cancelling }] = useCancelOrderMutation();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center">
        <h1 className="text-xl font-semibold">Order not found</h1>
        <Button asChild>
          <Link href="/marketplace/orders">Back to orders</Link>
        </Button>
      </div>
    );
  }

  const fulfilled = order.status === 'fulfilled';

  return (
    <div className="space-y-8">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/marketplace/orders">
          <ArrowLeft className="mr-2 h-4 w-4" /> All orders
        </Link>
      </Button>

      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold">{order.order_number}</h1>
            <StatusBadge map={ORDER_STATUS} status={order.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Placed {formatDate(order.created_at)}
            {order.paid_at && ` · Paid ${formatDate(order.paid_at)}`}
          </p>
        </div>
        {isUrl(order.invoice_pdf_url) && (
          <Button variant="outline" asChild>
            <a href={order.invoice_pdf_url!} target="_blank" rel="noopener noreferrer">
              <Download className="mr-2 h-4 w-4" /> Invoice {order.invoice_number}
            </a>
          </Button>
        )}
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <section className="rounded-lg border">
            <h2 className="border-b p-4 font-semibold">Items</h2>
            <ul className="divide-y">
              {order.items.map((item) => {
                const name = item.product_title || item.artwork_title || item.description;
                const canReview = fulfilled && !item.review_id;

                return (
                  <li key={item.id} className="flex gap-4 p-4">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md border">
                      <ProductImage src={item.image_url} alt={name ?? 'Item'} />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="font-medium">{name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.item_type === 'license'
                          ? `${titleCase(item.license_type)} license`
                          : [item.size, item.color, item.material].filter(Boolean).join(' · ')}
                        {' · '}Qty {item.quantity}
                        {item.seller_username && ` · Sold by ${item.seller_username}`}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {item.item_type === 'license' && isUrl(item.contract_pdf_url) && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={item.contract_pdf_url!} target="_blank" rel="noopener noreferrer">
                              <Download className="mr-1 h-3.5 w-3.5" /> License contract
                            </a>
                          </Button>
                        )}
                        {canReview && <ReviewDialog item={item} />}
                        {item.review_id && (
                          <span className="text-sm text-muted-foreground">
                            You rated this {item.review_rating}/5
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="font-medium">
                      {formatMoney(item.unit_price_cents * item.quantity, order.currency)}
                    </p>
                  </li>
                );
              })}
            </ul>
          </section>

          {order.fulfillments.length > 0 && (
            <section className="rounded-lg border">
              <h2 className="flex items-center gap-2 border-b p-4 font-semibold">
                <Truck className="h-4 w-4" /> Shipments
              </h2>
              <ul className="divide-y">
                {order.fulfillments.map((f) => (
                  <li key={f.id} className="space-y-2 p-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <StatusBadge map={FULFILLMENT_STATUS} status={f.status} />
                      {f.shipped_at && (
                        <span className="text-sm text-muted-foreground">
                          Shipped {formatDate(f.shipped_at)}
                        </span>
                      )}
                      {f.delivered_at && (
                        <span className="text-sm text-muted-foreground">
                          Delivered {formatDate(f.delivered_at)}
                        </span>
                      )}
                    </div>
                    {(f.carrier || f.tracking_number) && (
                      <p className="text-sm">
                        {f.carrier && <span className="font-medium">{f.carrier}</span>}
                        {f.tracking_number && <span> · {f.tracking_number}</span>}
                        {isUrl(f.tracking_url) && (
                          <a
                            href={f.tracking_url!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-3 inline-flex items-center gap-1 text-primary underline"
                          >
                            Track package <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {f.items?.map((i) => `${i.description} × ${i.quantity}`).join(', ')}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {order.status === 'pending' && (
            <section className="space-y-4 rounded-lg border p-6">
              <h2 className="font-semibold">Complete your payment</h2>
              <PaymentForm
                orderIds={[order.id]}
                label={`Pay ${formatMoney(order.total_cents, order.currency)}`}
                onPaid={() => router.refresh()}
              />
              <Button
                variant="ghost"
                className="text-destructive"
                disabled={cancelling}
                onClick={() =>
                  cancelOrder(order.id)
                    .unwrap()
                    .then(() => toast({ title: 'Order cancelled' }))
                    .catch((err) =>
                      toast({
                        title: "Couldn't cancel",
                        description: getApiErrorMessage(err),
                        variant: 'destructive',
                      })
                    )
                }
              >
                Cancel this order
              </Button>
            </section>
          )}
        </div>

        <aside className="h-fit space-y-4">
          <div className="space-y-3 rounded-lg border p-5 text-sm">
            <h2 className="text-base font-semibold">Summary</h2>
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatMoney(order.subtotal_cents, order.currency)}</span>
            </div>
            {order.tax_cents > 0 && (
              <div className="flex justify-between">
                <span>Tax</span>
                <span>{formatMoney(order.tax_cents, order.currency)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span>{formatMoney(order.total_cents, order.currency)}</span>
            </div>
          </div>

          {order.shipping_address && (
            <div className="space-y-2 rounded-lg border p-5">
              <h2 className="font-semibold">Shipping to</h2>
              <AddressSummary address={order.shipping_address} />
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <RequireAuth message="Sign in to view this order.">
      <OrderContent id={id} />
    </RequireAuth>
  );
}
