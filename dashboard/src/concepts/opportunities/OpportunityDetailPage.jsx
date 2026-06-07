'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Users, Calendar } from '@phosphor-icons/react';

import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/button';
import { ScrollArea } from '../../components/ui/scroll-area';

import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

// RTK Query
import { useGetContestQuery } from '@/services/api/contestsApi';

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

export const OpportunityDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [contest, setContest] = useState(null);

  // RTK Query
  const { data, isLoading, error } = useGetContestQuery(id);

  useEffect(() => {
    if (data?.contest) {
      setContest(data.contest);
    } else if (data) {
      // fallback if API returns raw object
      setContest(data);
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      toast.error('Failed to load opportunity');
      navigate('/opportunities');
    }
  }, [error]);

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
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6 text-zinc-400 hover:text-white"
          onClick={() => navigate('/opportunities')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Opportunities
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT MAIN */}
          <div className="lg:col-span-2 space-y-6">

            {/* Overview */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-md p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Overview</h3>
                <StatusBadge status={contest.status} />
              </div>

              <p className="text-zinc-300 text-sm leading-relaxed">
                {contest.description || 'No description provided'}
              </p>
            </div>

            {/* Rules */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-md p-5">
              <h3 className="text-lg font-semibold text-white mb-3">Rules</h3>
              <p className="text-zinc-400 text-sm">
                {contest.rules || 'No rules defined'}
              </p>
            </div>

            {/* Prizes */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-md p-5">
              <h3 className="text-lg font-semibold text-white mb-3">Prizes</h3>

              <div className="space-y-2 text-sm">
                {contest.prizes?.first && (
                  <div className="flex justify-between">
                    <span className="text-zinc-400">1st Place</span>
                    <span className="text-white">{contest.prizes.first}</span>
                  </div>
                )}

                {contest.prizes?.second && (
                  <div className="flex justify-between">
                    <span className="text-zinc-400">2nd Place</span>
                    <span className="text-white">{contest.prizes.second}</span>
                  </div>
                )}

                {contest.prizes?.third && (
                  <div className="flex justify-between">
                    <span className="text-zinc-400">3rd Place</span>
                    <span className="text-white">{contest.prizes.third}</span>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT SIDEBAR */}
          <div className="space-y-4">

            {/* Meta */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-md p-5">
              <h3 className="text-lg font-semibold text-white mb-4">Timeline</h3>

              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-zinc-400 mt-1" />
                  <div>
                    <p className="text-zinc-400">Start</p>
                    <p className="text-white">
                      {new Date(contest.start_date).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-zinc-400 mt-1" />
                  <div>
                    <p className="text-zinc-400">Submission Ends</p>
                    <p className="text-white">
                      {new Date(contest.submission_end_date).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-zinc-400 mt-1" />
                  <div>
                    <p className="text-zinc-400">Voting Ends</p>
                    <p className="text-white">
                      {new Date(contest.voting_end_date).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-md p-5">
              <h3 className="text-lg font-semibold text-white mb-4">Stats</h3>

              <div className="space-y-3 text-sm">

                <div className="flex justify-between">
                  <span className="text-zinc-400">Max Entries/User</span>
                  <span className="text-white">
                    {contest.max_entries_per_user ?? 0}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-zinc-400">Visibility</span>
                  <span className="text-white capitalize">
                    {contest.visibility}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-zinc-400">Winner Announced</span>
                  <span className="text-white">
                    {contest.winner_announced ? 'Yes' : 'No'}
                  </span>
                </div>

              </div>
            </div>

            {/* Actions */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-md p-5 space-y-2">

              <Button
                className="w-full bg-white text-black hover:bg-zinc-200"
                onClick={() => navigate(`/opportunities/${contest.id}/entries`)}
              >
                <Users className="w-4 h-4 mr-2" />
                View Entries
              </Button>

              <Button
                variant="outline"
                className="w-full border-zinc-700 text-zinc-300"
                onClick={() => navigate(`/opportunities/${contest.id}/leaderboard`)}
              >
                <Trophy className="w-4 h-4 mr-2" />
                Leaderboard
              </Button>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default OpportunityDetailPage;