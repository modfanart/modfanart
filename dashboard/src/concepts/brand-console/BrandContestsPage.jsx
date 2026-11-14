import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Trophy,
  Users,
  ChartBar,
  PencilSimple,
  Eye,
} from '@phosphor-icons/react';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { useGetMyBrandsQuery } from '../../services/api/brandApi';
import {
  useGetContestsQuery,
  useDeleteContestMutation,
  useUpdateContestMutation,
} from '../../services/api/contestsApi';
import { toast } from 'sonner';

const statusOptions = [
  { value: 'all', label: 'All status' },
  { value: 'draft', label: 'Draft' },
  { value: 'live', label: 'Live' },
  { value: 'judging', label: 'Judging' },
  { value: 'completed', label: 'Completed' },
];

export default function BrandContestsPage() {
  const { brandId } = useParams();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: myBrandsData } = useGetMyBrandsQuery();
  const myBrands = Array.isArray(myBrandsData) ? myBrandsData : myBrandsData?.brands || [];
  const brand = myBrands.find((b) => b.id === brandId);

  const { data, isLoading, isError, refetch } = useGetContestsQuery(
    { brandId, limit: 100 },
    { skip: !brandId }
  );
  const contests = data?.contests || [];
  const [deleteContest] = useDeleteContestMutation();
  const [updateContest] = useUpdateContestMutation();

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return contests;
    return contests.filter((c) => c.status === statusFilter);
  }, [contests, statusFilter]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this contest?')) return;
    try {
      await deleteContest(id).unwrap();
      toast.success('Contest deleted');
    } catch {
      toast.error('Failed to delete contest');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateContest({ id, status }).unwrap();
      toast.success(`Status set to ${status}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="min-h-screen" data-testid="brand-contests-page">
      <Header
        title="Contests"
        subtitle={brand?.name ? `For ${brand.name}` : 'Brand contests'}
      />

      <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="text-zinc-400 hover:text-white w-fit"
            onClick={() => navigate(`/brand-console/${brandId}`)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Brand overview
          </Button>

          <div className="flex flex-wrap gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 bg-zinc-900 border-zinc-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white"
              onClick={() => navigate(`/brand-console/${brandId}/contests/new`)}
            >
              <Plus className="w-4 h-4 mr-2" />
              New contest
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-2 border-fuchsia-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : isError ? (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-center text-red-300">
            Failed to load contests.{' '}
            <button type="button" className="underline" onClick={() => refetch()}>
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-12 text-center">
            <Trophy weight="duotone" className="mx-auto w-12 h-12 text-zinc-600 mb-3" />
            <p className="text-zinc-400">No contests match this filter</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((c) => (
              <div
                key={c.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 sm:p-5"
                data-testid={`brand-contest-${c.id}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4 justify-between">
                  <div className="min-w-0">
                    <h3 className="font-medium text-white text-lg truncate">{c.title}</h3>
                    <p className="text-xs text-zinc-500 mt-1 capitalize">
                      {c.status} · {c.visibility}
                      {c.start_date
                        ? ` · starts ${new Date(c.start_date).toLocaleDateString()}`
                        : ''}
                    </p>
                    {c.description && (
                      <p className="text-sm text-zinc-400 mt-2 line-clamp-2">{c.description}</p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-zinc-700"
                      onClick={() =>
                        navigate(`/brand-console/${brandId}/contests/${c.id}`)
                      }
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Manage
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-zinc-700"
                      onClick={() => navigate(`/opportunity/${c.id}/entries`)}
                    >
                      <Users className="w-4 h-4 mr-1" />
                      Participants
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-zinc-700"
                      onClick={() => navigate(`/opportunity/${c.id}/leaderboard`)}
                    >
                      <ChartBar className="w-4 h-4 mr-1" />
                      Leaderboard
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-zinc-700"
                      onClick={() => navigate(`/opportunity/add`)}
                      title="Use form to edit via campaign routes if needed"
                      style={{ display: 'none' }}
                    >
                      <PencilSimple className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-zinc-800 pt-3">
                  <span className="text-xs text-zinc-500 mr-2">Set status:</span>
                  {['draft', 'live', 'judging', 'completed'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleStatusChange(c.id, s)}
                      className={`text-xs px-2.5 py-1 rounded-full capitalize border ${c.status === s
                          ? 'border-fuchsia-500/50 bg-fuchsia-500/15 text-fuchsia-300'
                          : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
                        }`}
                    >
                      {s}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleDelete(c.id)}
                    className="ml-auto text-xs text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
