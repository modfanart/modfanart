'use client';

import { Package, Plus } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { useGetMyProductsQuery } from '@/services/api/merchApi';
import type { MerchProduct } from '@/services/mocks/seller.fixtures';

// Keys mirror the merch_products status CHECK constraint.
const STATUS_COLOR: Record<MerchProduct['status'], string> = {
  draft: 'bg-slate-100 text-slate-700 border-slate-300',
  pending_review: 'bg-blue-100 text-blue-800 border-blue-300',
  published: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  rejected: 'bg-red-100 text-red-800 border-red-300',
  suspended: 'bg-red-100 text-red-800 border-red-300',
  archived: 'bg-amber-100 text-amber-800 border-amber-300',
};

function formatInr(cents: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(cents / 100);
}

export function SellerProducts() {
  const { data: products = [], isLoading } = useGetMyProductsQuery();

  return (
    <div className="flex-1 space-y-6 p-6 pb-16">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground mt-1">Merch you sell across the marketplace</p>
        </div>
        <Button disabled title="Coming in a later phase">
          <Plus className="mr-2 h-4 w-4" />
          New product
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 border rounded-xl bg-muted/30">
          <Package className="mx-auto h-12 w-12 text-muted-foreground/70" />
          <h3 className="mt-4 text-lg font-medium">No products yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Once you create merch, it will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((product) => {
            // GET /merch/mine returns bare rows (no variants join), so only
            // summarise variants when the array is actually present.
            const variants = product.variants;
            const firstVariant = variants?.[0];
            return (
              <Card key={product.id} className="overflow-hidden border">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base line-clamp-2">{product.title}</CardTitle>
                    <Badge className={`${STATUS_COLOR[product.status]} capitalize shrink-0`}>
                      {product.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p className="capitalize">{product.base_product_type}</p>
                  {variants && (
                    <p>
                      {variants.length} variant{variants.length === 1 ? '' : 's'}
                      {firstVariant ? ` · from ${formatInr(firstVariant.price_inr_cents)}` : ''}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SellerProducts;
