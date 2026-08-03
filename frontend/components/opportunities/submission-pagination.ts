// Pure helpers for the brand Monitor "View All" submissions list. Extracted
// from manage-opportunity-content.tsx so the pagination/accumulation logic can
// be unit-tested without a React/Next runtime.
import type { ContestEntry } from '@/services/api/contestsApi';

// How many submissions to pull per "Load more" click. Sized to the 3-column
// grid so each page fills whole rows.
export const PAGE_SIZE = 24;

export interface ExtendedContestEntry extends ContestEntry {
  artwork_title?: string | undefined;
  artwork_thumbnail_url?: string | undefined;
  artwork_file_url?: string | undefined;
  creator_username?: string | undefined;
  creator_avatar?: string | undefined;
  submitted_at?: string | undefined;
}

// The API returns entries with nested artwork/creator objects, but EntryRow and
// the detail dialog read flat fields. Populate the flat fields (keeping the
// nested ones) so rows show the real title, creator, thumbnail and date.
export function normalizeEntry(entry: ContestEntry): ExtendedContestEntry {
  return {
    ...entry,
    artwork_title: entry.artwork?.title,
    artwork_thumbnail_url: entry.artwork?.thumbnail_url ?? undefined,
    artwork_file_url: entry.artwork?.file_url,
    creator_username: entry.creator?.username,
    creator_avatar: entry.creator?.avatar_url ?? undefined,
    submitted_at: entry.created_at,
  };
}

// Fold a freshly fetched page into the accumulated list. Page 0 replaces (fresh
// filter/search, or refreshed data); later pages append. Dedupe by id so a
// StrictMode double-invoke or a post-mutation refetch cannot double-append.
export function foldEntriesPage(
  prev: ExtendedContestEntry[],
  pageEntries: ContestEntry[],
  offset: number
): ExtendedContestEntry[] {
  const normalized = pageEntries.map(normalizeEntry);
  if (offset === 0) return normalized;
  const seen = new Set(prev.map((e) => e.id));
  return [...prev, ...normalized.filter((e) => !seen.has(e.id))];
}

export interface EntriesQueryArgs {
  contestId: string;
  limit: number;
  offset: number;
  status?: string;
  search?: string;
}

// Build the RTK Query args. status/search are only sent when set, so an
// unfiltered request stays a clean `?limit&offset`.
export function buildEntriesQueryArgs(params: {
  contestId: string;
  offset: number;
  statusFilter: string;
  search: string;
}): EntriesQueryArgs {
  const { contestId, offset, statusFilter, search } = params;
  return {
    contestId,
    limit: PAGE_SIZE,
    offset,
    ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
    ...(search ? { search } : {}),
  };
}
