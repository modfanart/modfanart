import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Plus, 
  MagnifyingGlass, 
  Palette,
  PencilSimple,
  Trash,
  Clock,
} from '@phosphor-icons/react';

import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import { 
  useGetUsersByRoleSlugQuery,  
  useUpdateUserStatusMutation, 
  useDeleteUserMutation 
} from '../../services/api/userApi';
import { UserFormModal } from '../../components/modals/UserFormModal'; // adjust path

import {
  useCreateUserMutation,
  useUpdateUserMutation,
} from '../../services/api/userApi';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

export const ArtistsList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user: currentUser, hasRole } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
const [selectedArtist, setSelectedArtist] = useState(null);

const [createUser, { isLoading: creating }] = useCreateUserMutation();
const [updateUser, { isLoading: updating }] = useUpdateUserMutation();
  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || 'all';

  const [updateUserStatus] = useUpdateUserStatusMutation();
  const [deleteUser] = useDeleteUserMutation();

  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, artist: null });
  const [suspendConfirm, setSuspendConfirm] = useState({ open: false, artist: null });

// Permission check
const canManageArtists = hasRole(['SUPER_ADMIN', 'ADMIN', 'DEVELOPER']);

// Hooks must ALWAYS run before any conditional return
const queryArgs = useMemo(() => ({
  roleSlug: 'ARTIST',
  page,
  limit: 15,
  ...(search.trim() && { search: search.trim() }),
  ...(status !== 'all' && { status }),
}), [page, search, status]);

const {
  data,
  isLoading,
  isFetching,
} = useGetUsersByRoleSlugQuery(queryArgs, {
  skip: !canManageArtists,
});

// Now it's safe to conditionally return
if (!canManageArtists) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <div className="text-center">
        <p className="text-red-400 text-xl">Access Denied</p>
        <p className="text-zinc-500 mt-2">
          You don't have permission to manage artists.
        </p>
      </div>
    </div>
  );
}
  const artists = data?.users ?? [];
  const pagination = data?.pagination;

  const updateQuery = (updates) => {
    const params = new URLSearchParams(searchParams);
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    // Reset to page 1 when searching or filtering
    if ('search' in updates || 'status' in updates) {
      params.set('page', '1');
    }

    setSearchParams(params, { replace: true });
  };

  const statusVariant = (status) => {
    switch (status) {
      case 'active': return 'default';
      case 'suspended': return 'destructive';
      case 'pending_verification': return 'secondary';
      case 'deactivated': return 'outline';
      default: return 'outline';
    }
  };

  const handleSuspend = async (artist) => {
    try {
      await updateUserStatus({ userId: artist.id, status: 'suspended' }).unwrap();
      toast.success(`@${artist.username} has been suspended`);
    } catch (error) {
      toast.error('Failed to suspend artist');
    }
  };

  const handleDelete = async (artist) => {
    try {
      await deleteUser({ userId: artist.id }).unwrap();
      toast.success(`@${artist.username} has been deleted`);
      setDeleteConfirm({ open: false, artist: null });
    } catch (error) {
      toast.error('Failed to delete artist');
    }
  };

  const getInitials = (username) => {
    return username ? username.slice(0, 2).toUpperCase() : '??';
  };
