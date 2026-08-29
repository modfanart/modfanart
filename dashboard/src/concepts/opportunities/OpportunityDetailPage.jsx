import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Trophy,
  Users,
  Calendar,
  UserPlus,
  X,
  MagnifyingGlass,
} from '@phosphor-icons/react';

import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

import {
  useGetContestQuery,
  useGetContestJudgesQuery,
  useAssignJudgeMutation,
  useRemoveJudgeMutation,
} from '../../services/api/contestsApi';

import { useGetAllUsersQuery } from '../../services/api/userApi';

/* ============================================================
   STATUS BADGE
============================================================ */

const StatusBadge = ({ status }) => {
  const statusClasses = {
    draft: 'status-pending',
    live: 'status-in_progress',
    judging: 'status-ready',
    completed: 'status-completed',
  };

  const formattedStatus = status
    ? status.replace(/_/g, ' ')
    : 'Unknown';

  return (
    <span
      className={`badge ${statusClasses[status] || 'border-zinc-700 text-zinc-400'
        } capitalize`}
    >
      {formattedStatus}
    </span>
  );
};

/* ============================================================
   ASSIGN JUDGE MODAL
============================================================ */

const AssignJudgeModal = ({
  isOpen,
  onClose,
  onJudgeAssigned,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [assigningId, setAssigningId] = useState(null);

  const {
    data: usersData,
    isLoading: usersLoading,
  } = useGetAllUsersQuery(
    {
      search: searchTerm.trim(),
    },
    {
      skip: searchTerm.trim().length < 2,
    }
  );

  const users = usersData?.users || [];

  const handleAssign = async (userId) => {
    setAssigningId(userId);

    try {
      await onJudgeAssigned(userId);
      setSearchTerm('');
    } catch (error) {
      console.error('Failed to assign judge:', error);
    } finally {
      setAssigningId(null);
    }
  };

  const handleClose = () => {
    if (assigningId) return;

    setSearchTerm('');
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 p-5">
          <h2 className="text-xl font-semibold text-white">
            Assign Judge
          </h2>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={Boolean(assigningId)}
            className="text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Search */}
        <div className="p-5">
          <div className="relative mb-4">
            <MagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

            <Input
              placeholder="Search users by name or username..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="border-zinc-800 bg-zinc-950 pl-10 text-white placeholder:text-zinc-600"
              autoFocus
            />
          </div>

          {/* Results */}
          <div className="max-h-80 overflow-y-auto">
            {usersLoading && searchTerm.trim().length >= 2 && (
              <div className="py-10 text-center">
                <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <p className="text-sm text-zinc-500">
                  Searching...
                </p>
              </div>
            )}

            {!usersLoading && users.length > 0 && (
              <div className="space-y-1">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between rounded-lg border border-transparent p-3 transition-colors hover:border-zinc-800 hover:bg-zinc-800"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">
                        {user.name ||
                          user.full_name ||
                          user.username ||
                          'Unnamed User'}
                      </p>

                      <p className="mt-1 truncate text-xs text-zinc-500">
                        {user.username
                          ? `@${user.username}`
                          : user.email || 'No username'}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleAssign(user.id)}
                      disabled={assigningId !== null}
                      className="ml-3"
                    >
                      {assigningId === user.id
                        ? 'Assigning...'
                        : 'Assign'}
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {!usersLoading &&
              searchTerm.trim().length >= 2 &&
              users.length === 0 && (
                <div className="py-12 text-center">
                  <Users className="mx-auto mb-3 h-8 w-8 text-zinc-700" />

                  <p className="text-sm text-zinc-500">
                    No users found
                  </p>
                </div>
              )}

            {searchTerm.trim().length < 2 && (
              <div className="py-12 text-center">
                <MagnifyingGlass className="mx-auto mb-3 h-8 w-8 text-zinc-700" />

                <p className="text-sm text-zinc-500">
                  Type at least 2 characters to search users
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================
   MAIN PAGE
============================================================ */

const OpportunityDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [contest, setContest] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);

  /* ----------------------------------------------------------
     CONTEST
  ---------------------------------------------------------- */

  const {
    data,
    isLoading,
    isError,
    error,
  } = useGetContestQuery(id, {
    skip: !id,
  });

  /* ----------------------------------------------------------
     JUDGES
  ---------------------------------------------------------- */

  const {
    data: judgesData,
    isLoading: judgesLoading,
  } = useGetContestJudgesQuery(id, {
    skip: !id,
  });

  /* ----------------------------------------------------------
     MUTATIONS
  ---------------------------------------------------------- */

  const [assignJudge, { isLoading: isAssigningJudge }] =
    useAssignJudgeMutation();

  const [removeJudge, { isLoading: isRemovingJudge }] =
    useRemoveJudgeMutation();

  const judges = judgesData?.judges || [];

  /* ----------------------------------------------------------
     SYNC CONTEST DATA
  ---------------------------------------------------------- */

  useEffect(() => {
    if (data?.contest) {
      setContest(data.contest);
      return;
    }

    if (data) {
      setContest(data);
    }
  }, [data]);

  /* ----------------------------------------------------------
     ERROR HANDLING
  ---------------------------------------------------------- */

  useEffect(() => {
    if (isError || error) {
      toast.error(
        error?.data?.message ||
        error?.data?.detail ||
        'Failed to load opportunity'
      );

      navigate('/opportunities', {
        replace: true,
      });
    }
  }, [isError, error, navigate]);

  /* ----------------------------------------------------------
     ORGANIZER CHECK
  ---------------------------------------------------------- */

  const isOrganizer =
    contest?.created_by === user?.id ||
    contest?.organizer_id === user?.id ||
    contest?.user_id === user?.id;

  /* ----------------------------------------------------------
     ASSIGN JUDGE
  ---------------------------------------------------------- */

  const handleAssignJudge = async (userId) => {
    if (!id || !userId) {
      toast.error('Invalid contest or user');
      return;
    }

    try {
      await assignJudge({
        contestId: id,
        userId,
      }).unwrap();

      toast.success('Judge assigned successfully');

      setShowAssignModal(false);
    } catch (err) {
      toast.error(
        err?.data?.message ||
        err?.data?.detail ||
        'Failed to assign judge'
      );

      throw err;
    }
  };

  /* ----------------------------------------------------------
     REMOVE JUDGE
  ---------------------------------------------------------- */

  const handleRemoveJudge = async (judgeId) => {
    if (!id || !judgeId) {
      toast.error('Invalid contest or judge');
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to remove this judge?'
    );

    if (!confirmed) {
      return;
    }

    try {
      await removeJudge({
        contestId: id,
        judgeId,
      }).unwrap();

      toast.success('Judge removed successfully');
    } catch (err) {
      toast.error(
        err?.data?.message ||
        err?.data?.detail ||
        'Failed to remove judge'
      );
    }
  };

  /* ----------------------------------------------------------
     DATE FORMATTER
  ---------------------------------------------------------- */

  const formatDate = (value) => {
    if (!value) {
      return 'N/A';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return 'N/A';
    }

    return date.toLocaleString();
  };

  /* ----------------------------------------------------------
     LOADING
  ---------------------------------------------------------- */

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white border-t-transparent" />
      </div>
    );
  }

  /* ----------------------------------------------------------
     NO CONTEST
  ---------------------------------------------------------- */

  if (!contest) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-zinc-400">
          Opportunity not found
        </p>

        <Button
          variant="outline"
          onClick={() => navigate('/opportunities')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Opportunities
        </Button>
      </div>
    );
  }

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div
      className="min-h-screen"
      data-testid="opportunity-detail-page"
    >
      <Header
        title={contest.title || 'Opportunity'}
        subtitle="Opportunity Details"
      />

      <div className="p-4 sm:p-6">
        {/* Back */}
        <Button
          variant="ghost"
          className="mb-6 text-zinc-400 hover:bg-zinc-800 hover:text-white"
          onClick={() => navigate('/opportunities')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Opportunities
        </Button>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* ==================================================
              LEFT CONTENT
          ================================================== */}

          <div className="space-y-6 lg:col-span-2">
            {/* Overview */}
            <div className="rounded-md border border-zinc-800 bg-zinc-900 p-5">
              <div className="mb-4 flex items-center justify-between gap-4">
                <h3 className="text-lg font-semibold text-white">
                  Overview
                </h3>

                <StatusBadge status={contest.status} />
              </div>

              <p className="text-sm leading-relaxed text-zinc-300">
                {contest.description ||
                  'No description provided'}
              </p>
            </div>

            {/* Rules */}
            <div className="rounded-md border border-zinc-800 bg-zinc-900 p-5">
              <h3 className="mb-3 text-lg font-semibold text-white">
                Rules
              </h3>

              <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-400">
                {contest.rules || 'No rules defined'}
              </p>
            </div>

            {/* Prizes */}
            <div className="rounded-md border border-zinc-800 bg-zinc-900 p-5">
              <h3 className="mb-4 text-lg font-semibold text-white">
                Prizes
              </h3>

              {contest.prizes?.first ||
                contest.prizes?.second ||
                contest.prizes?.third ? (
                <div className="space-y-3 text-sm">
                  {contest.prizes?.first && (
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                      <span className="text-zinc-400">
                        1st Place
                      </span>

                      <span className="font-medium text-white">
                        {contest.prizes.first}
                      </span>
                    </div>
                  )}

                  {contest.prizes?.second && (
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                      <span className="text-zinc-400">
                        2nd Place
                      </span>

                      <span className="font-medium text-white">
                        {contest.prizes.second}
                      </span>
                    </div>
                  )}

                  {contest.prizes?.third && (
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">
                        3rd Place
                      </span>

                      <span className="font-medium text-white">
                        {contest.prizes.third}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-zinc-500">
                  No prizes defined
                </p>
              )}
            </div>
          </div>

          {/* ==================================================
              RIGHT SIDEBAR
          ================================================== */}

          <div className="space-y-4">
            {/* Timeline */}
            <div className="rounded-md border border-zinc-800 bg-zinc-900 p-5">
              <h3 className="mb-4 text-lg font-semibold text-white">
                Timeline
              </h3>

              <div className="space-y-4 text-sm">
                {/* Start */}
                <div className="flex items-start gap-3">
                  <Calendar className="mt-1 h-4 w-4 shrink-0 text-zinc-400" />

                  <div>
                    <p className="text-zinc-500">
                      Start Date
                    </p>

                    <p className="mt-1 text-white">
                      {formatDate(contest.start_date)}
                    </p>
                  </div>
                </div>

                {/* Submission */}
                <div className="flex items-start gap-3">
                  <Calendar className="mt-1 h-4 w-4 shrink-0 text-zinc-400" />

                  <div>
                    <p className="text-zinc-500">
                      Submission Deadline
                    </p>

                    <p className="mt-1 text-white">
                      {formatDate(
                        contest.submission_end_date
                      )}
                    </p>
                  </div>
                </div>

                {/* Voting */}
                <div className="flex items-start gap-3">
                  <Calendar className="mt-1 h-4 w-4 shrink-0 text-zinc-400" />

                  <div>
                    <p className="text-zinc-500">
                      Voting Ends
                    </p>

                    <p className="mt-1 text-white">
                      {formatDate(
                        contest.voting_end_date
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="rounded-md border border-zinc-800 bg-zinc-900 p-5">
              <h3 className="mb-4 text-lg font-semibold text-white">
                Stats
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-zinc-400">
                    Max Entries/User
                  </span>

                  <span className="text-white">
                    {contest.max_entries_per_user ?? 0}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-zinc-400">
                    Visibility
                  </span>

                  <span className="capitalize text-white">
                    {contest.visibility || 'N/A'}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-zinc-400">
                    Winner Announced
                  </span>

                  <span className="text-white">
                    {contest.winner_announced
                      ? 'Yes'
                      : 'No'}
                  </span>
                </div>
              </div>
            </div>

            {/* Judges */}
            <div className="rounded-md border border-zinc-800 bg-zinc-900 p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  Judges
                </h3>

                <span className="rounded-full bg-zinc-800 px-2 py-1 text-xs text-zinc-400">
                  {judges.length} assigned
                </span>
              </div>

              {judgesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                </div>
              ) : judges.length > 0 ? (
                <div className="mb-5 max-h-64 space-y-2 overflow-y-auto">
                  {judges.map((judge) => (
                    <div
                      key={judge.id}
                      className="flex items-center justify-between rounded border border-zinc-800 bg-zinc-950 px-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">
                          {judge.name ||
                            judge.full_name ||
                            judge.username ||
                            'Unknown Judge'}
                        </p>

                        {judge.username && (
                          <p className="mt-0.5 truncate text-xs text-zinc-500">
                            @{judge.username}
                          </p>
                        )}
                      </div>

                      {isOrganizer && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={isRemovingJudge}
                          onClick={() =>
                            handleRemoveJudge(judge.id)
                          }
                          className="ml-2 text-red-400 hover:bg-red-500/10 hover:text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center">
                  <Users className="mx-auto mb-3 h-8 w-8 text-zinc-700" />

                  <p className="text-sm text-zinc-500">
                    No judges assigned yet.
                  </p>
                </div>
              )}

              {/* Only organizer should assign judges */}
              {isOrganizer && (
                <Button
                  className="w-full"
                  disabled={isAssigningJudge}
                  onClick={() => setShowAssignModal(true)}
                >
                  <UserPlus className="mr-2 h-4 w-4" />

                  {judges.length === 0
                    ? 'Assign First Judge'
                    : 'Add Another Judge'}
                </Button>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-2 rounded-md border border-zinc-800 bg-zinc-900 p-5">
              <Button
                className="w-full bg-white text-black hover:bg-zinc-200"
                onClick={() =>
                  navigate(
                    `/opportunity/${contest.id}/entries`
                  )
                }
              >
                <Users className="mr-2 h-4 w-4" />
                View Entries
              </Button>

              <Button
                variant="outline"
                className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                onClick={() =>
                  navigate(
                    `/opportunity/${contest.id}/leaderboard`
                  )
                }
              >
                <Trophy className="mr-2 h-4 w-4" />
                Leaderboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================
          ASSIGN JUDGE MODAL
      ====================================================== */}

      <AssignJudgeModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        onJudgeAssigned={handleAssignJudge}
      />
    </div>
  );
};

export default OpportunityDetailPage;