'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Users, Calendar, UserPlus, X, MagnifyingGlass } from '@phosphor-icons/react';

import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { ScrollArea } from '../../components/ui/scroll-area';

import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

// RTK Query
import {
  useGetContestQuery,
  useGetContestJudgesQuery,
  useAssignJudgeMutation,
  useRemoveJudgeMutation,

} from '@/services/api/contestsApi';
import { useGetAllUsersQuery } from '../../services/api/userApi';
const StatusBadge = ({ status }) => {
  const statusClasses = {
    draft: 'status-pending',
    live: 'status-in_progress',
    judging: 'status-ready',
    completed: 'status-completed',
  };

  return (
    <span className={`badge ${statusClasses[status] || 'border-zinc-700 text-zinc-400'}`}>
      {status?.replace('_', ' ')}
    </span>
  );
};

// ====================== ASSIGN JUDGE MODAL ======================
const AssignJudgeModal = ({ isOpen, onClose, onJudgeAssigned }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [assigningId, setAssigningId] = useState(null);

  // Real API Query
  const { data: usersData, isLoading: usersLoading } = useGetAllUsersQuery(
    { search: searchTerm },
    { skip: searchTerm.length < 2 }
  );

  const users = usersData?.users || [];

  const handleAssign = async (userId) => {
    setAssigningId(userId);
    try {
      await onJudgeAssigned(userId);
      setSearchTerm('');
    } catch (err) {
      console.error(err);
    } finally {
      setAssigningId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-md mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-semibold text-white">Assign Judge</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="relative mb-4">
            <MagnifyingGlass className="absolute left-3 top-3 text-zinc-500" />
            <Input
              placeholder="Search users by name or username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-zinc-950"
            />
          </div>

          <div className="max-h-80 overflow-y-auto pr-2">
            {usersLoading && searchTerm.length >= 2 && (
              <p className="text-zinc-500 text-center py-8">Searching...</p>
            )}

            {!usersLoading && users.length > 0 ? (
              users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 hover:bg-zinc-800 rounded-lg mb-1 group"
                >
                  <div>
                    <p className="text-white font-medium">{user.name || user.full_name}</p>
                    <p className="text-xs text-zinc-500">
                      @{user.username} • ID: {user.id}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleAssign(user.id)}
                    disabled={assigningId === user.id}
                  >
                    {assigningId === user.id ? "Assigning..." : "Assign"}
                  </Button>
                </div>
              ))
            ) : searchTerm.length >= 2 && !usersLoading ? (
              <p className="text-zinc-500 text-center py-12">No users found</p>
            ) : (
              <p className="text-zinc-500 text-center py-12 text-sm">
                Type at least 2 characters to search users
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ====================== MAIN PAGE ======================
export const OpportunityDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [contest, setContest] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // RTK Queries
  const { data, isLoading, error } = useGetContestQuery(id);
  const { data: judgesData } = useGetContestJudgesQuery(id, { skip: !id });

  const [assignJudge] = useAssignJudgeMutation();
  const [removeJudge] = useRemoveJudgeMutation();

  const judges = judgesData?.judges || [];

  const isOrganizer = contest?.created_by === user?.id ||
    contest?.organizer_id === user?.id ||
    contest?.user_id === user?.id;

  useEffect(() => {
    if (data?.contest) setContest(data.contest);
    else if (data) setContest(data);
  }, [data]);

  useEffect(() => {
    if (error) {
      toast.error('Failed to load opportunity');
      navigate('/opportunities');
    }
  }, [error, navigate]);

  const handleAssignJudge = async (userId) => {
    try {
      await assignJudge({ contestId: id, userId }).unwrap();
      toast.success("Judge assigned successfully!");
      setShowAssignModal(false);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to assign judge");
    }
  };

  const handleRemoveJudge = async (judgeId) => {
    if (!window.confirm("Are you sure you want to remove this judge?")) return;
    try {
      await removeJudge({ contestId: id, judgeId }).unwrap();
      toast.success("Judge removed successfully");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to remove judge");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!contest) return null;

  return (
    <div className="min-h-screen" data-testid="opportunity-detail-page">
      <Header title={contest.title} subtitle="Opportunity Details" />

      <div className="p-4 sm:p-6">
        <Button
          variant="ghost"
          className="mb-6 text-zinc-400 hover:text-white"
          onClick={() => navigate('/opportunities')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Opportunities
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview, Rules, Prizes - unchanged */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-md p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Overview</h3>
                <StatusBadge status={contest.status} />
              </div>
              <p className="text-zinc-300 text-sm leading-relaxed">
                {contest.description || 'No description provided'}
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-md p-5">
              <h3 className="text-lg font-semibold text-white mb-3">Rules</h3>
              <p className="text-zinc-400 text-sm">{contest.rules || 'No rules defined'}</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-md p-5">
              <h3 className="text-lg font-semibold text-white mb-3">Prizes</h3>
              <div className="space-y-2 text-sm">
                {contest.prizes?.first && <div className="flex justify-between"><span className="text-zinc-400">1st Place</span><span className="text-white">{contest.prizes.first}</span></div>}
                {contest.prizes?.second && <div className="flex justify-between"><span className="text-zinc-400">2nd Place</span><span className="text-white">{contest.prizes.second}</span></div>}
                {contest.prizes?.third && <div className="flex justify-between"><span className="text-zinc-400">3rd Place</span><span className="text-white">{contest.prizes.third}</span></div>}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            {/* Timeline & Stats (kept same) */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-md p-5">
              <h3 className="text-lg font-semibold text-white mb-4">Timeline</h3>
              {/* Timeline content same as before */}
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-zinc-400 mt-1" />
                  <div><p className="text-zinc-400">Start Date</p><p className="text-white">{new Date(contest.start_date).toLocaleString()}</p></div>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-zinc-400 mt-1" />
                  <div><p className="text-zinc-400">Submission Deadline</p><p className="text-white">{new Date(contest.submission_end_date).toLocaleString()}</p></div>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-zinc-400 mt-1" />
                  <div><p className="text-zinc-400">Voting Ends</p><p className="text-white">{new Date(contest.voting_end_date).toLocaleString()}</p></div>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-md p-5">
              <h3 className="text-lg font-semibold text-white mb-4">Stats</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-zinc-400">Max Entries/User</span><span className="text-white">{contest.max_entries_per_user ?? 0}</span></div>
                <div className="flex justify-between"><span className="text-zinc-400">Visibility</span><span className="text-white capitalize">{contest.visibility}</span></div>
                <div className="flex justify-between"><span className="text-zinc-400">Winner Announced</span><span className="text-white">{contest.winner_announced ? 'Yes' : 'No'}</span></div>
              </div>
            </div>

            {/* Judges Section */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-md p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Judges</h3>
                <span className="text-xs px-2 py-1 bg-zinc-800 rounded-full text-zinc-400">
                  {judges.length} assigned
                </span>
              </div>

              {judges.length > 0 ? (
                <div className="space-y-2 mb-5 max-h-64 overflow-y-auto">
                  {judges.map((judge) => (
                    <div key={judge.id} className="flex items-center justify-between bg-zinc-950 border border-zinc-800 rounded px-3 py-2.5">
                      <div>
                        <p className="text-white text-sm font-medium">{judge.name || judge.username}</p>
                        <p className="text-zinc-500 text-xs">ID: {judge.id}</p>
                      </div>
                      {isOrganizer && (
                        <Button variant="ghost" size="sm" onClick={() => handleRemoveJudge(judge.id)} className="text-red-400 hover:text-red-500">
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-zinc-500 text-center py-6">No judges assigned yet.</p>
              )}

              {(
                <Button
                  className="w-full"
                  onClick={() => setShowAssignModal(true)}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  {judges.length === 0 ? "Assign First Judge" : "Add Another Judge"}
                </Button>
              )}
            </div>

            {/* Actions */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-md p-5 space-y-2">
              <Button className="w-full bg-white text-black hover:bg-zinc-200" onClick={() => navigate(`/opportunity/${contest.id}/entries`)}>
                <Users className="w-4 h-4 mr-2" /> View Entries
              </Button>
              <Button variant="outline" className="w-full border-zinc-700 text-zinc-300" onClick={() => navigate(`/opportunity/${contest.id}/leaderboard`)}>
                <Trophy className="w-4 h-4 mr-2" /> Leaderboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AssignJudgeModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        onJudgeAssigned={handleAssignJudge}
      />
    </div>
  );
};

export default OpportunityDetailPage;