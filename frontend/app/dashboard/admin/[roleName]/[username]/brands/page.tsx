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
import { DashboardShell } from '@/components/dashboard-shell';
import { useAuth } from '@/store/AuthContext';
import { Eye, Edit, Trash2, ShieldCheck, Plus } from 'lucide-react';

export default function AdminBrandsPage() {
  const { data, isLoading } = useGetAllBrandsQuery({});
  const brands = data?.brands ?? [];
  const { user } = useAuth();
  const role = user?.role?.name;
  let adminBase = '';
  if (role === 'Admin') {
    adminBase = `/dashboard/admin/${user?.role?.name}/${user?.username}`;
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
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <DashboardShell>
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Brand Administration</h1>

          <Button asChild>
            <Link href={`${adminBase}/brand/create`}>
              <Plus className="mr-2 h-4 w-4" />
              Add Brand
            </Link>
          </Button>
        </div>

        <div className="border rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left">Brand</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Followers</th>
                <th className="px-4 py-3 text-left">Views</th>
                <th className="px-4 py-3 text-left">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {brands.map((brand: Brand) => (
                <tr key={brand.id} className="border-t">
                  <td className="px-4 py-3 flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={brand.logo_url ?? undefined} />
                      <AvatarFallback>{brand.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>

                    <div>
                      <div className="font-medium">{brand.name}</div>
                      <div className="text-xs text-muted-foreground">{brand.slug}</div>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        brand.status === 'active'
                          ? 'default'
                          : brand.status === 'pending'
                            ? 'secondary'
                            : 'destructive'
                      }
                    >
                      {brand.status}
                    </Badge>
                  </td>

                  <td className="px-4 py-3">{formatNumber(brand.followers_count)}</td>

                  <td className="px-4 py-3">{formatNumber(brand.views_count)}</td>

                  <td className="px-4 py-3">{new Date(brand.created_at).toLocaleDateString()}</td>

                  <td className="px-4 py-3 text-right space-x-2">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/brand/${brand.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>

                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/admin/brands/${brand.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>

                    <Button size="sm" variant="outline" onClick={() => toggleStatus(brand)}>
                      <ShieldCheck className="h-4 w-4" />
                    </Button>

                    <Button size="sm" variant="destructive" onClick={() => removeBrand(brand.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
}
