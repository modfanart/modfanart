'use client';

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy } from '@phosphor-icons/react';

import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/button';

import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';

// RTK Query
import { useGetLeaderboardQuery } from '../../services/api/contestsApi';

const RankBadge = ({ rank }) => {
  const styles = {
    1: 'bg-yellow-500 text-black',
    2: 'bg-zinc-300 text-black',
    3: 'bg-orange-400 text-black',
  };

  return (
    <span
      className={`px-2 py-1 rounded-md text-xs font-semibold ${styles[rank] || 'bg-zinc-800 text-zinc-300'
        }`}
    >
      #{rank}
    </span>
  );
};

export const OpportunityLeaderboardPage = () => {
  const { id: contestId } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  const { data, isLoading, error } = useGetLeaderboardQuery(contestId);

  const leaderboard = data?.leaderboard ?? data ?? [];

  if (error) {
    toast.error('Failed to load leaderboard');
  }

  return (
    <div className="min-h-screen" data-testid="opportunity-leaderboard-page">

      <Header
        title="Leaderboard"
        subtitle="Top ranked entries"
      />

      <div className="p-4 sm:p-6 space-y-6">

        {/* Back */}
        <Button
          variant="ghost"
          className="text-zinc-400 hover:text-white"
          onClick={() => navigate(`/opportunity/${contestId}`)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Opportunity
        </Button>

        {/* Table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-md overflow-hidden">

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Trophy className="w-10 h-10 text-zinc-600 mb-3" />
              <p className="text-zinc-400">No leaderboard data yet</p>
              <p className="text-xs text-zinc-500 mt-2">
                Rankings will appear after judging/voting
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Artwork</th>
                    <th>Artist</th>
                    <th>Score</th>
                    <th>Votes</th>
                  </tr>
                </thead>

                <tbody>
                  {leaderboard.map((entry, index) => (
                    <tr key={entry.entry_id || entry.id}>

                      {/* Rank */}
                      <td>
                        <RankBadge rank={index + 1} />
                      </td>

                      {/* Artwork */}
                      <td className="text-white font-medium">
                        {entry.artwork_title || 'Untitled'}
                      </td>

                      {/* Artist */}
                      <td className="text-zinc-400">
                        {entry.artist_name}
                      </td>

                      {/* Score */}
                      <td className="text-white font-semibold">
                        {entry.score ?? 0}
                      </td>

                      {/* Votes */}
                      <td className="text-zinc-400">
                        {entry.votes ?? 0}
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default OpportunityLeaderboardPage;