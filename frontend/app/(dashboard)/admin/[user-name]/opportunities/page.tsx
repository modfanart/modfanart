'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  Trophy,
  Users,
  Clock,
  Plus,
  Search,
  RefreshCcw,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  Award,
  Users as JudgesIcon,
} from 'lucide-react';

import {
  useGetContestsQuery,
  useUpdateContestMutation,
  useDeleteContestMutation,
  type Contest,
} from '@/services/api/contestsApi';

import { useAuth } from '@/store/AuthContext';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';

/* ───────────────── STATUS OPTIONS ───────────────── */

const STATUS_OPTIONS: Contest['status'][] = [
  'draft',
  'published',
  'live',
  'judging',
  'completed',
  'archived',
];

/* ───────────────── COMPONENT ───────────────── */

export default function ContestsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { toast } = useToast();

  const { user: currentUser } = useAuth();

  const { data, isLoading, refetch } = useGetContestsQuery();
  const [updateContest] = useUpdateContestMutation();
  const [deleteContest] = useDeleteContestMutation();

  const contests = data?.contests ?? [];

  const adminBase = useMemo(() => {
    const roleName = currentUser?.role?.name?.toLowerCase();

    if (roleName === 'admin' || roleName === 'super_admin' || roleName === 'developer') {
      return `/admin/${roleName}`;
    }

    return '';
  }, [currentUser]);
  /* ───────────────── FILTER ───────────────── */

  const filteredContests = contests.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter ? c.status === statusFilter : true;
    return matchSearch && matchStatus;
  });

  /* ───────────────── STATUS UPDATE ───────────────── */

  const handleStatusChange = async (
    id: string,
    currentStatus: Contest['status'],
    newStatus: Contest['status']
  ) => {
    if (currentStatus === newStatus) return;

    try {
      await updateContest({ id, status: newStatus }).unwrap();
      toast({ title: `Status updated to ${newStatus}` });
    } catch {
      toast({ title: 'Failed to update status', variant: 'destructive' });
    }
  };

  /* ───────────────── DELETE ───────────────── */

  const handleDelete = async (id: string, title: string) => {
    const confirmed = confirm(`Delete contest "${title}"?\n\nThis action cannot be undone.`);

    if (!confirmed) return;

    try {
      await deleteContest(id).unwrap();

      toast({
        title: 'Contest deleted',
        description: `"${title}" has been removed successfully.`,
      });
    } catch (err: any) {
      console.error('DELETE ERROR:', err);

      const status = err?.status;
      const message = err?.data?.message || err?.data?.error || 'Something went wrong';

      // 🔴 BUSINESS RULE (status-based block)
      if (status === 400) {
        toast({
          title: 'Cannot delete contest',
          description: message,
          variant: 'destructive',
        });
        return;
      }

      // 🔒 AUTH ISSUE
      if (status === 403) {
        toast({
          title: 'Permission denied',
          description: 'You are not allowed to delete this contest.',
          variant: 'destructive',
        });
        return;
      }

      // ❌ NOT FOUND
      if (status === 404) {
        toast({
          title: 'Contest not found',
          description: 'It may have already been deleted.',
          variant: 'destructive',
        });
        return;
      }

      // 🌐 SERVER / NETWORK
      if (status >= 500 || status === 'FETCH_ERROR') {
        toast({
          title: 'Server error',
          description: 'Please try again later.',
          variant: 'destructive',
        });
        return;
      }

      // ⚠️ FALLBACK
      toast({
        title: 'Delete failed',
        description: message,
        variant: 'destructive',
      });
    }
  };

  /* ───────────────── LOADING ───────────────── */

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 px-4 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  /* ───────────────── UI ───────────────── */

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
            <p className="text-sm text-muted-foreground">
              Manage contests, entries, judges & winners
            </p>
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

      {/* FILTER */}
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
          className="border rounded-md px-3 py-2 text-sm bg-background w-full md:w-52"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* TABLE */}
      {filteredContests.length === 0 ? (
        <div className="text-center py-20">No contests found</div>
      ) : (
        <div className="rounded-2xl border shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contest</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Entries</TableHead>
                <TableHead>Prize</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredContests.map((contest) => {
                const maxPrize = contest.prizes?.length
                  ? Math.max(...contest.prizes.map((p) => p.amount_usd || 0))
                  : 0;
                return (
                  <TableRow key={contest.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{contest.title}</div>
                        <div className="text-xs text-muted-foreground">{contest.description}</div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge className="capitalize">{contest.status}</Badge>
                    </TableCell>

                    <TableCell>
                      {format(new Date(contest.start_date), 'MMM d')} –{' '}
                      {format(new Date(contest.submission_end_date), 'MMM d')}
                    </TableCell>

                    <TableCell>{contest.max_entries_per_user}</TableCell>

                    <TableCell>{maxPrize ? `₹${maxPrize}` : '—'}</TableCell>

                    <TableCell>
                      <Badge variant="outline">{contest.visibility}</Badge>
                    </TableCell>

                    {/* ACTIONS */}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuItem asChild>
                            <Link href={`${adminBase}/contest/${contest.id}/monitor`}>
                              <Eye className="mr-2 h-4 w-4" /> View
                            </Link>
                          </DropdownMenuItem>

                          <DropdownMenuItem asChild>
                            <Link href={`${adminBase}/contest/${contest.id}/edit`}>
                              <Pencil className="mr-2 h-4 w-4" /> Edit
                            </Link>
                          </DropdownMenuItem>

                          {/* STATUS SECTION */}
                          <div className="px-2 py-1 text-xs text-muted-foreground">
                            Change Status
                          </div>

                          {STATUS_OPTIONS.map((status) => (
                            <DropdownMenuItem
                              key={status}
                              disabled={contest.status === status}
                              onClick={() => handleStatusChange(contest.id, contest.status, status)}
                            >
                              <Clock className="mr-2 h-4 w-4" />
                              <span className="flex-1 capitalize">{status}</span>
                              {contest.status === status && '✓'}
                            </DropdownMenuItem>
                          ))}

                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(contest.id, contest.title)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
