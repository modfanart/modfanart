'use client';

import {
  ArrowLeft,
  Check,
  Edit,
  Eye,
  MoreHorizontal,
  Trash2,
  X,
  Calendar,
  Users,
  Clock,
  Briefcase,
  Award,
  Search,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useMemo, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

import { EmptyState } from '@/components/empty-state';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import {
  useGetContestQuery,
  useGetContestEntriesQuery,
  useDeleteContestMutation,
  useUpdateEntryStatusMutation,
  useDeleteContestEntryMutation,
  ContestEntry,
} from '@/services/api/contestsApi';

interface ExtendedContestEntry extends ContestEntry {
  artwork_title?: string;
  artwork_thumbnail_url?: string;
  artwork_file_url?: string;
  creator_username?: string;
  submitted_at?: string;
}

export function ManageOpportunityContent({ opportunityId }: { opportunityId: string }) {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedEntry, setSelectedEntry] = useState<ExtendedContestEntry | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const { data: opportunity, isLoading: oppLoading } = useGetContestQuery(opportunityId);
  const { data: entriesResponse, isLoading: entriesLoading } = useGetContestEntriesQuery({
    contestId: opportunityId,
  });

  const entries: ExtendedContestEntry[] = useMemo(
    () => (Array.isArray(entriesResponse) ? entriesResponse : (entriesResponse?.entries ?? [])),
    [entriesResponse]
  );

  const [deleteContest] = useDeleteContestMutation();
  const [updateEntryStatus, { isLoading: isUpdatingStatus }] = useUpdateEntryStatusMutation();
  const [deleteEntry] = useDeleteContestEntryMutation();

  // ── Handlers ────────────────────────────────────────────────
  const handleDeleteOpportunity = async () => {
    try {
      await deleteContest(opportunityId).unwrap();
      router.push('/dashboard/opportunities');
    } catch (err) {
      console.error('Failed to delete contest:', err);
    }
  };

  const handleStatusChange = useCallback(
    async (entryId: string, status: ContestEntry['status']) => {
      try {
        await updateEntryStatus({ contestId: opportunityId, entryId, status }).unwrap();
        if (selectedEntry?.id === entryId) {
          setViewDialogOpen(false);
        }
      } catch (err) {
        console.error('Failed to update entry status:', err);
      }
    },
    [opportunityId, selectedEntry, updateEntryStatus]
  );

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm('Delete this entry permanently? This cannot be undone.')) return;
    try {
      await deleteEntry({ contestId: opportunityId, entryId }).unwrap();
    } catch (err) {
      console.error('Failed to delete entry:', err);
    }
  };

  // ── Helpers ─────────────────────────────────────────────────
  const formatRelative = (date?: string) =>
    date ? formatDistanceToNow(new Date(date), { addSuffix: true }) : '—';

  const getEntryRowStyles = (status: string) => {
    switch (status) {
      case 'approved':
        return 'border-l-4 border-l-green-500 bg-green-50/40';
      case 'rejected':
        return 'border-l-4 border-l-red-500 bg-red-50/30';
      case 'winner':
        return 'border-l-4 border-l-yellow-500 bg-yellow-50/50';
      case 'pending':
      default:
        return 'border-l-4 border-l-gray-300';
    }
  };

  const getContestStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'live':
      case 'published':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'judging':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'archived':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'draft':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const filteredEntries = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return entries.filter((e) => {
      const matchesSearch =
        !q ||
        e.artwork_title?.toLowerCase().includes(q) ||
        e.artwork_id?.toLowerCase().includes(q) ||
        e.creator_username?.toLowerCase().includes(q) ||
        e.creator_id?.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [entries, searchQuery, statusFilter]);

  if (oppLoading || entriesLoading) {
    return <LoadingSkeleton />;
  }

  if (!opportunity) {
    return (
      <EmptyState
        title="Opportunity not found"
        description="This contest may have been deleted or you don't have access."
        actionLabel="Back to Opportunities"
        actionLink="/dashboard/opportunities"
      />
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6 pb-16">
        {/* ── Header ────────────────────────────────────────────── */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild className="-ml-2">
              <Link href="/dashboard/opportunities">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  {opportunity.title}
                </h1>
                <Badge
                  variant="outline"
                  className={cn(
                    'px-3 py-1 text-xs font-medium capitalize',
                    getContestStatusBadgeVariant(opportunity.status)
                  )}
                >
                  {opportunity.status}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm mt-1">Manage submissions & decisions</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/contests/${opportunityId}`} target="_blank" rel="noopener noreferrer">
                <Eye className="mr-2 h-4 w-4" />
                View public page
              </Link>
            </Button>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/opportunities/${opportunityId}/edit`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit contest
                    </Link>
                  </DropdownMenuItem>

                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete contest…
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                </DropdownMenuContent>
              </DropdownMenu>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this contest?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently remove the contest and all {entries.length} submissions.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteOpportunity}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete Contest
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </header>

        {/* ── Overview Card ─────────────────────────────────────── */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Contest Overview</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Briefcase className="h-4 w-4" />
                Brand
              </div>
              <div className="font-medium">{opportunity.brand_name || '—'}</div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Calendar className="h-4 w-4" />
                Deadline
              </div>
              <div className="font-medium">
                {opportunity.submission_end_date
                  ? new Date(opportunity.submission_end_date).toLocaleDateString()
                  : '—'}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Clock className="h-4 w-4" />
                Created
              </div>
              <div className="font-medium">{formatRelative(opportunity.created_at)}</div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Users className="h-4 w-4" />
                Entries
              </div>
              <div className="text-2xl font-bold">{entries.length}</div>
            </div>
          </CardContent>

          {opportunity.description && (
            <>
              <Separator className="my-6" />
              <CardContent>
                <h4 className="font-medium mb-3 text-sm uppercase tracking-wide text-muted-foreground">
                  Description
                </h4>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {opportunity.description}
                </p>
              </CardContent>
            </>
          )}
        </Card>

        {/* ── Entries Section ───────────────────────────────────── */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle>
                Submissions {filteredEntries.length > 0 && `(${filteredEntries.length})`}
              </CardTitle>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search title, creator, ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={cn(
                    'h-10 rounded-md border border-input bg-background px-3 py-2 text-sm w-full sm:w-auto',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                  )}
                >
                  <option value="all">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="winner">Winner</option>
                </select>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {filteredEntries.length === 0 ? (
              <div className="py-16">
                <EmptyState
                  title={
                    searchQuery || statusFilter !== 'all'
                      ? 'No matching entries'
                      : 'No submissions yet'
                  }
                  description={
                    searchQuery || statusFilter !== 'all'
                      ? 'Try adjusting your search or filter.'
                      : 'When artists submit, their entries will appear here.'
                  }
                />
              </div>
            ) : (
              <div className="divide-y divide-border rounded-md border">
                {filteredEntries.map((entry) => (
                  <EntryRow
                    key={entry.id}
                    entry={entry}
                    onView={() => {
                      setSelectedEntry(entry);
                      setViewDialogOpen(true);
                    }}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDeleteEntry}
                    isUpdating={isUpdatingStatus}
                    formatRelative={formatRelative}
                    getEntryRowStyles={getEntryRowStyles}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Delete Contest Dialog ────────────────────────────── */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this contest?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove the contest and all {entries.length} submissions. This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteOpportunity}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Contest
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* ── Entry Detail Dialog ──────────────────────────────── */}
        <EntryDetailDialog
          entry={selectedEntry}
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
          onStatusChange={handleStatusChange}
          isUpdating={isUpdatingStatus}
          formatRelative={formatRelative}
        />
      </div>
    </TooltipProvider>
  );
}

// ── Sub-components ────────────────────────────────────────────

function EntryRow({
  entry,
  onView,
  onStatusChange,
  onDelete,
  isUpdating,
  formatRelative,
  getEntryRowStyles,
}: {
  entry: ExtendedContestEntry;
  onView: () => void;
  onStatusChange: (id: string, status: ContestEntry['status']) => void;
  onDelete: (id: string) => void;
  isUpdating: boolean;
  formatRelative: (date?: string) => string;
  getEntryRowStyles: (status: string) => string;
}) {
  return (
    <div
      className={cn(
        'group relative flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 transition-colors',
        'hover:bg-muted/60 cursor-pointer',
        getEntryRowStyles(entry.status)
      )}
      onClick={onView}
    >
      {/* Thumbnail */}
      <div className="flex-shrink-0">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border bg-muted shadow-sm">
          {entry.artwork_thumbnail_url ? (
            <img
              src={entry.artwork_thumbnail_url}
              alt={entry.artwork_title || 'Entry'}
              className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground/60 bg-gradient-to-br from-muted/50 to-muted/30">
              No preview
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-0.5 pr-20 sm:pr-0">
            <p className="font-medium leading-tight truncate">
              {entry.artwork_title || `Entry ${entry.artwork_id?.slice(0, 8) || '?'}`}
            </p>
            <p className="text-sm text-muted-foreground">
              by @{entry.creator_username || entry.creator_id?.slice(0, 8)}
            </p>
            {entry.submitted_at && (
              <p className="text-xs text-muted-foreground/75">
                {formatRelative(entry.submitted_at)}
              </p>
            )}
          </div>

          {/* Quick actions */}
          <div className="flex items-center gap-1 absolute right-4 top-4 sm:static sm:opacity-100 group-hover:opacity-100 opacity-70 sm:opacity-0 transition-opacity">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-100"
                  disabled={entry.status === 'approved' || isUpdating}
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusChange(entry.id, 'approved');
                  }}
                >
                  <Check className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Approve</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-100"
                  disabled={entry.status === 'rejected' || isUpdating}
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusChange(entry.id, 'rejected');
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reject</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Status badge */}
      <div className="sm:self-center mt-2 sm:mt-0">
        <StatusBadge status={entry.status} />
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'approved':
      return <Badge className="bg-green-600 hover:bg-green-600">Approved</Badge>;
    case 'rejected':
      return <Badge variant="destructive">Rejected</Badge>;
    case 'winner':
      return (
        <Badge className="bg-yellow-500 hover:bg-yellow-500 flex items-center gap-1">
          <Award className="h-3.5 w-3.5" /> Winner
        </Badge>
      );
    case 'pending':
      return <Badge variant="secondary">Pending</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function EntryDetailDialog({
  entry,
  open,
  onOpenChange,
  onStatusChange,
  isUpdating,
  formatRelative,
}: {
  entry: ExtendedContestEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (id: string, status: ContestEntry['status']) => void;
  isUpdating: boolean;
  formatRelative: (date?: string) => string;
}) {
  if (!entry) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[95vh] p-0 gap-0 sm:rounded-2xl overflow-hidden">
        <div className="flex flex-col lg:flex-row h-full">
          {/* Preview */}
          <div className="flex-1 bg-gradient-to-br from-black/5 to-transparent p-6 lg:p-10 flex items-center justify-center">
            {entry.artwork_file_url || entry.artwork_thumbnail_url ? (
              <img
                src={entry.artwork_file_url || entry.artwork_thumbnail_url}
                alt={entry.artwork_title || 'Artwork'}
                className="max-h-[75vh] max-w-full object-contain rounded-xl shadow-2xl ring-1 ring-black/5"
              />
            ) : (
              <div className="text-muted-foreground text-lg">No preview available</div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-96 border-l bg-card flex flex-col">
            <div className="p-6 flex-1 overflow-y-auto">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-xl font-semibold leading-tight">
                  {entry.artwork_title || `Entry ${entry.artwork_id?.slice(0, 8)}`}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-3 mt-2 flex-wrap">
                  <span>by @{entry.creator_username || entry.creator_id?.slice(0, 8)}</span>
                  <StatusBadge status={entry.status} />
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Submitted</p>
                    <p className="font-medium">{formatRelative(entry.submitted_at)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Entry ID</p>
                    <p className="font-mono text-xs break-all">{entry.id}</p>
                  </div>
                  {entry.rank != null && (
                    <div>
                      <p className="text-muted-foreground">Rank</p>
                      <p className="font-medium">#{entry.rank}</p>
                    </div>
                  )}
                </div>

                {entry.submission_notes && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Creator Notes</h4>
                    <p className="text-sm whitespace-pre-line leading-relaxed border-l-3 border-muted-foreground/30 pl-3">
                      {entry.submission_notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t p-4 flex gap-3 justify-end bg-muted/40">
              {entry.status !== 'approved' && (
                <Button
                  onClick={() => onStatusChange(entry.id, 'approved')}
                  disabled={isUpdating}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Approve
                </Button>
              )}
              {entry.status !== 'rejected' && (
                <Button
                  variant="outline"
                  onClick={() => onStatusChange(entry.id, 'rejected')}
                  disabled={isUpdating}
                >
                  <X className="mr-2 h-4 w-4" />
                  Reject
                </Button>
              )}
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-80" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-9" />
        </div>
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-7 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-6 w-32" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-7 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4 py-4 border-b last:border-0">
                <Skeleton className="h-24 w-24 rounded-lg" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-5 w-64" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
