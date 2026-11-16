import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, MagnifyingGlass, Storefront, Trash, DotsThreeVertical, UserCircle } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useGetAllRolesQuery } from '../../services/api/rolesApi';
import { useGetUsersByRoleSlugQuery, useUpdateUserStatusMutation, useDeleteUserMutation, useCreateUserMutation, useUpdateUserMutation } from '../../services/api/userApi';
import { UserFormModal } from '../../components/modals/UserFormModal';
import { useAuth } from '../../contexts/AuthContext';

const ROLE_SLUG = 'SELLER';

export const SellersList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { hasRole } = useAuth();
  const canManage = hasRole(['SUPER_ADMIN', 'ADMIN', 'DEVELOPER']);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || 'all';
  const { data: rolesData = [] } = useGetAllRolesQuery();
  const roles = rolesData || [];
  const queryArgs = useMemo(() => ({
    roleSlug: ROLE_SLUG, page, limit: 15,
    ...(search.trim() && { search: search.trim() }),
    ...(status !== 'all' && { status }),
  }), [page, search, status]);
  const { data, isLoading, isFetching } = useGetUsersByRoleSlugQuery(queryArgs, { skip: !canManage });
  const [createUser, { isLoading: creating }] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [updateUserStatus] = useUpdateUserStatusMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, seller: null });
  const sellers = data?.users ?? [];
  const pagination = data?.pagination;

  const updateQuery = (updates) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '' || value === 'all') params.delete(key);
      else params.set(key, String(value));
    });
    if ('search' in updates || 'status' in updates) params.set('page', '1');
    setSearchParams(params, { replace: true });
  };

  const statusVariant = (value) => ({ active: 'default', suspended: 'destructive', pending_verification: 'secondary', deactivated: 'outline' }[value] || 'outline');
  const getInitials = (name) => (name ? String(name).slice(0, 2).toUpperCase() : '??');

  const handleSave = async (formData) => {
    try {
      if (selectedSeller) {
        await updateUser({ userId: selectedSeller.id, ...formData }).unwrap();
        toast.success('Seller updated');
      } else {
        await createUser({ ...formData, role: ROLE_SLUG }).unwrap();
        toast.success('Seller created');
      }
      setModalOpen(false); setSelectedSeller(null);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save seller');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.seller) return;
    try {
      await deleteUser({ userId: deleteConfirm.seller.id }).unwrap();
      toast.success('Seller deleted');
      setDeleteConfirm({ open: false, seller: null });
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete seller');
    }
  };

  const handleToggleStatus = async (seller) => {
    const next = seller.status === 'active' ? 'suspended' : 'active';
    try {
      await updateUserStatus({ userId: seller.id, status: next }).unwrap();
      toast.success(`Seller ${next === 'active' ? 'activated' : 'suspended'}`);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <Header title="Sellers" subtitle="Marketplace sellers and store operators" />
      <div className="p-4 sm:p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Storefront className="w-5 h-5 text-emerald-400" /> All Sellers
            </h2>
            <p className="text-sm text-zinc-500 mt-1">{pagination?.total ?? sellers.length} seller{(pagination?.total ?? sellers.length) !== 1 ? 's' : ''}{isFetching ? ' · refreshing…' : ''}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="relative w-full sm:w-72">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input type="search" placeholder="Search sellers..." value={search} onChange={(e) => updateQuery({ search: e.target.value })} className="pl-9 bg-zinc-900 border-zinc-800" />
            </div>
            <Select value={status} onValueChange={(v) => updateQuery({ status: v })}>
              <SelectTrigger className="w-full sm:w-40 bg-zinc-900 border-zinc-800"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700">
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="pending_verification">Pending</SelectItem>
                <SelectItem value="deactivated">Deactivated</SelectItem>
              </SelectContent>
            </Select>
            {canManage && (
              <Button onClick={() => { setSelectedSeller(null); setModalOpen(true); }}>
                <Plus className="mr-2 w-4 h-4" /> New Seller
              </Button>
            )}
          </div>
        </div>
        {!canManage ? (
          <div className="text-center py-16 text-zinc-500 border border-zinc-800 rounded-xl">You don’t have permission to view sellers.</div>
        ) : isLoading ? (
          <div className="text-center py-16 text-zinc-500">Loading sellers…</div>
        ) : sellers.length === 0 ? (
          <div className="text-center py-16 border border-zinc-800 rounded-xl bg-zinc-900/40">
            <Storefront className="w-12 h-12 mx-auto text-zinc-600 mb-3" />
            <p className="text-zinc-400">No sellers found</p>
          </div>
        ) : (
          <div className="rounded-xl border border-zinc-800 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-zinc-400">Seller</TableHead>
                  <TableHead className="text-zinc-400">Email</TableHead>
                  <TableHead className="text-zinc-400">Status</TableHead>
                  <TableHead className="text-zinc-400">Joined</TableHead>
                  <TableHead className="text-zinc-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sellers.map((seller) => (
                  <TableRow key={seller.id} className="border-zinc-800 hover:bg-zinc-900/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={seller.avatar_url || seller.photo_url} />
                          <AvatarFallback className="bg-zinc-800 text-zinc-300 text-xs">{getInitials(seller.username || seller.full_name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-white">{seller.full_name || seller.username || '—'}</p>
                          <p className="text-xs text-zinc-500">@{seller.username || 'user'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-zinc-400 text-sm">{seller.email || '—'}</TableCell>
                    <TableCell><Badge variant={statusVariant(seller.status)}>{(seller.status || 'unknown').replace(/_/g, ' ')}</Badge></TableCell>
                    <TableCell className="text-zinc-400 text-sm">{seller.created_at ? new Date(seller.created_at).toLocaleDateString() : '—'}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><DotsThreeVertical size={18} /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-700">
                          <DropdownMenuItem onClick={() => { setSelectedSeller(seller); setModalOpen(true); }}><UserCircle className="mr-2 w-4 h-4" />Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(seller)}>{seller.status === 'active' ? 'Suspend' : 'Activate'}</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-400 focus:text-red-300" onClick={() => setDeleteConfirm({ open: true, seller })}><Trash className="mr-2 w-4 h-4" />Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        {pagination && pagination.total_pages > 1 && (
          <div className="flex items-center justify-between text-sm text-zinc-400">
            <span>Page {pagination.page} of {pagination.total_pages}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={!pagination.has_prev} onClick={() => updateQuery({ page: page - 1 })}>Previous</Button>
              <Button variant="outline" size="sm" disabled={!pagination.has_next} onClick={() => updateQuery({ page: page + 1 })}>Next</Button>
            </div>
          </div>
        )}
      </div>
      <UserFormModal open={modalOpen} user={selectedSeller} roles={roles} onClose={() => { setModalOpen(false); setSelectedSeller(null); }} onSave={handleSave} isLoading={creating} />
      <Dialog open={deleteConfirm.open} onOpenChange={(open) => !open && setDeleteConfirm({ open: false, seller: null })}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader><DialogTitle className="text-white">Delete Seller</DialogTitle></DialogHeader>
          <p className="text-zinc-300">Delete <strong className="text-white">{deleteConfirm.seller?.username || deleteConfirm.seller?.email}</strong>?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm({ open: false, seller: null })}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SellersList;
