import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,

  Eye,
  PencilSimple,
  Trash,
  ShieldCheck,
  Users
} from '@phosphor-icons/react';
import { Link } from "react-router-dom";

import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';

import {
  useGetAllBrandsQuery,
  useDeleteBrandMutation,
  useUpdateBrandMutation,
  useGetVerificationRequestsQuery,
  useApproveVerificationRequestMutation,
} from '../../services/api/brands';

import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

export const BrandsListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tab, setTab] = useState('all'); // 'all' | 'requests' | 'verified'
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, brand: null });

  const role = user?.role?.name;


  // Queries
  const { data, isLoading } = useGetAllBrandsQuery({});
  const { data: requests = [], isLoading: requestsLoading } = useGetVerificationRequestsQuery();

  const [deleteBrand] = useDeleteBrandMutation();
  const [updateBrand] = useUpdateBrandMutation();
  const [approveRequest] = useApproveVerificationRequestMutation();

  const brands = data?.brands ?? [];
  const verifiedBrands = brands.filter((b) => b.verification_request_id !== null);

  const toggleStatus = async (brand) => {
    const newStatus = brand.status === 'active' ? 'suspended' : 'active';
    try {
      await updateBrand({ id: brand.id, data: { status: newStatus } }).unwrap();
      toast.success(`Brand ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update brand status');
    }
  };

  const removeBrand = async (brand) => {
    if (!confirm('Delete this brand permanently?')) return;
    try {
      await deleteBrand(brand.id).unwrap();
      toast.success('Brand deleted successfully');
      setDeleteConfirm({ open: false, brand: null });
    } catch (err) {
      toast.error('Failed to delete brand');
    }
  };

  const handleApprove = async (requestId) => {
    try {
      await approveRequest({ requestId }).unwrap();
      toast.success('Verification request approved');
    } catch (err) {
      toast.error('Failed to approve request');
    }
  };

  const displayedBrands = tab === 'verified' ? verifiedBrands : brands;

  return (
    <div className="min-h-screen" data-testid="admin-brands-page">
      <Header
        title="Brands"
        subtitle={`${brands.length} total brands`}
      />

      <div className="p-4 sm:p-6 space-y-6">
        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex gap-2">
            <Button
              variant={tab === 'all' ? 'default' : 'outline'}
              onClick={() => setTab('all')}
            >
              All Brands
            </Button>
            <Button
              variant={tab === 'verified' ? 'default' : 'outline'}
              onClick={() => setTab('verified')}
            >
              Verified
            </Button>
            <Button
              variant={tab === 'requests' ? 'default' : 'outline'}
              onClick={() => setTab('requests')}
            >
              Verification Requests
            </Button>
          </div>

          <Button
            className="bg-white text-black hover:bg-zinc-200"
            onClick={() => navigate(`/brand/create`)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Brand
          </Button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tab === 'requests' ? (
          <VerificationRequestsSection
            requests={requests}
            loading={requestsLoading}
            onApprove={handleApprove}
          />
        ) : (
          <BrandsGrid
            brands={displayedBrands}
            navigate={navigate}
            toggleStatus={toggleStatus}
            onDelete={(brand) => setDeleteConfirm({ open: true, brand })}
          />
        )}
      </div>

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirm.open} onOpenChange={(open) => !open && setDeleteConfirm({ open: false, brand: null })}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Brand</DialogTitle>
          </DialogHeader>
          <p className="text-zinc-400">
            Are you sure you want to permanently delete <span className="text-white">{deleteConfirm.brand?.name}</span>?
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm({ open: false, brand: null })}
              className="border-zinc-700 text-zinc-300"
            >
              Cancel
            </Button>
            <Button
              onClick={() => removeBrand(deleteConfirm.brand)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Brand
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

/* ====================== Brands Grid ====================== */
const BrandsGrid = ({ brands, toggleStatus, onDelete, navigate }) => {
  if (brands.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center bg-zinc-900 border border-zinc-800 rounded-xl">

        <p className="text-zinc-400">No brands found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {brands.map((brand) => (
        <div
          key={brand.id}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-zinc-800 flex-shrink-0">
                {brand.logo_url ? (
                  <img
                    src={brand.logo_url}
                    alt={brand.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-zinc-500">
                    {brand.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>

              <div>
                <div className="font-semibold text-white flex items-center gap-2">
                  {brand.name}
                  {brand.verification_request_id && (
                    <Badge className="bg-blue-600 text-white text-xs">✓ Verified</Badge>
                  )}
                </div>
                <p className="text-sm text-zinc-500">@{brand.slug}</p>
              </div>
            </div>

            <Badge
              variant={
                brand.status === 'active' ? 'default' :
                  brand.status === 'pending' ? 'secondary' : 'destructive'
              }
              className="capitalize"
            >
              {brand.status}
            </Badge>
          </div>

          <div className="flex justify-between text-sm text-zinc-400 mb-6">
            <div>
              <p className="text-xs text-zinc-500">Followers</p>
              <p className="font-medium text-white">{brand.followers_count?.toLocaleString() || 0}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Views</p>
              <p className="font-medium text-white">{brand.views_count?.toLocaleString() || 0}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Joined</p>
              <p className="font-medium text-white">
                {new Date(brand.created_at).toLocaleDateString('en', { month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/brand/${brand.id}`)}
              className="text-zinc-300 hover:text-white hover:bg-zinc-800"
            >
              <Eye className="w-4 h-4 mr-1" />
              Stats
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/brand/${brand.id}/edit`)}
              className="text-zinc-300 hover:text-white hover:bg-zinc-800"
            >
              <PencilSimple className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-amber-400 hover:text-amber-300 hover:bg-zinc-800"
              onClick={() => toggleStatus(brand)}
            >
              <ShieldCheck className="w-4 h-4 mr-1" />
              {brand.status === 'active' ? 'Suspend' : 'Activate'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-400 hover:bg-zinc-800"
              onClick={() => onDelete(brand)}
            >
              <Trash className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

/* ====================== Verification Requests ====================== */

const VerificationRequestsSection = ({ requests = [], loading, onApprove }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!requests.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center bg-zinc-900 border border-zinc-800 rounded-xl">
        <Users weight="duotone" className="w-12 h-12 text-zinc-600 mb-4" />
        <p className="text-zinc-400">No verification requests</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((req) => (
        <div
          key={req.id}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
        >
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-white text-lg">
                {req.company_name}
              </h3>

              {/* Website */}
              {req.website && (
                <a
                  href={req.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-blue-400 hover:underline"
                >
                  {req.website}
                </a>
              )}
            </div>

            <span className="px-2 py-1 text-xs rounded bg-zinc-800 text-zinc-300">
              {req.status}
            </span>
          </div>

          {/* Documents */}
          {req.documents?.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-zinc-500 mb-1">Documents</p>
              <div className="flex flex-wrap gap-2">
                {req.documents.map((doc, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2 py-1 bg-zinc-800 text-zinc-300 rounded"
                  >
                    {doc}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {req.notes && (
            <p className="mt-3 text-sm text-zinc-400 border-l-2 border-zinc-700 pl-3">
              {req.notes}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-6 items-center">
            <button
              onClick={() => onApprove(req.id)}
              className="flex-1 bg-white text-black py-2 rounded-md"
            >
              Approve Verification
            </button>

            <button className="flex-1 border border-red-900 text-red-400 hover:bg-red-950 py-2 rounded-md">
              Reject
            </button>

            {/* Workflow Link */}
            <Link
              to={`/brand/${req.user_id}/verification-workflow`}
              className="flex-1 text-center border border-zinc-700 text-zinc-300 hover:bg-zinc-800 py-2 rounded-md"
            >
              View Workflow
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BrandsListPage;