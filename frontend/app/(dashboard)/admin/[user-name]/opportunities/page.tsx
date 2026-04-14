'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  CalendarDays,
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

export default function ContestsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const { toast } = useToast();

  const { user: currentUser } = useAuth();

  const { data, isLoading, refetch } = useGetContestsQuery();
  const [updateContest] = useUpdateContestMutation();
  const [deleteContest] = useDeleteContestMutation();

  const contests = data?.contests ?? [];

  const adminBase = useMemo(() => {
    if (currentUser?.role?.name === 'Admin') {
      return `/admin/${currentUser.role.name.toLowerCase()}`;
    }
    return '';
  }, [currentUser]);

  const filteredContests = contests.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter ? c.status === statusFilter : true;
    return matchSearch && matchStatus;
  });

  const handleStatusChange = async (id: string, newStatus: Contest['status']) => {
    try {
      await updateContest({ id, status: newStatus }).unwrap();
      toast({ title: 'Status updated successfully' });
    } catch (err) {
      toast({ title: 'Failed to update status', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete contest "${title}"? This action cannot be undone.`)) return;

    try {
      await deleteContest(id).unwrap();
      toast({ title: 'Contest deleted successfully' });
    } catch (err) {
      toast({ title: 'Failed to delete contest', variant: 'destructive' });
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
          className="border rounded-md px-3 py-2 text-sm bg-background w-full md:w-52"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="live">Live</option>
          <option value="judging">Judging</option>
          <option value="completed">Completed</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* TABLE */}
      {filteredContests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Trophy className="h-12 w-12 text-muted-foreground mb-3" />
          <h3 className="text-lg font-medium">No contests found</h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your filters or create a new contest
          </p>
        </div>
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
              {filteredContests.map((contest: Contest) => {
                const maxPrize = contest.prizes?.length
                  ? Math.max(...contest.prizes.map((p) => p.amount_inr || 0))
                  : 0;

                return (
                  <TableRow key={contest.id} className="hover:bg-muted/40">
                    {/* CONTEST INFO */}
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
                      <Badge
                        variant={
                          contest.status === 'live'
                            ? 'default'
                            : contest.status === 'completed'
                              ? 'secondary'
                              : contest.status === 'judging'
                                ? 'outline'
                                : 'secondary'
                        }
                        className="capitalize"
                      >
                        {contest.status}
                      </Badge>
                    </TableCell>

                    {/* DATES */}
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(contest.start_date), 'MMM d')} –{' '}
                      {format(new Date(contest.submission_end_date), 'MMM d')}
                    </TableCell>

                    {/* ENTRIES */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {contest.max_entries_per_user} max
                      </div>
                    </TableCell>

                    {/* PRIZE */}
                    <TableCell>
                      {maxPrize > 0 ? (
                        <span className="font-medium text-green-600">₹{maxPrize}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    {/* VISIBILITY */}
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {contest.visibility}
                      </Badge>
                    </TableCell>

                    {/* ACTIONS */}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuItem asChild>
                            <Link href={`/contest/${contest.id}`}>
                              <Eye className="mr-2 h-4 w-4" /> View Contest
                            </Link>
                          </DropdownMenuItem>

                          <DropdownMenuItem asChild>
                            <Link href={`${adminBase}/contest/${contest.id}/edit`}>
                              <Pencil className="mr-2 h-4 w-4" /> Edit Contest
                            </Link>
                          </DropdownMenuItem>

                          <DropdownMenuItem asChild>
                            <Link href={`${adminBase}/contest/${contest.id}/entries`}>
                              <Users className="mr-2 h-4 w-4" /> View Entries
                            </Link>
                          </DropdownMenuItem>

                          <DropdownMenuItem asChild>
                            <Link href={`${adminBase}/contest/${contest.id}/judges`}>
                              <JudgesIcon className="mr-2 h-4 w-4" /> Manage Judges
                            </Link>
                          </DropdownMenuItem>

                          {contest.status === 'completed' && (
                            <DropdownMenuItem asChild>
                              <Link href={`${adminBase}/contest/${contest.id}/winners`}>
                                <Award className="mr-2 h-4 w-4" /> Announce Winners
                              </Link>
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(contest.id, contest.title)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Contest
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
