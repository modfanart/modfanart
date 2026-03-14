'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { CalendarDays, Trophy, Users, Clock, Plus, Search, RefreshCcw } from 'lucide-react';

import { useGetContestsQuery, Contest } from '@/services/api/contestsApi';

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

  const { data, isLoading, refetch } = useGetContestsQuery();

  const contests = data?.contests ?? [];

  const filtered = contests.filter((c) => c.title.toLowerCase().includes(search.toLowerCase()));

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
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Contests</h1>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Refresh
            </Button>

            <Button asChild>
              <Link href="/contest/add">
                <Plus className="h-4 w-4 mr-2" />
                Create Contest
              </Link>
            </Button>
          </div>
        </div>

        {/* Filters */}
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

        {/* Empty */}
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
                      {/* Contest */}
                      <TableCell>
                        <div>
                          <div className="font-medium">{contest.title}</div>

                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {contest.description}
                          </div>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Badge variant={contest.status === 'live' ? 'default' : 'secondary'}>
                          {contest.status}
                        </Badge>
                      </TableCell>

                      {/* Dates */}
                      <TableCell className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4" />
                          {format(new Date(contest.start_date), 'MMM d')} –
                          {format(new Date(contest.submission_end_date), 'MMM d')}
                        </div>
                      </TableCell>

                      {/* Entries */}
                      <TableCell className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Max {contest.max_entries_per_user}
                        </div>
                      </TableCell>

                      {/* Prize */}
                      <TableCell>
                        {maxPrize ? (
                          <div className="flex items-center gap-2 font-medium">
                            <Trophy className="h-4 w-4 text-amber-600" />₹{maxPrize}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>

                      {/* Visibility */}
                      <TableCell>
                        <Badge variant="outline">{contest.visibility}</Badge>
                      </TableCell>

                      {/* Deadline */}
                      <TableCell className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {format(new Date(contest.submission_end_date), 'd MMM yyyy')}
                        </div>
                      </TableCell>

                      {/* Action */}
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

        {/* Pagination */}
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
