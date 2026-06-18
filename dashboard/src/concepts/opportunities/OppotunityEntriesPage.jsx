'use client';

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye } from '@phosphor-icons/react';

import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../components/ui/select';

import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';

// RTK Query
import {
  useGetContestEntriesQuery,
  useUpdateEntryStatusMutation,
  useGetContestQuery
} from '../../services/api/contestsApi';

const entryStatusFlow = ['submitted', 'under_review', 'approved', 'rejected'];

const StatusBadge = ({ status }) => {
  const statusClasses = {
    submitted: 'status-pending',
    under_review: 'status-in_progress',
    approved: 'status-completed',
    rejected: 'status-rejected',
  };

  return (
    <span className={`badge ${statusClasses[status] || 'border-zinc-700 text-zinc-400'}`}>
      {status?.replace('_', ' ')}
    </span>
  );
};

export const OpportunityEntriesPage = () => {
  const { id: contestId } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  const [statusFilter, setStatusFilter] = useState('all');

  // Contest info
  const { data: contestData } = useGetContestQuery(contestId);

  // Entries
  const { data, isLoading } = useGetContestEntriesQuery({
    contestId,
    limit: 100,
  });

  const [updateEntryStatus] = useUpdateEntryStatusMutation();

  const entries = data?.entries ?? [];

  const filteredEntries =
    statusFilter === 'all'
      ? entries
      : entries.filter(e => e.status === statusFilter);

  const canModerate = hasRole(['admin', 'super_admin', 'judge']);

  const handleStatusChange = async (entryId, newStatus) => {
    try {
      await updateEntryStatus({
        contestId,
        entryId,
        status: newStatus,
      }).unwrap();

      toast.success('Entry status updated');
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="min-h-screen" data-testid="opportunity-entries-page">

      <Header
        title={contestData?.contest?.title || 'Entries'}
        subtitle={`${filteredEntries.length} submissions`}
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

        {/* Filters */}
        <div className="flex gap-4 items-center">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48 bg-zinc-900 border-zinc-800 text-white">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>

            <SelectContent className="bg-zinc-900 border-zinc-800">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-md overflow-hidden">

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <p className="text-zinc-400">No entries found</p>
              <p className="text-xs text-zinc-500 mt-2">
                Submissions will appear here
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Artwork</th>
                    <th>Artist</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredEntries.map((entry) => (
                    <tr key={entry.id}>

                      {/* Artwork */}
                      <td className="text-white font-medium">
                        {entry.artwork_title || 'Untitled'}
                      </td>

                      {/* Artist */}
                      <td className="text-zinc-400">
                        {entry.artist_name}
                      </td>

                      {/* Status */}
                      <td>
                        <StatusBadge status={entry.status} />
                      </td>

                      {/* Date */}
                      <td className="text-zinc-500 text-sm">
                        {new Date(entry.created_at).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="flex items-center gap-2">

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-zinc-400 hover:text-white"
                          onClick={() =>
                            navigate(`/opportunities/${contestId}/entries/${entry.id}`)
                          }
                        >
                          <Eye className="w-4 h-4" />
                        </Button>

                        {/* Moderation */}
                        {canModerate && (
                          <Select
                            value={entry.status}
                            onValueChange={(val) =>
                              handleStatusChange(entry.id, val)
                            }
                          >
                            <SelectTrigger className="w-36 h-8 bg-zinc-950 border-zinc-800 text-xs">
                              <SelectValue />
                            </SelectTrigger>

                            <SelectContent className="bg-zinc-900 border-zinc-800">
                              {entryStatusFlow.map((s) => (
                                <SelectItem key={s} value={s}>
                                  {s.replace('_', ' ')}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}

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

export default OpportunityEntriesPage;