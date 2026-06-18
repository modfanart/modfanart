'use client';

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
import { Badge } from '../../components/ui/badge';

import {
  useGetUsersByRoleSlugQuery,
  useUpdateUserStatusMutation,
  useDeleteUserMutation,
  useCreateUserMutation,
  useUpdateUserMutation,
} from '../../services/api/userApi';
import {
  useGetAllRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useAssignRoleToUserMutation,
} from '@/services/api/rolesApi';

import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

// 👇 IMPORT YOUR MODAL
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

  // NEW
  const [createUser, { isLoading: creating }] = useCreateUserMutation();
  const [updateUser, { isLoading: updating }] = useUpdateUserMutation();

  // MODAL STATE
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedJudge, setSelectedJudge] = useState(null);

  const canManageJudges = hasRole(['SUPER_ADMIN', 'ADMIN', 'DEVELOPER']);

  const queryArgs = useMemo(() => ({
    roleSlug: 'JUDGE',
    page,
    limit: 15,
    ...(search.trim() && { search: search.trim() }),
    ...(status !== 'all' && { status }),
  }), [page, search, status]);

  const { data, isLoading, isFetching } = useGetAllRolesQuery(queryArgs, {
    skip: !canManageJudges,
  });

  if (!canManageJudges) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <p className="text-red-400">Access Denied</p>
      </div>
    );
  }

  const judges = data?.users ?? [];
  const roles = data ?? []; // 👈 assume API returns roles OR fetch separately

  // ---------------- QUERY ----------------
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

  // ---------------- ACTIONS ----------------
  const handleSuspend = async (judge) => {
    await updateUserStatus({ userId: judge.id, status: 'suspended' });
    toast.success(`@${judge.username} suspended`);
  };

  const handleDelete = async (judge) => {
    await deleteUser({ userId: judge.id });
    toast.success(`@${judge.username} deleted`);
  };

  // ---------------- MODAL HANDLERS ----------------
  const openCreate = () => {
    setSelectedJudge(null);
    setModalOpen(true);
  };

  const openEdit = (judge) => {
    setSelectedJudge(judge);
    setModalOpen(true);
  };

  const handleSave = async (payload) => {
    if (selectedJudge) {
      await updateUser(payload).unwrap();
    } else {
      await createUser(payload).unwrap();
    }
    setModalOpen(false);
  };

  return (
    <div className="min-h-screen">
      <Header title="Judges" subtitle={`${judges.length} total judges`} />

      <div className="p-6 space-y-6">

        {/* SEARCH + ADD */}
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

          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Add Judge
          </Button>
        </div>

        {/* LIST */}
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

                <div className="flex justify-between mb-4">
                  <div>
                    <p className="font-semibold">@{judge.username}</p>
                    <p className="text-xs text-zinc-500">{judge.email}</p>
                  </div>

                  <Badge>{judge.status}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={() => openEdit(judge)}>Edit</Button>
                  <Button onClick={() => handleSuspend(judge)}>Suspend</Button>
                </div>

                <div className="mt-2">
                  <Button
                    variant="destructive"
                    className="w-full"
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

      {/* ✅ MODAL */}
      <UserFormModal
        open={modalOpen}
        user={selectedJudge}
        roles={roles}
        isLoading={creating || updating}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
};

export default JudgesList;