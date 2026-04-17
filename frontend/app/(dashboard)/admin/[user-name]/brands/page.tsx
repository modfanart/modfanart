'use client';

import Link from 'next/link';
import { formatNumber } from '@/lib/formatNumber';
import {
  useGetAllBrandsQuery,
  useDeleteBrandMutation,
  useUpdateBrandMutation,
  Brand,
} from '@/services/api/brands';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/store/AuthContext';

import { Eye, Edit, Trash2, ShieldCheck, Plus, Building2 } from 'lucide-react';

export default function AdminBrandsPage() {
  const { data, isLoading } = useGetAllBrandsQuery({});
  const brands = data?.brands ?? [];

  const { user } = useAuth();
  const role = user?.role?.name;

  let adminBase = '';
  if (role === 'Admin') {
    adminBase = `/admin/${user?.role?.name}`;
  }

  const [deleteBrand] = useDeleteBrandMutation();
  const [updateBrand] = useUpdateBrandMutation();

  const toggleStatus = async (brand: Brand) => {
    const newStatus = brand.status === 'active' ? 'suspended' : 'active';

    await updateBrand({
      id: brand.id,
      data: { status: newStatus },
    });
  };

  const removeBrand = async (id: string) => {
    if (!confirm('Delete brand permanently?')) return;
    await deleteBrand(id);
  };

  if (isLoading) {
    return (
      <div className="container py-10">
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Brands</h1>
            <p className="text-sm text-muted-foreground">
              Manage platform brands, visibility and status
            </p>
          </div>
        </div>

        <Button asChild className="shadow-sm">
          <Link href={`${adminBase}/brand/create`}>
            <Plus className="mr-2 h-4 w-4" />
            Add Brand
          </Link>
        </Button>
      </div>

      {/* TABLE */}
      <div className="rounded-2xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Brand</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Followers</th>
              <th className="px-4 py-3 text-left font-medium">Views</th>
              <th className="px-4 py-3 text-left font-medium">Created</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>

          <tbody>
            {brands.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Building2 className="h-10 w-10 text-muted-foreground mb-3" />
                    <p className="font-medium">No brands found</p>
                    <p className="text-xs text-muted-foreground">Start by creating a new brand</p>
                  </div>
                </td>
              </tr>
            ) : (
              brands.map((brand: Brand) => (
                <tr key={brand.id} className="border-t hover:bg-muted/40 transition">
                  {/* BRAND */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 ring-2 ring-muted">
                        <AvatarImage src={brand.logo_url ?? undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {brand.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0">
                        <div className="font-medium truncate">{brand.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{brand.slug}</div>
                      </div>
                    </div>
                  </td>

                  {/* STATUS */}
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        brand.status === 'active'
                          ? 'default'
                          : brand.status === 'pending'
                            ? 'secondary'
                            : 'destructive'
                      }
                      className="capitalize"
                    >
                      {brand.status}
                    </Badge>
                  </td>

                  {/* FOLLOWERS */}
                  <td className="px-4 py-3 font-medium">{formatNumber(brand.followers_count)}</td>

                  {/* VIEWS */}
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatNumber(brand.views_count)}
                  </td>

                  {/* CREATED */}
                  <td className="px-4 py-3 text-muted-foreground text-sm">
                    {new Date(brand.created_at).toLocaleDateString()}
                  </td>

                  {/* ACTIONS */}
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button size="icon" variant="ghost" asChild>
                        <Link href={`${adminBase}/brand/${brand.id}/stats`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>

                      <Button size="icon" variant="ghost" asChild>
                        <Link href={`${adminBase}/brand/${brand.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>

                      <Button size="icon" variant="ghost" onClick={() => toggleStatus(brand)}>
                        <ShieldCheck className="h-4 w-4 text-yellow-500" />
                      </Button>

                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeBrand(brand.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
