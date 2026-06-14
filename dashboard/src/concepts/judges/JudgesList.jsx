// src/pages/judges/JudgesList.jsx

import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Plus, 
  MagnifyingGlass, 
  Gavel,
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

import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

export const JudgesList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { hasRole } = useAuth();

  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || 'all';

  const [updateUserStatus] = useUpdateUserStatusMutation();
  const [deleteUser] = useDeleteUserMutation();

  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, judge: null });
  const [suspendConfirm, setSuspendConfirm] = useState({ open: false, judge: null });

  // Permission check
// Permission check
const canManageJudges = hasRole([
  'SUPER_ADMIN',
  'ADMIN',
  'DEVELOPER'
]);

// Hooks must always run
const queryArgs = useMemo(() => ({
  roleSlug: 'JUDGE',
  page,
  limit: 15,
  ...(search.trim() && { search: search.trim() }),
  ...(status !== 'all' && { status }),
}), [page, search, status]);

const {
  data,
  isLoading,
  isFetching
} = useGetUsersByRoleSlugQuery(queryArgs, {
  skip: !canManageJudges,
});

// Safe conditional return AFTER hooks
if (!canManageJudges) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <div className="text-center">
        <p className="text-red-400 text-xl">Access Denied</p>
        <p className="text-zinc-500 mt-2">
          You don't have permission to manage judges.
        </p>
      </div>
    </div>
  );
}
  const judges = data?.users ?? [];
  const pagination = data?.pagination;

  const updateQuery = (updates) => {
    const params = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (!value) params.delete(key);
      else params.set(key, value);
    });

    if ('search' in updates || 'status' in updates) {
      params.set('page', '1');
    }

    setSearchParams(params, { replace: true });
  };

  const handleSuspend = async (judge) => {
    try {
      await updateUserStatus({ userId: judge.id, status: 'suspended' }).unwrap();
      toast.success(`@${judge.username} suspended`);
    } catch {
      toast.error('Failed');
    }
  };

  const handleDelete = async (judge) => {
    try {
      await deleteUser({ userId: judge.id }).unwrap();
      toast.success(`@${judge.username} deleted`);
    } catch {
      toast.error('Failed');
    }
  };

  const getInitials = (username) =>
    username ? username.slice(0, 2).toUpperCase() : '??';

  return (
    <div className="min-h-screen">
      <Header title="Judges" subtitle={`${judges.length} total judges`} />

      <div className="p-6 space-y-6">

        {/* Search */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              placeholder="Search judges..."
              value={search}
              onChange={(e) => updateQuery({ search: e.target.value })}
              className="pl-9 bg-zinc-900 border-zinc-800"
            />
          </div>

          <Button onClick={() => navigate('/judges/add')}>
            <Plus className="w-4 h-4 mr-2" />
            Add Judge
          </Button>
        </div>

        {/* Content */}
        {(isLoading || isFetching) ? (
          <div className="h-64 flex justify-center items-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent animate-spin rounded-full" />
          </div>
        ) : judges.length === 0 ? (
          <div className="h-64 flex flex-col justify-center items-center text-zinc-500">
            <Gavel className="w-12 h-12 mb-4" />
            No judges found
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {judges.map((judge) => (
              <div key={judge.id} className="bg-zinc-900 p-5 rounded-xl border border-zinc-800">

                {/* Header */}
                <div className="flex justify-between mb-4">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center">
                      {getInitials(judge.username)}
                    </div>
                    <div>
                      <p className="font-semibold">@{judge.username}</p>
                      <p className="text-xs text-zinc-500">{judge.email}</p>
                    </div>
                  </div>

                  <Badge>{judge.status}</Badge>
                </div>

                {/* Joined */}
                <div className="text-xs text-zinc-500 mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {judge.created_at
                    ? new Date(judge.created_at).toLocaleDateString()
                    : '—'}
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" onClick={() => navigate(`/judges/${judge.id}`)}>
                    View
                  </Button>
                  <Button size="sm" onClick={() => navigate(`/judges/${judge.id}/edit`)}>
                    <PencilSimple className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Button size="sm" onClick={() => handleSuspend(judge)}>
                    Suspend
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(judge)}>
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
          <div className="flex justify-center gap-4 mt-6">
            <Button
              disabled={!pagination.has_prev}
              onClick={() => updateQuery({ page: page - 1 })}
            >
              Prev
            </Button>

            <span className="text-sm">
              Page {pagination.page} / {pagination.total_pages}
            </span>

            <Button
              disabled={!pagination.has_next}
              onClick={() => updateQuery({ page: page + 1 })}
            >
              Next
            </Button>
          </div>
        )}

      </div>
    </div>
  );
};

export default JudgesList;