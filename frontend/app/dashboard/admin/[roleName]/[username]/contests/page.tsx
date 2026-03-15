'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { CalendarDays, Trophy, Users, Clock, Plus, Search, RefreshCcw, Pencil } from 'lucide-react';

import { useGetContestsQuery, useUpdateContestMutation, Contest } from '@/services/api/contestsApi';

import { useAuth } from '@/store/AuthContext';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { DashboardShell } from '@/components/dashboard-shell';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function ContestsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);

  const [editingStatusId, setEditingStatusId] = useState<string | null>(null);

  const { user: currentUser } = useAuth();

  const { data, isLoading, refetch } = useGetContestsQuery();
  const [updateContest] = useUpdateContestMutation();

  const contests = data?.contests ?? [];

  const adminBase = useMemo(() => {
    if (currentUser?.role?.name === 'Admin') {
      return `/dashboard/admin/${currentUser.role.name.toLowerCase()}/${currentUser.username}`;
    }
    return '';
  }, [currentUser]);

  const filtered = contests.filter((c) => c.title.toLowerCase().includes(search.toLowerCase()));

  const changeStatus = async (id: string, newStatus: Contest['status']) => {
    try {
      await updateContest({ id, status: newStatus }).unwrap();
      setEditingStatusId(null);
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-8">Contests</h1>

        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <DashboardShell>
      <div className="container mx-auto py-10 px-4">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Contests</h1>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Refresh
            </Button>

            <Button asChild>
              <Link href={`${adminBase}/contest/add`}>
                <Plus className="h-4 w-4 mr-2" />
                Create Contest
              </Link>
            </Button>
          </div>
        </div>

        {/* FILTERS */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

            <Input
              placeholder="Search contests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <select
            className="border rounded-md px-3 py-2 text-sm"
            value={status ?? ''}
            onChange={(e) => setStatus(e.target.value || undefined)}
          >
            <option value="">All</option>
            <option value="live">Live</option>
            <option value="judging">Judging</option>
            <option value="completed">Completed</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        {/* EMPTY STATE */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Trophy className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-xl font-medium">No contests found</h3>
          </div>
        ) : (
          <div className="border rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contest</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Entries</TableHead>
                  <TableHead>Top Prize</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filtered.map((contest: Contest) => {
                  const maxPrize = contest.prizes?.length
                    ? Math.max(...contest.prizes.map((p) => p.amount_inr || 0))
                    : null;

                  return (
                    <TableRow key={contest.id}>
                      {/* CONTEST */}
                      <TableCell>
                        <div>
                          <div className="font-medium">{contest.title}</div>

                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {contest.description}
                          </div>
                        </div>
                      </TableCell>

                      {/* STATUS WITH EDIT */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={contest.status === 'live' ? 'default' : 'secondary'}>
                            {contest.status}
                          </Badge>

                          {editingStatusId === contest.id ? (
                            <select
                              autoFocus
                              defaultValue={contest.status}
                              className="border rounded px-2 py-1 text-xs"
                              onChange={(e) =>
                                changeStatus(contest.id, e.target.value as Contest['status'])
                              }
                              onBlur={() => setEditingStatusId(null)}
                            >
                              <option value="draft">Draft</option>
                              <option value="published">Published</option>
                              <option value="live">Live</option>
                              <option value="judging">Judging</option>
                              <option value="completed">Completed</option>
                              <option value="archived">Archived</option>
                            </select>
                          ) : (
                            <button
                              onClick={() => setEditingStatusId(contest.id)}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </TableCell>

                      {/* DATES */}
                      <TableCell className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          {format(new Date(contest.start_date), 'MMM d')} –{' '}
                          {format(new Date(contest.submission_end_date), 'MMM d')}
                        </div>
                      </TableCell>

                      {/* ENTRIES */}
                      <TableCell className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          Max {contest.max_entries_per_user}
                        </div>
                      </TableCell>

                      {/* PRIZE */}
                      <TableCell>
                        {maxPrize ? (
                          <div className="flex items-center gap-2 font-medium">₹{maxPrize}</div>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>

                      {/* VISIBILITY */}
                      <TableCell>
                        <Badge variant="outline">{contest.visibility}</Badge>
                      </TableCell>

                      {/* DEADLINE */}
                      <TableCell className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          {format(new Date(contest.submission_end_date), 'd MMM yyyy')}
                        </div>
                      </TableCell>

                      {/* ACTION */}
                      <TableCell>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/contest/${contest.id}`}>View</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* PAGINATION */}
        <div className="flex justify-end mt-6 gap-2">
          <Button variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>

          <Button variant="outline" onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      </div>
    </DashboardShell>
  );
}
