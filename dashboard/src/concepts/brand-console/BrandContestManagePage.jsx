import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Trophy,
  Users,
  ChartBar,
  UserPlus,
  X,
  MagnifyingGlass,
  PencilSimple,
} from '@phosphor-icons/react';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  useGetContestQuery,
  useGetContestJudgesQuery,
  useAssignJudgeMutation,
  useRemoveJudgeMutation,
  useGetContestEntriesQuery,
  useGetLeaderboardQuery,
  useUpdateContestMutation,
} from '../../services/api/contestsApi';
import { useGetAllUsersQuery } from '../../services/api/userApi';
import { toast } from 'sonner';

export default function BrandContestManagePage() {
  const { brandId, contestId } = useParams();
  const navigate = useNavigate();
  const [judgeModalOpen, setJudgeModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: contestData, isLoading, isError } = useGetContestQuery(contestId, {
    skip: !contestId,
  });
  const contest = contestData?.contest || contestData;

  const { data: judgesData, refetch: refetchJudges } = useGetContestJudgesQuery(contestId, {
    skip: !contestId,
  });
  const judges = judgesData?.judges || judgesData || [];

  const { data: entriesData } = useGetContestEntriesQuery({ contestId }, { skip: !contestId });
  const entries = entriesData?.entries || entriesData || [];

  const { data: boardData } = useGetLeaderboardQuery(contestId, { skip: !contestId });
  const leaderboard = boardData?.leaderboard || boardData?.entries || boardData || [];

  const [assignJudge, { isLoading: assigning }] = useAssignJudgeMutation();
  const [removeJudge] = useRemoveJudgeMutation();
  const [updateContest] = useUpdateContestMutation();

  const { data: usersData, isLoading: usersLoading } = useGetAllUsersQuery(
    { search: searchTerm.trim() },
    { skip: searchTerm.trim().length < 2 }
  );
  const users = usersData?.users || [];

  const handleAssign = async (userId) => {
    try {
      await assignJudge({ contestId, userId }).unwrap();
      toast.success('Judge assigned');
      refetchJudges();
      setJudgeModalOpen(false);
      setSearchTerm('');
    } catch (err) {
      toast.error(err?.data?.error || 'Failed to assign judge');
    }
  };

  const handleRemoveJudge = async (judgeId) => {
    if (!confirm('Remove this judge?')) return;
    try {
      await removeJudge({ contestId, judgeId }).unwrap();
      toast.success('Judge removed');
      refetchJudges();
    } catch {
      toast.error('Failed to remove judge');
    }
  };

  const handleStatus = async (status) => {
    try {
      await updateContest({ id: contestId, status }).unwrap();
      toast.success(`Status → ${status}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-fuchsia-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError || !contest?.id) {
    return (
      <div className="min-h-screen p-6">
        <Button variant="ghost" onClick={() => navigate(`/brand-console/${brandId}/contests`)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 p-8 text-center text-red-300">
          Contest not found
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" data-testid="brand-contest-manage">
      <Header title={contest.title} subtitle="Contest management · Brand Console" />

      <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-8">
        <div className="flex flex-wrap gap-2 items-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-zinc-400 hover:text-white"
            onClick={() => navigate(`/brand-console/${brandId}/contests`)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            All contests
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-zinc-700"
            onClick={() =>
              navigate(`/brand-console/${brandId}/contests/${contestId}/edit`)
            }
          >
            <PencilSimple className="w-4 h-4 mr-1" />
            Edit details
          </Button>
        </div>

        {/* Summary */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-3">
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300 capitalize">
              {contest.status}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300 capitalize">
              {contest.visibility}
            </span>
          </div>
          {contest.description && (
            <p className="text-sm text-zinc-400">{contest.description}</p>
          )}
          <div className="flex flex-wrap gap-2 pt-2">
            <span className="text-xs text-zinc-500 self-center">Status:</span>
            {['draft', 'live', 'judging', 'completed'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleStatus(s)}
                className={`text-xs px-2.5 py-1 rounded-full capitalize border ${contest.status === s
                    ? 'border-fuchsia-500/50 bg-fuchsia-500/15 text-fuchsia-300'
                    : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
                  }`}
              >
                {s}
              </button>
            ))}
          </div>
        </section>

        {/* Quick links */}
        <section className="grid sm:grid-cols-3 gap-3">
          <Link
            to={`/opportunity/${contestId}/entries`}
            className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 hover:border-fuchsia-500/30"
          >
            <Users className="w-6 h-6 text-fuchsia-400 mb-2" />
            <p className="font-medium text-white">Participants</p>
            <p className="text-xs text-zinc-500 mt-1">
              {Array.isArray(entries) ? `${entries.length} entries` : 'View entries'}
            </p>
          </Link>
          <Link
            to={`/opportunity/${contestId}/leaderboard`}
            className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 hover:border-fuchsia-500/30"
          >
            <ChartBar className="w-6 h-6 text-fuchsia-400 mb-2" />
            <p className="font-medium text-white">Leaderboard</p>
            <p className="text-xs text-zinc-500 mt-1">
              {Array.isArray(leaderboard)
                ? `${leaderboard.length} ranked`
                : 'Scores & ranks'}
            </p>
          </Link>
          <button
            type="button"
            onClick={() => setJudgeModalOpen(true)}
            className="text-left rounded-xl border border-zinc-800 bg-zinc-900 p-4 hover:border-fuchsia-500/30"
          >
            <UserPlus className="w-6 h-6 text-fuchsia-400 mb-2" />
            <p className="font-medium text-white">Assign judge</p>
            <p className="text-xs text-zinc-500 mt-1">Invite someone to score entries</p>
          </button>
        </section>

        {/* Judges */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-fuchsia-400" />
              Judges
            </h3>
            <Button
              size="sm"
              className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white"
              onClick={() => setJudgeModalOpen(true)}
            >
              <UserPlus className="w-4 h-4 mr-1" />
              Assign
            </Button>
          </div>

          {!Array.isArray(judges) || judges.length === 0 ? (
            <div className="rounded-lg border border-dashed border-zinc-700 p-8 text-center text-zinc-500 text-sm">
              No judges assigned yet
            </div>
          ) : (
            <ul className="space-y-2">
              {judges.map((j) => {
                const id = j.id || j.judge_id || j.user_id;
                const name =
                  j.username || j.email || j.user?.username || j.user?.email || id;
                const status = j.status || j.invitation_status || 'assigned';
                return (
                  <li
                    key={id}
                    className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm text-white">{name}</p>
                      <p className="text-xs text-zinc-500 capitalize">{status}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveJudge(id)}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {/* Assign judge modal */}
      {judgeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl border border-zinc-700 bg-zinc-900 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
              <h4 className="font-medium text-white">Assign judge</h4>
              <button
                type="button"
                onClick={() => setJudgeModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="relative">
                <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input
                  className="pl-9 bg-zinc-950 border-zinc-800"
                  placeholder="Search users (min 2 chars)…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="max-h-64 overflow-y-auto space-y-1">
                {searchTerm.trim().length < 2 ? (
                  <p className="text-xs text-zinc-500 text-center py-6">
                    Type at least 2 characters to search
                  </p>
                ) : usersLoading ? (
                  <p className="text-xs text-zinc-500 text-center py-6">Searching…</p>
                ) : users.length === 0 ? (
                  <p className="text-xs text-zinc-500 text-center py-6">No users found</p>
                ) : (
                  users.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      disabled={assigning}
                      onClick={() => handleAssign(u.id)}
                      className="w-full text-left rounded-lg px-3 py-2 hover:bg-zinc-800 text-sm text-white"
                    >
                      {u.username || u.email}
                      {u.email && u.username ? (
                        <span className="text-zinc-500 text-xs ml-2">{u.email}</span>
                      ) : null}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
