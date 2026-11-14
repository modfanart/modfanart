// Campaigns → Contests: every contest on the platform (drafts and private
// ones included, via scope=all), with search, status filter, lifecycle moves
// and links to entries, leaderboard, prizes and edit.
//
// Before: listed only public, non-draft contests (no scope=all), had no
// search or paging, let staff set any status in any order from a dropdown,
// used window.confirm, and its edit button pointed at a route that didn't
// exist (/opportunity/:id/edit).
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Trophy, MagnifyingGlass, DotsThreeVertical } from '@phosphor-icons/react';
import { toast } from 'sonner';

import {
  useGetAllContestsQuery,
  useUpdateContestMutation,
  useDeleteContestMutation,
} from '../../services/api/opsApi';
import { useAuth } from '../../contexts/AuthContext';
import {
  PageShell,
  Panel,
  QueryState,
  Empty,
  Pager,
  DataTable,
  StatusPill,
  Pill,
  ConfirmDialog,
  inputClass,
  selectClass,
  dateOnly,
  errorMessage,
} from '../../components/workspace/kit';
import { Button } from '../../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';

const LIMIT = 25;
const STATUSES = ['draft', 'live', 'judging', 'completed', 'archived'];

// Moves that make sense from each state (the API accepts any listed status,
// but skipping phases strands entries and judges).
const NEXT = {
  draft: [{ to: 'live', label: 'Go live' }],
  live: [
    { to: 'judging', label: 'Close submissions → judging' },
    { to: 'draft', label: 'Back to draft' },
  ],
  judging: [{ to: 'completed', label: 'Mark completed' }],
  completed: [{ to: 'archived', label: 'Archive' }],
  archived: [],
};

