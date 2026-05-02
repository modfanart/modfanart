'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatNumber } from '@/lib/formatNumber';

import {
  useGetAllBrandsQuery,
  useDeleteBrandMutation,
  useUpdateBrandMutation,
  useGetVerificationRequestsQuery,
  useApproveVerificationRequestMutation,
  Brand,
} from '@/services/api/brands';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/store/AuthContext';

import { Eye, Edit, Trash2, ShieldCheck, Plus, Building2 } from 'lucide-react';

/* =========================================================
   MAIN PAGE
========================================================= */

export default function AdminBrandsPage() {
  const { data, isLoading } = useGetAllBrandsQuery({});
  const brands = data?.brands ?? [];

  const { data: requests = [], isLoading: requestsLoading } = useGetVerificationRequestsQuery();

  const { user } = useAuth();
  const role = user?.role?.name;

  let adminBase = '';
  if (role === 'admin' || role === 'super_admin' || role === 'developer') {
    adminBase = `/admin/${user?.role?.name}`;
  }

  const [tab, setTab] = useState<'all' | 'requests' | 'verified'>('all');

  const [deleteBrand] = useDeleteBrandMutation();
  const [updateBrand] = useUpdateBrandMutation();
  const [approveRequest] = useApproveVerificationRequestMutation();

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

  const verifiedBrands = brands.filter((b) => b.verification_request_id !== null);

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
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Brands</h1>
            <p className="text-sm text-muted-foreground">Manage platform brands & verification</p>
          </div>
        </div>

        <Button asChild>
          <Link href={`${adminBase}/brand/create`}>
            <Plus className="mr-2 h-4 w-4" />
            Add Brand
          </Link>
        </Button>
      </div>

      {/* TABS */}
      <div className="flex gap-2 mb-6">
        <Button variant={tab === 'all' ? 'default' : 'outline'} onClick={() => setTab('all')}>
          All Brands
        </Button>

        <Button
          variant={tab === 'requests' ? 'default' : 'outline'}
          onClick={() => setTab('requests')}
        >
          Verification Requests
        </Button>

        <Button
          variant={tab === 'verified' ? 'default' : 'outline'}
          onClick={() => setTab('verified')}
        >
          Verified Brands
        </Button>
      </div>

      {/* CONTENT */}
      {tab === 'all' && (
        <BrandsTable
          brands={brands}
          adminBase={adminBase}
          toggleStatus={toggleStatus}
          removeBrand={removeBrand}
        />
      )}

      {tab === 'verified' && (
        <BrandsTable
          brands={verifiedBrands}
          adminBase={adminBase}
          toggleStatus={toggleStatus}
          removeBrand={removeBrand}
        />
      )}

      {tab === 'requests' && (
        <VerificationRequests
          requests={requests}
          loading={requestsLoading}
          onApprove={approveRequest}
        />
      )}
    </div>
  );
}

/* =========================================================
   TABLE COMPONENT
========================================================= */

function BrandsTable({
  brands,
  adminBase,
  toggleStatus,
  removeBrand,
}: {
  brands: Brand[];
  adminBase: string;
  toggleStatus: (brand: Brand) => void;
  removeBrand: (id: string) => void;
}) {
  return (
    <div className="rounded-2xl border shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
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
          {brands.length === 0 ? (
            <tr>
              <td colSpan={6}>
                <div className="py-16 text-center">
                  <Building2 className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                  No brands found
                </div>
              </td>
            </tr>
          ) : (
            brands.map((brand) => (
              <tr key={brand.id} className="border-t hover:bg-muted/40">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={brand.logo_url ?? undefined} />
                      <AvatarFallback>{brand.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>

                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {brand.name}

                        {brand.verification_request_id && (
                          <Badge className="bg-blue-500 text-white text-xs">Verified</Badge>
                        )}
                      </div>

                      <div className="text-xs text-muted-foreground">{brand.slug}</div>
                    </div>
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

                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(brand.created_at).toLocaleDateString()}
                </td>

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

                    <Button size="icon" variant="ghost" onClick={() => removeBrand(brand.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

/* =========================================================
   VERIFICATION REQUESTS
========================================================= */

function VerificationRequests({
  requests,
  loading,
  onApprove,
}: {
  requests: any[];
  loading: boolean;
  onApprove: any;
}) {
  if (loading) {
    return <Skeleton className="h-64 w-full rounded-xl" />;
  }

  if (requests.length === 0) {
    return <div className="text-center py-16">No verification requests</div>;
  }

  return (
    <div className="space-y-4">
      {requests.map((req) => (
        <div key={req.id} className="border rounded-xl p-4">
          <div className="font-semibold">{req.company_name}</div>

          <div className="text-sm text-muted-foreground">{req.contact_email}</div>

          <div className="mt-2">
            <Badge>{req.status}</Badge>
          </div>

          <div className="flex gap-2 mt-4">
            <Button size="sm" onClick={() => onApprove({ requestId: req.id })}>
              Approve
            </Button>

            <Button size="sm" variant="destructive">
              Reject
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
