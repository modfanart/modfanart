'use client';

import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, MagnifyingGlass, Gavel, Trash } from '@phosphor-icons/react';

import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';

import {
  useGetUsersByRoleSlugQuery,
  useUpdateUserStatusMutation,
  useDeleteUserMutation,
  useCreateUserMutation,
  useUpdateUserMutation,
} from '../../services/api/userApi';

import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

import { UserFormModal } from '../../components/modals/UserFormModal';

export const JudgesList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { hasRole } = useAuth();

  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || 'all';

  const [updateUserStatus] = useUpdateUserStatusMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [createUser, { isLoading: creating }] = useCreateUserMutation();
  const [updateUser, { isLoading: updating }] = useUpdateUserMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedJudge, setSelectedJudge] = useState(null);

  const canManageJudges = hasRole(['SUPERADMIN', 'ADMIN', 'DEVELOPER']);

  // ---------------- QUERY ----------------
  const queryArgs = useMemo(() => {
    return {
      roleSlug: 'JUDGE',
      page,
      limit: 15,
      ...(search.trim() && { search: search.trim() }),
      ...(status !== 'all' && { status }),
    };
  }, [page, search, status]);

  const { data, isLoading, isFetching } = useGetUsersByRoleSlugQuery(
    queryArgs,
    { skip: !canManageJudges }
  );

  const judges = data?.users ?? [];
  const pagination = data?.pagination;

  // ---------------- HELPERS ----------------
  const updateQuery = (updates) => {
    const params = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === 'all') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    if ('search' in updates || 'status' in updates) {
      params.set('page', '1');
    }

    setSearchParams(params, { replace: true });
  };

  const getInitials = (username) =>
    username ? username.slice(0, 2).toUpperCase() : '??';

  const statusVariant = (status) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'suspended':
        return 'destructive';
      case 'pending_verification':
        return 'secondary';
      case 'deactivated':
        return 'outline';
      default:
        return 'outline';
    }
  };

  // ---------------- ACTIONS ----------------
  const handleSuspend = async (judge) => {
    try {
      await updateUserStatus({
        userId: judge.id,
        status: 'suspended',
      }).unwrap();

      toast.success(`@${judge.username} suspended`);
    } catch {
      toast.error('Failed to suspend judge');
    }
  };

  const handleDelete = async (judge) => {
    try {
      await deleteUser({ userId: judge.id }).unwrap();
      toast.success(`@${judge.username} deleted`);
    } catch {
      toast.error('Failed to delete judge');
    }
  };

  const openCreate = () => {
    setSelectedJudge(null);
    setModalOpen(true);
  };

  const openEdit = (judge) => {
    setSelectedJudge(judge);
    setModalOpen(true);
  };

  const handleSave = async (payload) => {
    try {
      if (selectedJudge) {
        await updateUser({
          userId: selectedJudge.id,
          ...payload,
        }).unwrap();
        toast.success('Judge updated successfully');
      } else {
        await createUser(payload).unwrap();
        toast.success('Judge created successfully');
      }

      setModalOpen(false);
    } catch (error) {
      toast.error(error?.data?.message || 'Operation failed');
    }
  };

  if (!canManageJudges) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <p className="text-red-400">Access Denied</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header
        title="Judges"
        subtitle={`${pagination?.total ?? judges.length} total judges`}
      />

      <div className="p-6 space-y-6">

        {/* SEARCH + ADD */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              placeholder="Search judges..."
              value={search}
              onChange={(e) =>
                updateQuery({ search: e.target.value || null })
              }
              className="pl-9 bg-zinc-900 border-zinc-800"
            />
          </div>

          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Add Judge
          </Button>
        </div>

        {/* LIST */}
        {isLoading || isFetching ? (
          <div className="h-64 flex justify-center items-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent animate-spin rounded-full" />
          </div>
        ) : judges.length === 0 ? (
          <div className="h-64 flex flex-col justify-center items-center text-zinc-500">
            <Gavel className="w-12 h-12 mb-4" />
            No judges found
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            {judges.map((judge) => (
              <div
                key={judge.id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all"
              >
                {/* HEADER */}
                <div className="flex justify-between items-start mb-5">

                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-semibold border border-zinc-700">
                      {getInitials(judge.username)}
                    </div>

                    <div>
                      <p className="font-semibold text-white">
                        @{judge.username}
                      </p>
                      <p className="text-sm text-zinc-500 truncate">
                        {judge.email}
                      </p>
                    </div>
                  </div>

                  <Badge
                    variant={statusVariant(judge.status)}
                    className="capitalize"
                  >
                    {judge.status?.replace(/_/g, ' ')}
                  </Badge>
                </div>

                {/* META */}
                <div className="flex items-center gap-2 text-xs text-zinc-500 mb-6">
                  <Gavel className="w-4 h-4" />
                  Judge Account
                </div>

                {/* ACTIONS ROW 1 */}
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/judge/${judge.id}`)}
                  >
                    View
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEdit(judge)}
                  >
                    Edit
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-amber-400 hover:text-amber-300"
                    onClick={() => handleSuspend(judge)}
                  >
                    Suspend
                  </Button>
                </div>

                {/* ACTIONS ROW 2 */}
                <div className="mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-red-500 hover:text-red-400"
                    onClick={() => handleDelete(judge)}
                  >
                    <Trash className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}

          </div>
        )}
      </div>

      {/* MODAL */}
      <UserFormModal
        open={modalOpen}
        user={selectedJudge}
        roles={[]}
        isLoading={creating || updating}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        defaultRole="JUDGE"
      />
    </div>
  );
};

export default JudgesList;