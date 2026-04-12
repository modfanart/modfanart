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

  const filtered = contests.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = status ? c.status === status : true;
    return matchSearch && matchStatus;
  });

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
      <div className="container mx-auto py-10 px-4 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Trophy className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Contests</h1>
            <p className="text-sm text-muted-foreground">Manage contests, entries and lifecycle</p>
          </div>
        </div>

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

      {/* FILTER BAR */}
      <div className="flex flex-col md:flex-row gap-3 mb-6 bg-muted/40 p-3 rounded-xl border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>

        <select
          className="border rounded-md px-3 py-2 text-sm bg-background"
          value={status ?? ''}
          onChange={(e) => setStatus(e.target.value || undefined)}
        >
          <option value="">All Status</option>
          <option value="live">Live</option>
          <option value="judging">Judging</option>
          <option value="completed">Completed</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* EMPTY STATE */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Trophy className="h-12 w-12 text-muted-foreground mb-3" />
          <h3 className="text-lg font-medium">No contests found</h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your filters or create a new contest
          </p>
        </div>
      ) : (
        /* TABLE */
        <div className="rounded-2xl border shadow-sm overflow-hidden">
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
                <TableHead />
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.map((contest: Contest) => {
                const maxPrize = contest.prizes?.length
                  ? Math.max(...contest.prizes.map((p) => p.amount_inr || 0))
                  : null;

                return (
                  <TableRow key={contest.id} className="hover:bg-muted/40">
                    {/* CONTEST */}
                    <TableCell>
                      <div>
                        <div className="font-medium">{contest.title}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {contest.description}
                        </div>
                      </div>
                    </TableCell>

                    {/* STATUS */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            contest.status === 'live'
                              ? 'default'
                              : contest.status === 'completed'
                                ? 'secondary'
                                : 'outline'
                          }
                          className="capitalize"
                        >
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
                        <CalendarDays className="h-4 w-4" />
                        {format(new Date(contest.start_date), 'MMM d')} –{' '}
                        {format(new Date(contest.submission_end_date), 'MMM d')}
                      </div>
                    </TableCell>

                    {/* ENTRIES */}
                    <TableCell className="text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        Max {contest.max_entries_per_user}
                      </div>
                    </TableCell>

                    {/* PRIZE */}
                    <TableCell>
                      {maxPrize ? (
                        <div className="flex items-center gap-2 font-medium text-green-600">
                          ₹{maxPrize}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>

                    {/* VISIBILITY */}
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {contest.visibility}
                      </Badge>
                    </TableCell>

                    {/* DEADLINE */}
                    <TableCell className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
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
  );
}
