'use client';

import { useState } from 'react';
import {
  useGetPublishedProductsQuery,
  useModerateProductMutation,
} from '@/services/api/merchApi';
// Note: for a full queue you would add a backend endpoint listing pending_review.
// Until then we show all products and allow moderate on pending ones when present.
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toaster';
import { Loader2, Check, X } from 'lucide-react';
import type { MerchProduct } from '@/services/types/merch';

export default function MerchModerationPage() {
  const { data, isLoading, refetch } = useGetPublishedProductsQuery();
  // In production add GET /merch?status=pending_review or dedicated admin list.
  // For now filter client-side if any pending sneak into published feed, or
  // extend merchApi with a moderation queue query once backend exposes it.
  const [moderate, { isLoading: isModerating }] = useModerateProductMutation();
  const { toast } = useToast();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<'all' | 'pending_review'>('all');

  const products = (data?.products ?? []).filter((p) =>
    filter === 'all' ? true : p.status === 'pending_review'
  );

  const handleModerate = async (
    product: MerchProduct,
    decision: 'approve' | 'reject'
  ) => {
    try {
      await moderate({
        id: product.id,
        data: {
          decision,
          notes: notes[product.id] || undefined,
        },
      }).unwrap();
      toast({
        title: decision === 'approve' ? 'Approved' : 'Rejected',
        description: product.title,
      });
      refetch();
    } catch (err: any) {
      toast({
        title: 'Moderation failed',
        description: err?.data?.error || 'Permission required: merch.moderate',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Merch moderation</h1>
        <p className="text-sm text-muted-foreground">
          Approve or reject products submitted for review. Requires{' '}
          <code className="text-xs">merch.moderate</code> permission.
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          All loaded
        </Button>
        <Button
          size="sm"
          variant={filter === 'pending_review' ? 'default' : 'outline'}
          onClick={() => setFilter('pending_review')}
        >
          Pending review
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : products.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          No products to show. Add a dedicated pending queue endpoint for full
          moderation workflow.
        </p>
      ) : (
        <div className="space-y-4">
          {products.map((p) => (
            <div
              key={p.id}
              className="rounded-xl border p-4 space-y-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{p.title}</h3>
                  <p className="text-sm text-muted-foreground capitalize">
                    {p.base_product_type.replace('_', ' ')} ·{' '}
                    {p.fulfillment_type.replace(/_/g, ' ')}
                  </p>
                </div>
                <Badge
                  variant={
                    p.status === 'published'
                      ? 'default'
                      : p.status === 'rejected'
                        ? 'destructive'
                        : 'secondary'
                  }
                >
                  {p.status.replace('_', ' ')}
                </Badge>
              </div>
              {p.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {p.description}
                </p>
              )}
              <Textarea
                placeholder="Moderation notes (optional)"
                value={notes[p.id] ?? ''}
                onChange={(e) =>
                  setNotes((prev) => ({ ...prev, [p.id]: e.target.value }))
                }
                rows={2}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  disabled={isModerating || p.status === 'published'}
                  onClick={() => handleModerate(p, 'approve')}
                >
                  <Check className="mr-1 h-4 w-4" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={isModerating || p.status === 'rejected'}
                  onClick={() => handleModerate(p, 'reject')}
                >
                  <X className="mr-1 h-4 w-4" />
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
