'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Archive, ArchiveRestore, Pencil, Plus, Send, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { ProductImage } from '@/components/marketplace/product-image';
import { StatusBadge } from '@/components/marketplace/status-badge';
import {
  getApiErrorMessage,
  useDeleteMerchProductMutation,
  useGetMyMerchProductsQuery,
  useUpdateMerchProductMutation,
  useSubmitMerchForReviewMutation,
} from '@/services/api/marketplaceApi';
import {
  FULFILLMENT_LABEL,
  MERCH_STATUS,
  formatDate,
  formatProductPrice,
  titleCase,
} from '@/lib/marketplace/format';

export function SellerProducts({ storeBase }: { storeBase: string }) {
  const { toast } = useToast();
  const { data: products, isLoading } = useGetMyMerchProductsQuery();
  const [submit, { isLoading: submitting }] = useSubmitMerchForReviewMutation();
  const [remove] = useDeleteMerchProductMutation();
  const [setStatus] = useUpdateMerchProductMutation();
  const [filter, setFilter] = useState<string>('all');

  const STATUS_FILTERS = ['all', 'draft', 'pending_review', 'published', 'rejected', 'archived'];
  const visible = (products ?? []).filter((p) => filter === 'all' || p.status === filter);

  const fail = (err: unknown) =>
    toast({ title: 'Action failed', description: getApiErrorMessage(err), variant: 'destructive' });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1" role="group" aria-label="Filter by status">
          {STATUS_FILTERS.map((s) => (
            <Button
              key={s}
              size="sm"
              variant={filter === s ? 'default' : 'outline'}
              onClick={() => setFilter(s)}
            >
              {s === 'all' ? 'All' : MERCH_STATUS[s as keyof typeof MERCH_STATUS].label}
              {s !== 'all' && ` (${(products ?? []).filter((p) => p.status === s).length})`}
            </Button>
          ))}
        </div>
        <Button asChild>
          <Link href={`${storeBase}/products/new`}>
            <Plus className="mr-2 h-4 w-4" /> New product
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading products…</p>
      ) : !products?.length ? (
        <p className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
          You haven&apos;t created any products yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Variants</TableHead>
                <TableHead>Price (USD)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded border">
                        <ProductImage src={p.image_url} alt={p.title} />
                      </div>
                      <div>
                        <Link href={`${storeBase}/products/${p.id}`} className="font-medium hover:underline">
                          {p.title}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {p.artwork_title ? `Artwork: ${p.artwork_title}` : 'Standalone'}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {titleCase(p.base_product_type)}
                    <br />
                    {FULFILLMENT_LABEL[p.fulfillment_type]}
                  </TableCell>
                  <TableCell>{p.variant_count}</TableCell>
                  <TableCell>{formatProductPrice(p)}</TableCell>
                  <TableCell>
                    <StatusBadge map={MERCH_STATUS} status={p.status} />
                  </TableCell>
                  <TableCell className="text-sm">{formatDate(p.updated_at)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      {['draft', 'rejected'].includes(p.status) && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={submitting || p.variant_count === 0}
                          title={p.variant_count === 0 ? 'Add a variant first' : undefined}
                          onClick={() =>
                            submit(p.id)
                              .unwrap()
                              .then(() => toast({ title: 'Submitted for review' }))
                              .catch(fail)
                          }
                        >
                          <Send className="mr-1 h-3.5 w-3.5" /> Submit
                        </Button>
                      )}
                      {['draft', 'rejected', 'published'].includes(p.status) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          title="Take off the marketplace but keep order history"
                          onClick={() =>
                            setStatus({ id: p.id, status: 'archived' })
                              .unwrap()
                              .then(() => toast({ title: 'Product archived' }))
                              .catch(fail)
                          }
                        >
                          <Archive className="mr-1 h-3.5 w-3.5" /> Archive
                        </Button>
                      )}
                      {p.status === 'archived' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setStatus({ id: p.id, status: 'draft' })
                              .unwrap()
                              .then(() => toast({ title: 'Moved back to drafts' }))
                              .catch(fail)
                          }
                        >
                          <ArchiveRestore className="mr-1 h-3.5 w-3.5" /> Restore
                        </Button>
                      )}
                      <Button size="icon" variant="ghost" asChild aria-label={`Edit ${p.title}`}>
                        <Link href={`${storeBase}/products/${p.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive"
                        aria-label={`Delete ${p.title}`}
                        onClick={() => {
                          if (!window.confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
                          remove(p.id)
                            .unwrap()
                            .then(() => toast({ title: 'Product deleted' }))
                            .catch(fail);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
