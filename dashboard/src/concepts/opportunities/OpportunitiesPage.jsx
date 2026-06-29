'use client';

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Eye, PencilSimple, Trash, Plus } from '@phosphor-icons/react';

import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

import {
  useGetContestsQuery,
  useDeleteContestMutation,
  useUpdateContestMutation,
} from '../../services/api/contestsApi';

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'draft', label: 'Draft' },
  { value: 'live', label: 'Live' },
  { value: 'judging', label: 'Judging' },
  { value: 'completed', label: 'Completed' },
];

// -------------------- MAIN PAGE --------------------
export const OpportunitiesPage = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');

  const { data, isLoading } = useGetContestsQuery({ limit: 50 });
  const [deleteContest] = useDeleteContestMutation();
  const [updateContest] = useUpdateContestMutation();

  const contests = data?.contests ?? [];

  // -------------------- FILTER --------------------
  const opportunities = useMemo(() => {
    if (statusFilter === 'all') return contests;
    return contests.filter((c) => c.status === statusFilter);
  }, [contests, statusFilter]);

  // -------------------- HANDLERS --------------------
  const handleDelete = async (id) => {
    if (!confirm('Delete this contest?')) return;
    await deleteContest(id);
  };

  const handleStatusChange = async (id, status) => {
    await updateContest({ id, status });
  };

  return (
    <div className="min-h-screen">
      <Header
        title="Opportunities"
        subtitle={`${opportunities.length} opportunities`}
      />

      <div className="p-4 sm:p-6 space-y-6">
        {/* TOP ACTIONS */}
        <div className="flex justify-between items-center">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Updated: Navigate to full form page */}
          <Button onClick={() => navigate('/opportunity/add')}>
            <Plus className="w-4 h-4 mr-2" />
            Create Contest
          </Button>
        </div>

        {/* TABLE */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-md overflow-hidden">
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          ) : opportunities.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center">
              <Trophy className="w-10 h-10 text-zinc-600 mb-3" />
              <p className="text-zinc-400">No contests found</p>
            </div>
          ) : (
            <table className="data-table w-full">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {opportunities.map((contest) => (
                  <tr key={contest.id}>
                    <td className="text-white">{contest.title}</td>

                    {/* INLINE STATUS UPDATE */}
                    <td>
                      <Select
                        value={contest.status}
                        onValueChange={(val) => handleStatusChange(contest.id, val)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions
                            .filter((s) => s.value !== 'all')
                            .map((s) => (
                              <SelectItem key={s.value} value={s.value}>
                                {s.label}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </td>

                    <td className="text-zinc-500 text-sm">
                      {new Date(contest.created_at).toLocaleDateString()}
                    </td>

                    {/* ACTIONS */}
                    <td className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/opportunity/${contest.id}`)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>

                      {/* Updated: Navigate to Edit Form Page */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/opportunity/${contest.id}/edit`)}
                      >
                        <PencilSimple className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(contest.id)}
                      >
                        <Trash className="w-4 h-4 text-red-400" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default OpportunitiesPage;