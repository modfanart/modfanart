'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  useGetMyProductsQuery,
  useSubmitForReviewMutation,
  useDeleteProductMutation,
  useGetMySellerProfileQuery,
  useApplySellerMutation,
} from '@/services/api/merchApi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toaster';
import {
  Plus,
  Loader2,
  Send,
  Trash2,
  Package,
  Store,
} from 'lucide-react';
import { useState } from 'react';
import type { MerchStatus } from '@/services/types/merch';

const statusVariant: Record<
  MerchStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  draft: 'secondary',
  pending_review: 'outline',
  published: 'default',
  rejected: 'destructive',
  archived: 'secondary',
};

export default function SellerProductsPage() {
  const params = useParams();
  const sellerId = params.sellerId as string;
  const { toast } = useToast();

  const { data: profileData, isLoading: profileLoading } =
    useGetMySellerProfileQuery();
  const { data, isLoading, refetch } = useGetMyProductsQuery(undefined, {
    skip: !profileData?.profile || profileData.profile.status !== 'approved',
  });
  const [submitForReview, { isLoading: isSubmitting }] =
    useSubmitForReviewMutation();
  const [deleteProduct, { isLoading: isDeleting }] =
    useDeleteProductMutation();
  const [applySeller, { isLoading: isApplying }] = useApplySellerMutation();

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');

  const profile = profileData?.profile;
  const products = data?.products ?? [];

  const handleApply = async () => {
    if (!displayName.trim()) {
      toast({
        title: 'Display name required',
        variant: 'destructive',
      });
      return;
    }
    try {
      await applySeller({ display_name: displayName, bio }).unwrap();
      toast({ title: 'Application submitted' });
    } catch (err: any) {
      toast({
        title: 'Application failed',
        description: err?.data?.error || 'Try again',
        variant: 'destructive',
      });
    }
  };

  const handleSubmitReview = async (id: string) => {
    try {
      await submitForReview(id).unwrap();
      toast({ title: 'Submitted for review' });
      refetch();
    } catch (err: any) {
      toast({
        title: 'Submit failed',
        description: err?.data?.error,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try {
      await deleteProduct(id).unwrap();
      toast({ title: 'Product deleted' });
      refetch();
    } catch (err: any) {
      toast({
        title: 'Delete failed',
        description: err?.data?.error,
        variant: 'destructive',
      });
    }
  };

  if (profileLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Not a seller yet — show apply form
  if (!profile) {
    return (
      <div className="mx-auto max-w-lg space-y-6 p-6">
        <div className="flex items-center gap-3">
          <Store className="h-8 w-8" />
          <div>
            <h1 className="text-2xl font-bold">Become a seller</h1>
            <p className="text-sm text-muted-foreground">
              Apply to sell merch on the marketplace. Admins will review your
              application.
            </p>
          </div>
        </div>
        <div className="space-y-4 rounded-xl border p-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Display name
            </label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your shop name"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Bio</label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell buyers about you"
              rows={3}
            />
          </div>
          <Button onClick={handleApply} disabled={isApplying}>
            {isApplying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit application
          </Button>
        </div>
      </div>
    );
  }

  if (profile.status === 'pending') {
    return (
      <div className="mx-auto max-w-lg space-y-4 p-6 text-center">
        <Package className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Application pending</h1>
        <p className="text-muted-foreground">
          Your seller application is under review. You will be able to create
          products once approved.
        </p>
      </div>
    );
  }

  if (profile.status === 'rejected' || profile.status === 'suspended') {
    return (
      <div className="mx-auto max-w-lg space-y-4 p-6 text-center">
        <h1 className="text-2xl font-bold capitalize">
          Seller status: {profile.status}
        </h1>
        {profile.notes && (
          <p className="text-muted-foreground">{profile.notes}</p>
        )}
      </div>
    );
  }

  // Approved seller
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">My merch products</h1>
          <p className="text-sm text-muted-foreground">
            Manage drafts, submit for review, and track published items.
          </p>
        </div>
        <Button asChild>
          <Link href={`/seller/${sellerId}/products/new`}>
            <Plus className="mr-2 h-4 w-4" />
            New product
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center">
          <Package className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="font-medium">No products yet</p>
          <p className="mb-4 text-sm text-muted-foreground">
            Create your first merch product to start selling.
          </p>
          <Button asChild>
            <Link href={`/seller/${sellerId}/products/new`}>
              Create product
            </Link>
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Title</th>
                <th className="px-4 py-3 text-left font-medium">Type</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Updated</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">{p.title}</td>
                  <td className="px-4 py-3 capitalize">
                    {p.base_product_type.replace('_', ' ')}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant[p.status] ?? 'secondary'}>
                      {p.status.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(p.updated_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link
                          href={`/seller/${sellerId}/products/${p.id}/edit`}
                        >
                          Edit
                        </Link>
                      </Button>
                      {p.status === 'draft' && (
                        <Button
                          size="sm"
                          disabled={isSubmitting}
                          onClick={() => handleSubmitReview(p.id)}
                        >
                          <Send className="mr-1 h-3 w-3" />
                          Submit
                        </Button>
                      )}
                      {(p.status === 'draft' || p.status === 'rejected') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={isDeleting}
                          onClick={() => handleDelete(p.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