export const OpportunitiesPage = () => {
  const navigate = useNavigate();
  const { can } = useAuth();
  const canManage = can('contests.manage');

  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [visibility, setVisibility] = useState('');
  const [offset, setOffset] = useState(0);
  const [confirm, setConfirm] = useState(null); // { contest, to } | { contest, delete: true }

  const contests = useGetAllContestsQuery(
    { search, status, visibility, limit: LIMIT, offset },
    { refetchOnMountOrArgChange: true }
  );
  const [updateContest, { isLoading: updating }] = useUpdateContestMutation();
  const [deleteContest, { isLoading: deleting }] = useDeleteContestMutation();

  const rows = contests.data?.contests ?? [];

  const run = async () => {
    const { contest } = confirm;
    try {
      if (confirm.delete) {
        await deleteContest(contest.id).unwrap();
        toast.success(`Deleted “${contest.title}”`);
      } else {
        await updateContest({ id: contest.id, status: confirm.to }).unwrap();
        toast.success(`“${contest.title}” is now ${confirm.to}`);
      }
      setConfirm(null);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not update the contest'));
    }
  };

  return (
    <PageShell
      title="Contests"
      subtitle={contests.data ? `${contests.data.total ?? rows.length} contests across all brands` : 'All brand contests'}
      testId="contests-page"
      actions={
        canManage && (
          <Button className="bg-white text-black hover:bg-zinc-200" onClick={() => navigate('/opportunity/add')}>
            <Plus className="mr-2 h-4 w-4" /> New contest
          </Button>
        )
      }
    >
      <Panel>
        <form
          className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-[1fr_auto_auto_auto]"
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(q.trim());
            setOffset(0);
          }}
        >
          <div className="relative">
            <MagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              aria-label="Search contests"
              className={`${inputClass} pl-9`}
              placeholder="Search by title or slug…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <select
            aria-label="Status"
            className={selectClass}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setOffset(0);
            }}
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            aria-label="Visibility"
            className={selectClass}
            value={visibility}
            onChange={(e) => {
              setVisibility(e.target.value);
              setOffset(0);
            }}
          >
            <option value="">Any visibility</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="unlisted">Unlisted</option>
          </select>
          <Button type="submit" size="sm" className="h-9 bg-white text-black hover:bg-zinc-200">
            Search
          </Button>
        </form>

        <QueryState
          query={contests}
          isEmpty={rows.length === 0}
          empty={<Empty icon={Trophy} title="No contests match" description="Try another status or search." />}
        >
          <DataTable
            rows={rows}
            onRowClick={(c) => navigate(`/opportunity/${c.id}`)}
            columns={[
              {
                key: 'title',
                header: 'Contest',
                cell: (c) => (
                  <div className="min-w-[12rem]">
                    <p className="font-medium text-white">{c.title}</p>
                    <p className="text-[11px] text-zinc-500">
                      {c.brand_name || 'Unknown brand'} · /{c.slug}
                    </p>
                  </div>
                ),
              },
              { key: 'status', header: 'Status', cell: (c) => <StatusPill status={c.status} /> },
              {
                key: 'visibility',
                header: 'Visibility',
                cell: (c) => <Pill tone={c.visibility === 'public' ? 'info' : 'neutral'}>{c.visibility}</Pill>,
              },
              {
                key: 'entries',
                header: 'Entries',
                className: 'text-right tabular-nums',
                cell: (c) => c.entry_count ?? 0,
              },
              {
                key: 'dates',
                header: 'Runs',
                className: 'whitespace-nowrap text-xs text-zinc-400',
                cell: (c) => `${dateOnly(c.start_date)} → ${dateOnly(c.submission_end_date)}`,
              },
              {
                key: 'actions',
                header: <span className="sr-only">Actions</span>,
                cell: (c) => (
                  <div onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label={`Actions for ${c.title}`}>
                          <DotsThreeVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="border-zinc-800 bg-zinc-900 text-zinc-200">
                        <DropdownMenuItem asChild>
                          <Link to={`/opportunity/${c.id}`}>Open</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`/opportunity/${c.id}/entries`}>Entries</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`/opportunity/${c.id}/leaderboard`}>Leaderboard</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`/campaigns/prizes?contest=${c.id}`}>Prizes</Link>
                        </DropdownMenuItem>
                        {canManage && (
                          <>
                            <DropdownMenuSeparator className="bg-zinc-800" />
                            <DropdownMenuItem asChild>
                              <Link to={`/opportunity/${c.id}/edit`}>Edit</Link>
                            </DropdownMenuItem>
                            {(NEXT[c.status] || []).length > 0 && (
                              <DropdownMenuLabel className="text-[11px] text-zinc-500">Move to</DropdownMenuLabel>
                            )}
                            {(NEXT[c.status] || []).map((n) => (
                              <DropdownMenuItem key={n.to} onSelect={() => setConfirm({ contest: c, to: n.to })}>
                                {n.label}
                              </DropdownMenuItem>
                            ))}
                            {!['live', 'judging', 'completed'].includes(c.status) && (
                              <>
                                <DropdownMenuSeparator className="bg-zinc-800" />
                                <DropdownMenuItem
                                  className="text-red-300"
                                  onSelect={() => setConfirm({ contest: c, delete: true })}
                                >
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ),
              },
            ]}
          />
          <Pager offset={offset} limit={LIMIT} total={contests.data?.total} count={rows.length} onChange={setOffset} />
        </QueryState>
      </Panel>

      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={
          confirm?.delete
            ? `Delete “${confirm.contest.title}”?`
            : confirm
              ? `Move “${confirm.contest.title}” to ${confirm.to}?`
              : ''
        }
        description={
          confirm?.delete
            ? 'The contest is archived and hidden everywhere. Live, judging and completed contests cannot be deleted.'
            : confirm?.to === 'judging'
              ? 'Submissions close and assigned judges can start scoring.'
              : confirm?.to === 'live'
                ? 'The contest becomes visible (if public) and open for entries.'
                : 'The brand and entrants will see the new status.'
        }
        confirmLabel={confirm?.delete ? 'Delete' : 'Confirm'}
        tone={confirm?.delete ? 'danger' : undefined}
        busy={updating || deleting}
        onConfirm={run}
      />
    </PageShell>
  );
};

export default OpportunitiesPage;