const openCreate = () => {
  setSelectedArtist(null);
  setModalOpen(true);
};
const handleSave = async (payload) => {
  if (selectedArtist) {
    await updateUser({
      userId: selectedArtist.id,
      ...payload,
    }).unwrap();
    toast.success('Artist updated');
  } else {
    await createUser(payload).unwrap();
    toast.success('Artist invited');
  }

  setModalOpen(false);
};
  return (
    <div className="min-h-screen" data-testid="artists-admin-page">
      <Header title="Artists" subtitle={`${artists.length} total artists`} />

      <div className="p-4 sm:p-6 space-y-6">
        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              placeholder="Search by username or email..."
              value={search}
              onChange={(e) => updateQuery({ search: e.target.value || null })}
              className="pl-9 bg-zinc-900 border-zinc-800"
            />
          </div>

          <div className="flex gap-3">
            <select
              value={status}
              onChange={(e) => updateQuery({ status: e.target.value })}
              className="bg-zinc-900 border border-zinc-800 text-white rounded-md px-3 py-2 text-sm focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="pending_verification">Pending Verification</option>
              <option value="deactivated">Deactivated</option>
            </select>

            <Button >
              <Plus className="w-4 h-4 mr-2" />
              Invite Artist
            </Button>
          </div>
        </div>

        {/* Loading / Empty / Grid */}
        {(isLoading || isFetching) ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        ) : artists.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center bg-zinc-900 border border-zinc-800 rounded-xl">
            <Palette weight="duotone" className="w-16 h-16 text-zinc-600 mb-4" />
            <p className="text-zinc-400 text-lg">No artists found</p>
            <Button 
              variant="outline" 
              className="mt-6"
          onClick={openCreate}
            >
              Invite First Artist
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {artists.map((artist) => (
              <div 
                key={artist.id} 
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all"
              >
                <div className="flex justify-between items-start mb-5">
                  <div className="flex items-center gap-3">
                    {artist.avatar_url ? (
                      <img
                        src={artist.avatar_url}
                        alt={artist.username}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-zinc-700"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-lg font-semibold border border-zinc-700">
                        {getInitials(artist.username)}
                      </div>
                    )}

                    <div>
                      <div 
                        onClick={() => navigate(`/artist/${artist.id}`)}
                        className="font-semibold text-white hover:underline cursor-pointer"
                      >
                        @{artist.username}
                      </div>
                      <p className="text-sm text-zinc-500 truncate">{artist.email}</p>
                    </div>
                  </div>

                  <Badge variant={statusVariant(artist.status)} className="capitalize">
                    {artist.status?.replace(/_/g, ' ')}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-xs text-zinc-500 mb-6">
                  <Clock className="w-4 h-4" />
                  Joined {artist.created_at 
                    ? new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' }).format(new Date(artist.created_at))
                    : '—'}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/artist/${artist.id}`)}
                  >
                    View Profile
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                 onClick={() => {
  setSelectedArtist(artist);
  setModalOpen(true);
}}
                  >
                    <PencilSimple className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-amber-400 hover:text-amber-300"
                    onClick={() => setSuspendConfirm({ open: true, artist })}
                  >
                    Suspend
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-400"
                    onClick={() => setDeleteConfirm({ open: true, artist })}
                  >
                    <Trash className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.total_pages > 1 && (
          <div className="flex justify-center gap-4 mt-8">
            <Button
              variant="outline"
              disabled={!pagination.has_prev}
              onClick={() => updateQuery({ page: page - 1 })}
            >
              Previous
            </Button>
            <span className="text-sm text-zinc-400 self-center">
              Page {pagination.page} of {pagination.total_pages}
            </span>
            <Button
              variant="outline"
              disabled={!pagination.has_next}
              onClick={() => updateQuery({ page: page + 1 })}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Delete & Suspend Dialogs */}
      {/* (Kept same as before - cleaned up slightly) */}
      <Dialog open={deleteConfirm.open} onOpenChange={() => setDeleteConfirm({ open: false, artist: null })}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle>Delete Artist</DialogTitle>
          </DialogHeader>
          <p className="text-zinc-400">
            Are you sure you want to permanently delete <strong>@{deleteConfirm.artist?.username}</strong>?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm({ open: false, artist: null })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => handleDelete(deleteConfirm.artist)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={suspendConfirm.open} onOpenChange={() => setSuspendConfirm({ open: false, artist: null })}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle>Suspend Artist</DialogTitle>
          </DialogHeader>
          <p className="text-zinc-400">
            Suspend <strong>@{suspendConfirm.artist?.username}</strong>?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendConfirm({ open: false, artist: null })}>
              Cancel
            </Button>
            <Button 
              className="bg-amber-600 hover:bg-amber-700" 
              onClick={() => {
                handleSuspend(suspendConfirm.artist);
                setSuspendConfirm({ open: false, artist: null });
              }}
            >
              Suspend
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <UserFormModal
  open={modalOpen}
  user={selectedArtist}
  roles={[]} // optionally pass ARTIST role only or fetch roles
  onClose={() => setModalOpen(false)}
  onSave={handleSave}
  isLoading={creating || updating}
/>
    </div>
  );
};

export default ArtistsList;