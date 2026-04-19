'use client';

import {
  ArrowLeft,
  Check,
  Edit,
  Eye,
  MoreHorizontal,
  Trash2,
  X,
  Briefcase,
  Search,
  UserPlus,
  UserMinus,
  Trophy,
  Plus,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import {
  useGetContestQuery,
  useGetContestEntriesQuery,
  useDeleteContestMutation,
  useUpdateEntryStatusMutation,
  useDeleteContestEntryMutation,
  useAssignJudgeMutation,
  useRemoveJudgeMutation,
  useGetContestJudgesQuery,
} from '@/services/api/contestsApi';

import { useGetUsersByRoleSlugQuery, useCreateUserMutation } from '@/services/api/userApi';

interface ExtendedContestEntry extends ContestEntry {
  artwork_title?: string;
  artwork_thumbnail_url?: string;
  artwork_file_url?: string;
  creator_username?: string;
  creator_avatar?: string;
  submitted_at?: string;
}

export function ManageOpportunityContent({ opportunityId }: { opportunityId: string }) {
  const router = useRouter();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedEntry, setSelectedEntry] = useState<ExtendedContestEntry | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [assignJudgeOpen, setAssignJudgeOpen] = useState(false);
  const [judgeSearch, setJudgeSearch] = useState('');
  const [showCreateJudgeForm, setShowCreateJudgeForm] = useState(false);

  // New Judge Form State
  const [newJudgeData, setNewJudgeData] = useState({
    username: '',
    email: '',
    bio: '',
  });

  // Queries
  const { data: opportunity, isLoading: oppLoading } = useGetContestQuery(opportunityId);
  const { data: entriesResponse, isLoading: entriesLoading } = useGetContestEntriesQuery({
    contestId: opportunityId,
  });
  const { data: judgesData, isLoading: judgesLoading } = useGetContestJudgesQuery(opportunityId);

  // Fetch users with 'judge' role
  const { data: judgesPoolData, isLoading: judgesPoolLoading } = useGetUsersByRoleSlugQuery({
    roleSlug: 'judge',
    limit: 100,
  });

  const entries: ExtendedContestEntry[] = useMemo(
    () => (Array.isArray(entriesResponse) ? entriesResponse : (entriesResponse?.entries ?? [])),
    [entriesResponse]
  );

  const judges = useMemo(() => judgesData?.judges || judgesData || [], [judgesData]);

  const availableJudges = useMemo(() => {
    const assignedIds = new Set(judges.map((j: any) => j.user_id || j.judge_id || j.id));
    return (judgesPoolData?.users || []).filter((user: any) => !assignedIds.has(user.id));
  }, [judgesPoolData, judges]);

  // Mutations
  const [deleteContest] = useDeleteContestMutation();
  const [updateEntryStatus, { isLoading: isUpdatingStatus }] = useUpdateEntryStatusMutation();
  const [deleteEntry] = useDeleteContestEntryMutation();
  const [assignJudge] = useAssignJudgeMutation();
  const [removeJudge] = useRemoveJudgeMutation();
  const [createUser] = useCreateUserMutation();

  // Handlers
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
        if (selectedEntry?.id === entryId) setViewDialogOpen(false);
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

  const handleAssignJudge = async (userId: string) => {
    try {
      await assignJudge({ contestId: opportunityId, userId: userId.trim() }).unwrap();
      setAssignJudgeOpen(false);
      setJudgeSearch('');
    } catch (err: any) {
      console.error('Failed to assign judge:', err);
      alert(err?.data?.message || 'Failed to assign judge');
    }
  };

  const handleCreateAndAssignJudge = async () => {
    if (!newJudgeData.username.trim() || !newJudgeData.email.trim()) {
      alert('Username and Email are required');
      return;
    }

    try {
      const createdUser = await createUser({
        username: newJudgeData.username.trim(),
        email: newJudgeData.email.trim(),
        bio: newJudgeData.bio.trim() || undefined,
        role: 'judge',
      }).unwrap();

      // Auto assign the newly created judge
      await assignJudge({
        contestId: opportunityId,
        userId: createdUser.user.id,
      }).unwrap();

      // Reset form
      setNewJudgeData({ username: '', email: '', bio: '' });
      setShowCreateJudgeForm(false);
      setAssignJudgeOpen(false);
    } catch (err: any) {
      console.error('Failed to create and assign judge:', err);
      alert(err?.data?.message || 'Failed to create judge');
    }
  };

  const handleRemoveJudge = async (userId: string) => {
    if (!confirm('Remove this judge from the contest?')) return;
    try {
      await removeJudge({ contestId: opportunityId, userId }).unwrap();
    } catch (err) {
      console.error('Failed to remove judge:', err);
    }
  };

  const formatRelative = (date?: string) =>
    date ? formatDistanceToNow(new Date(date), { addSuffix: true }) : '—';

  const getEntryRowStyles = (status: string) => {
    switch (status) {
      case 'approved':
        return 'border-l-4 border-l-green-500 bg-green-50/40';
      case 'rejected':
        return 'border-l-4 border-l-red-500 bg-red-50/30';
      case 'winner':
        return 'border-l-4 border-l-amber-500 bg-amber-50/50';
      case 'pending':
      default:
        return 'border-l-4 border-l-gray-300';
    }
  };

  const getContestStatusBadgeVariant = (status: string) => {
    const map: Record<string, string> = {
      live: 'bg-green-100 text-green-800',
      published: 'bg-green-100 text-green-800',
      judging: 'bg-purple-100 text-purple-800',
      completed: 'bg-blue-100 text-blue-800',
      archived: 'bg-gray-100 text-gray-800',
      draft: 'bg-amber-100 text-amber-800',
    };
    return map[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredEntries = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return entries.filter((e) => {
      const matchesSearch =
        !q ||
        e.artwork_title?.toLowerCase().includes(q) ||
        e.creator_username?.toLowerCase().includes(q) ||
        e.id?.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [entries, searchQuery, statusFilter]);

  if (oppLoading || entriesLoading || judgesLoading) {
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
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild className="-ml-2">
              <Link href="/dashboard/opportunities">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-bold tracking-tight">{opportunity.title}</h1>
                <Badge
                  variant="outline"
                  className={cn(
                    'px-4 py-1 text-sm font-medium capitalize',
                    getContestStatusBadgeVariant(opportunity.status)
                  )}
                >
                  {opportunity.status}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1">Manage submissions and judges</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/contests/${opportunityId}`} target="_blank" rel="noopener noreferrer">
                <Eye className="mr-2 h-4 w-4" />
                View Public Page
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/opportunities/${opportunityId}/edit`}>
                    <Edit className="mr-2 h-4 w-4" /> Edit Contest
                  </Link>
                </DropdownMenuItem>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete Contest
                  </DropdownMenuItem>
                </AlertDialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Overview Card */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" /> Contest Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Brand</p>
              <p className="font-medium mt-1">{opportunity.brand_name || '—'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Submission Deadline</p>
              <p className="font-medium mt-1">
                {opportunity.submission_end_date
                  ? new Date(opportunity.submission_end_date).toLocaleDateString('en-IN')
                  : '—'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Max Entries/User</p>
              <p className="font-medium mt-1">{opportunity.max_entries_per_user || 1}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Submissions</p>
              <p className="text-2xl font-bold text-primary">{entries.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Judges Assigned</p>
              <p className="text-2xl font-bold">{judges.length}</p>
            </div>
          </CardContent>

          {opportunity.description && (
            <>
              <Separator />
              <CardContent className="pt-6">
                <h4 className="font-medium mb-2 text-sm uppercase tracking-widest text-muted-foreground">
                  Description
                </h4>
                <p className="text-muted-foreground whitespace-pre-line">
                  {opportunity.description}
                </p>
              </CardContent>
            </>
          )}
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="submissions" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="submissions">Submissions ({entries.length})</TabsTrigger>
            <TabsTrigger value="judges">Judges ({judges.length})</TabsTrigger>
          </TabsList>

          {/* Submissions Tab */}
          <TabsContent value="submissions" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <CardTitle>Submissions</CardTitle>
                  <div className="flex gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-80">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search artwork, creator..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="h-10 rounded-md border px-3 text-sm bg-background"
                    >
                      <option value="all">All Status</option>
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
                  <EmptyState
                    title={
                      searchQuery || statusFilter !== 'all'
                        ? 'No matching submissions'
                        : 'No submissions yet'
                    }
                    description="When creators submit their artwork, they will appear here."
                  />
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
          </TabsContent>

          {/* Judges Tab */}
          <TabsContent value="judges" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Assigned Judges</CardTitle>
                <Button onClick={() => setAssignJudgeOpen(true)} className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Assign Judge
                </Button>
              </CardHeader>
              <CardContent>
                {judges.length === 0 ? (
                  <EmptyState
                    title="No judges assigned yet"
                    description="Assign judges to help evaluate and score submissions."
                  />
                ) : (
                  <div className="space-y-3">
                    {judges.map((judge: any) => (
                      <div
                        key={judge.user_id || judge.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={judge.avatar_url} />
                            <AvatarFallback>
                              {(judge.name || judge.username || 'J')[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{judge.name || judge.username}</p>
                            <p className="text-sm text-muted-foreground">@{judge.username}</p>
                            <p className="text-xs text-muted-foreground">
                              Assigned {formatRelative(judge.assigned_at)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Badge variant={judge.accepted ? 'default' : 'secondary'}>
                            {judge.accepted ? 'Accepted' : 'Invitation Pending'}
                          </Badge>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveJudge(judge.user_id || judge.id)}
                          >
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Delete Contest Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this contest?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will permanently delete the contest and all {entries.length}{' '}
                submissions. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteOpportunity}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Yes, Delete Contest
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Assign Judge Dialog */}
        <Dialog open={assignJudgeOpen} onOpenChange={setAssignJudgeOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Assign Judge</DialogTitle>
              <DialogDescription>
                Choose an existing judge or create a new one for this contest.
              </DialogDescription>
            </DialogHeader>

            {!showCreateJudgeForm ? (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by username or email..."
                    value={judgeSearch}
                    onChange={(e) => setJudgeSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="max-h-96 overflow-y-auto mt-4 space-y-2 pr-2">
                  {judgesPoolLoading ? (
                    <p className="text-center py-12 text-muted-foreground">
                      Loading available judges...
                    </p>
                  ) : availableJudges.length === 0 ? (
                    <p className="text-center py-12 text-muted-foreground">
                      No available judges found.
                    </p>
                  ) : (
                    availableJudges
                      .filter(
                        (user: any) =>
                          !judgeSearch ||
                          user.username?.toLowerCase().includes(judgeSearch.toLowerCase()) ||
                          user.email?.toLowerCase().includes(judgeSearch.toLowerCase())
                      )
                      .map((user: any) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-4 hover:bg-muted rounded-xl cursor-pointer border"
                          onClick={() => handleAssignJudge(user.id)}
                        >
                          <div className="flex items-center gap-4">
                            <Avatar className="h-11 w-11">
                              <AvatarImage src={user.avatar_url} />
                              <AvatarFallback>{user.username?.[0]?.toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">@{user.username}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            Assign
                          </Button>
                        </div>
                      ))
                  )}
                </div>

                <div className="flex justify-center mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateJudgeForm(true)}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Create New Judge
                  </Button>
                </div>
              </>
            ) : (
              /* Create New Judge Form */
              <div className="space-y-4 py-2">
                <Input
                  placeholder="Username *"
                  value={newJudgeData.username}
                  onChange={(e) => setNewJudgeData({ ...newJudgeData, username: e.target.value })}
                />
                <Input
                  type="email"
                  placeholder="Email Address *"
                  value={newJudgeData.email}
                  onChange={(e) => setNewJudgeData({ ...newJudgeData, email: e.target.value })}
                />
                <Input
                  placeholder="Bio (optional)"
                  value={newJudgeData.bio}
                  onChange={(e) => setNewJudgeData({ ...newJudgeData, bio: e.target.value })}
                />

                <DialogFooter className="mt-6">
                  <Button variant="outline" onClick={() => setShowCreateJudgeForm(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateAndAssignJudge}
                    disabled={!newJudgeData.username.trim() || !newJudgeData.email.trim()}
                  >
                    Create & Assign Judge
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Entry Detail Dialog */}
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

/* ====================== SUB COMPONENTS ====================== */

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
        'group flex flex-col sm:flex-row gap-4 p-5 hover:bg-muted/60 transition-all cursor-pointer border-l-4',
        getEntryRowStyles(entry.status)
      )}
      onClick={onView}
    >
      <div className="flex-shrink-0">
        <div className="w-24 h-24 rounded-xl overflow-hidden border bg-muted">
          {entry.artwork_thumbnail_url ? (
            <img
              src={entry.artwork_thumbnail_url}
              alt={entry.artwork_title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
              No Preview
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-semibold text-lg leading-tight line-clamp-2">
              {entry.artwork_title || `Entry #${entry.id.slice(0, 8)}`}
            </p>
            <p className="text-sm text-muted-foreground">
              by @{entry.creator_username || entry.creator_id?.slice(0, 8)}
            </p>
          </div>
          <StatusBadge status={entry.status} />
        </div>

        {entry.submitted_at && (
          <p className="text-xs text-muted-foreground">
            Submitted {formatRelative(entry.submitted_at)}
          </p>
        )}
      </div>

      <div className="flex gap-1 self-start sm:self-center opacity-70 group-hover:opacity-100 transition-opacity">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-green-600 hover:text-green-700"
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
              className="text-red-600 hover:text-red-700"
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
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'approved':
      return <Badge className="bg-green-600">Approved</Badge>;
    case 'rejected':
      return <Badge variant="destructive">Rejected</Badge>;
    case 'winner':
      return (
        <Badge className="bg-amber-500 flex items-center gap-1">
          <Trophy className="h-3.5 w-3.5" /> Winner
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
      <DialogContent className="max-w-5xl p-0 overflow-hidden max-h-[95vh]">
        <div className="flex flex-col lg:flex-row h-full">
          {/* Artwork Preview */}
          <div className="flex-1 bg-black/5 p-8 flex items-center justify-center">
            {entry.artwork_file_url || entry.artwork_thumbnail_url ? (
              <img
                src={entry.artwork_file_url || entry.artwork_thumbnail_url}
                alt={entry.artwork_title}
                className="max-h-[80vh] max-w-full object-contain rounded-2xl shadow-2xl"
              />
            ) : (
              <p className="text-muted-foreground">No preview available</p>
            )}
          </div>

          {/* Sidebar Info */}
          <div className="w-full lg:w-96 border-l bg-card flex flex-col">
            <div className="p-6 flex-1 overflow-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">{entry.artwork_title}</DialogTitle>
                <DialogDescription className="flex items-center gap-2 mt-2">
                  by @{entry.creator_username} • {formatRelative(entry.submitted_at)}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-8 space-y-6 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Status</p>
                  <StatusBadge status={entry.status} />
                </div>

                {entry.rank && (
                  <div>
                    <p className="text-muted-foreground mb-1">Rank</p>
                    <p className="font-semibold text-lg">#{entry.rank}</p>
                  </div>
                )}

                {entry.submission_notes && (
                  <div>
                    <p className="text-muted-foreground mb-2">Creator Notes</p>
                    <p className="border-l-4 border-muted pl-4 italic text-muted-foreground">
                      {entry.submission_notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t p-4 flex gap-3">
              {entry.status !== 'approved' && (
                <Button
                  onClick={() => onStatusChange(entry.id, 'approved')}
                  disabled={isUpdating}
                  className="flex-1 bg-green-600 hover:bg-green-700"
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
                  className="flex-1"
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
      <Skeleton className="h-12 w-3/4" />
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent className="grid grid-cols-5 gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-40" />
        </CardHeader>
        <CardContent>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 mb-4" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
