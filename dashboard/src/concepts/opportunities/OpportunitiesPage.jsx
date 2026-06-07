'use client';

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Eye } from '@phosphor-icons/react';

import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../components/ui/select';

import { useGetContestsQuery } from '@/services/api/contestsApi';

// FIXED: include "live" since your API uses it
const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'draft', label: 'Draft' },
  { value: 'live', label: 'Live' },
  { value: 'judging', label: 'Judging' },
  { value: 'completed', label: 'Completed' },
];

// FIXED badge mapping
const StatusBadge = ({ status }) => {
  const statusClasses = {
    draft: 'status-pending',
    live: 'status-in_progress',
    judging: 'status-ready',
    completed: 'status-completed',
  };

  return (
    <span className={`badge ${statusClasses[status] || 'border-zinc-700 text-zinc-400'}`}>
      {status}
    </span>
  );
};

export const OpportunitiesPage = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');

  const { data, isLoading } = useGetContestsQuery({
    limit: 50,
  });

  // ✅ FIX: safely handle API response shape
  const contests = data?.contests ?? [];

  // filtering
  const opportunities = useMemo(() => {
    if (statusFilter === 'all') return contests;
    return contests.filter(c => c.status === statusFilter);
  }, [contests, statusFilter]);

  return (
    <div className="min-h-screen" data-testid="opportunities-page">
      <Header
        title="Opportunities"
        subtitle={`${opportunities.length} opportunities`}
      />

      <div className="p-4 sm:p-6 space-y-6">

        {/* Filters */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40 bg-zinc-900 border-zinc-800 text-white">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>

          <SelectContent className="bg-zinc-900 border-zinc-800">
            {statusOptions.map(option => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="text-zinc-300"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-md overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          ) : opportunities.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Trophy weight="duotone" className="w-12 h-12 text-zinc-600 mb-4" />
              <p className="text-zinc-400">No opportunities found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {opportunities.map(contest => (
                    <tr key={contest.id}>
                      <td className="text-white font-medium">
                        {contest.title}
                      </td>

                      <td>
                        <StatusBadge status={contest.status} />
                      </td>

                      <td className="text-zinc-500 text-sm">
                        {new Date(contest.created_at).toLocaleDateString()}
                      </td>

                      <td>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-zinc-400 hover:text-white"
                          onClick={() => navigate(`/opportunity/${contest.id}`)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
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

export default OpportunitiesPage;