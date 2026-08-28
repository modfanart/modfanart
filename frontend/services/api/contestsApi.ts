// src/services/api/contestApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '..';

// ────────────────────────────────────────────────
// Core Types
// ────────────────────────────────────────────────
export type Visibility = 'public' | 'private' | 'unlisted';
export type Status = 'draft' | 'published' | 'live' | 'judging' | 'completed' | 'archived';

export interface Contest {
  id: string;
  brand_id: string;
  title: string;
  slug: string;
  description: string;
  rules?: string | null;

  // Visual Fields
  hero_image?: string | null;
  gallery?: string[];

  // Prizes (USD only)
  prizes: Array<{
    rank: number;
    type: string;
    description?: string;
    amount_usd?: number;
  }> | null;

  start_date: string;
  submission_end_date: string;
  voting_end_date?: string | null;
  judging_end_date?: string | null;

  status: Status;
  visibility: Visibility;

  max_entries_per_user: number;
  winner_announced: boolean;

  entry_requirements: { instructions?: string } | null;
  judging_criteria: { criteria: string[] } | null;
  categories?: string[];

  // Brand Info (populated)
  brand_name?: string | null;
  brand_logo?: string | null;
  brand_slug?: string | null;

  // Stats
  view_count?: number;
  entry_count?: number;
  judges_count?: number;

  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface ContestDetail extends Contest {
  // Additional populated fields if needed
}

export interface GetContestsResponse {
  contests: Contest[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface Artwork {
  id: string;
  title: string;
  description: string;
  file_url: string;
  thumbnail_url: string | null;
  preview_url: string | null;
  slug: string | null;
  status: string;
  moderation_status: string;
  views_count: number;
  favorites_count: number;
  created_at: string;
  updated_at: string;
  // Held in join tables (artwork_categories, and the polymorphic taggings), so
  // both endpoints resolve them to names. Optional because older cached
  // responses and the artwork endpoints do not include them.
  categories?: Array<{ id: string; name: string; slug: string }>;
  tags?: Array<{ id: string; name: string; slug: string }>;
}

export interface ArtworkCreator {
  id: string;
  username: string;
  avatar_url: string | null;
}

export interface GenerateJudgeInviteLinkResponse {
  invite_url: string;
  expires_at: string;
  email_sent: boolean;
}

export interface GenerateJudgeInviteLinkArgs {
  contestId: string;
  judgeId: string;
}

export interface GenerateSelfAssignLinkResponse {
  invite_url: string;
  expires_at: string;
}

export interface GenerateSelfAssignLinkArgs {
  contestId: string;
}

export interface GenerateOpenLinkResponse {
  invite_url: string;
  expires_at: string;
}

export interface GenerateOpenLinkArgs {
  contestId: string;
}

export interface RedeemJudgeInviteResponse {
  success: boolean;
  contest_id: string;
  redirect_to: string;
}

export interface RedeemJudgeInviteArgs {
  token: string;
}

<<<<<<< HEAD
=======
/**
 * Where a selected winner's licensing agreement is, set manually by the brand
 * in the Licensing tab. 'finalized' is terminal and is what admits the artwork
 * to the public gallery. Mirrors the backend LICENSING_STATUSES allowlist.
 */
export type LicensingStatus =
  | 'not_started'
  | 'agreement_sent'
  | 'signed'
  | 'declined'
  | 'expired'
  | 'finalized';

>>>>>>> 8f5c3620965f1ac1ad78ff2c5adf1f4a674d1386
export interface ContestEntry {
  id: string;
  status: 'pending' | 'approved' | 'rejected' | 'disqualified' | 'winner';
  rank: number | null;
<<<<<<< HEAD
=======
  licensing_status: LicensingStatus;
>>>>>>> 8f5c3620965f1ac1ad78ff2c5adf1f4a674d1386
  // Packed by packSubmissionNotes: the entrant's note plus a trailing
  // "Fandom / Original IP: ..." line. Use unpackSubmissionNotes to display.
  // The API has returned this since the note feature landed; it was missing
  // from this interface, which hid the field from every consumer.
  submission_notes: string | null;
  created_at: string;
  updated_at: string;

  artwork: Artwork;
  creator: ArtworkCreator;

  judge_score: number | null;
  judge_comments: string | null;
}

/**
 * One entry with the detail the single-entry endpoint adds and the list
 * endpoint does not: the submitter's email, and the parent contest.
 */
export interface ContestEntryDetail extends ContestEntry {
  contest: { id: string; title: string };
  // display_name comes from the users.profile blob and is null for accounts
  // that never set one, so clients fall back to username.
  creator: ArtworkCreator & { email: string | null; display_name: string | null };
  // Category and tags are submission-form fields held in join tables, so the
  // detail endpoint resolves them to names rather than returning bare ids.
  artwork: Artwork & {
    categories: Array<{ id: string; name: string; slug: string }>;
    tags: Array<{ id: string; name: string; slug: string }>;
  };
}

// ────────────────────────────────────────────────
// API Request Types
// ────────────────────────────────────────────────

export interface CreateContestRequest {
  brand_id: string;
  title: string;
  slug: string;
  description: string;

  // Visual Fields
  hero_image?: string | null;
  gallery?: string[];

  rules?: string | null;

  // Prizes
  prizes?: Array<{
    rank: number;
    type: string;
    description?: string;
    amount_usd?: number;
  }> | null;

  start_date: string;
  submission_end_date: string;
  voting_end_date?: string | null;
  judging_end_date?: string | null;

  entry_requirements?: { instructions?: string } | null;
  judging_criteria?: { criteria: string[] } | null;
  categories?: string[];

  visibility: Visibility;
  status: Status;

  max_entries_per_user?: number;
  winner_announced?: boolean;
}

export interface UpdateContestRequest {
  id: string;
  title?: string;
  slug?: string;
  description?: string;

  // Visual Fields
  hero_image?: string | null;
  gallery?: string[];

  rules?: string | null;

  // Prizes
  prizes?: Array<{
    rank: number;
    type: string;
    description?: string;
    amount_usd?: number;
  }> | null;

  start_date?: string;
  submission_end_date?: string;
  voting_end_date?: string | null;
  judging_end_date?: string | null;

  entry_requirements?: { instructions?: string } | null;
  judging_criteria?: { criteria: string[] } | null;
  categories?: string[];

  visibility?: Visibility;
  status?: Status;

  max_entries_per_user?: number;
  winner_announced?: boolean;
}
export interface ContestJudge {
  contest_id: string;
  judge_id: string;
  invited_by?: string | null;
  accepted: boolean;
}

export interface ContestJudgeScore {
  entry_id: string;
  judge_id: string;
  score: number;
  comments?: string | null;
  created_at: string;
}

export interface LeaderboardEntry {
  entry_id: string;
  artwork_id: string;
  creator_id: string;
  status: string;
  /** Competition ranking, so equal averages share a rank: 1, 2, 2, 4. */
  rank: number;
  /** Mean of the judges who scored this entry, not the sum. */
  score_judge: number;
  /** How many judges actually reached it. Needed to read score_judge fairly. */
  judge_count: number;
  artwork_title?: string;
  artwork_thumbnail?: string | null;
  artwork_file_url?: string;
  creator_username?: string;
  creator_avatar?: string | null;
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  /** Entries with at least one score. Entries with none are not ranked. */
  scored_total: number;
  /** Every approved entry, scored or not, so the gap is visible. */
  approved_total: number;
  /**
   * Judges who have actually scored something, not judges who accepted an
   * invitation. A reviewer invited only to view the finalists is an accepted
   * judge who never scores, and must not count towards coverage.
   */
  judges_scoring: number;
}

export interface ArtistContestEntry extends Contest {
  my_entry: {
    entry_id: string;
    submitted_at: string;
    entry_status: 'pending' | 'approved' | 'rejected' | 'disqualified' | 'winner';
    rank?: number | null;
  } | null;
  entry_count?: number;
}

export interface GetMySubmittedContestsResponse {
  contests: ArtistContestEntry[];
  total?: number;
}

// ────────────────────────────────────────────────
// RTK Query API
// ────────────────────────────────────────────────

const contestsApi = createApi({
  reducerPath: 'contestsApi',

  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}`,
    prepareHeaders: (headers, { getState }) => {
      const token =
        (getState() as any)?.auth?.accessToken ?? (getState() as any)?.auth?.token ?? null;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
    credentials: 'include',
  }),

  tagTypes: [
    'Contests',
    'Contest',
    'ContestEntries',
    'ContestEntry',
    'ContestCategories',
    'ContestJudges',
    'ContestScores',
    'ContestVotes',
    'Leaderboard',
    'JudgeContests',
    'MyContestEntries',
    'MySubmittedContests',
    'Artwork',
  ],

  endpoints: (builder) => ({
    // Listing & Detail
    getContests: builder.query<
      GetContestsResponse,
      { status?: string; brandId?: string; activeOnly?: boolean; limit?: number } | void
    >({
      query: (params) => ({
        url: '/contest',
        params: params || {},
      }),
      providesTags: ['Contests'],
    }),

    getContest: builder.query<ContestDetail, string>({
      query: (id) => `/contest/${id}`,
      providesTags: (result, error, id) => [{ type: 'Contest', id }, 'Contests'],
    }),

    getContestsByStatus: builder.query<
      GetContestsResponse,
      {
        status?: string;
        visibility?: 'public' | 'private' | 'unlisted';
        brand_id?: string;
        page?: number;
        limit?: number;
        sort?: string;
        order?: 'asc' | 'desc';
      }
    >({
      query: (params) => ({
        url: '/contests/by-status',
        params: {
          ...params,
          visibility: params.visibility ?? 'public',
          limit: params.limit ?? 20,
        },
      }),
      providesTags: ['Contests'],
    }),

    // CRUD
    createContest: builder.mutation<Contest, CreateContestRequest>({
      query: (body) => ({
        url: '/contest',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Contests'],
    }),

    updateContest: builder.mutation<Contest, UpdateContestRequest>({
      query: ({ id, ...patch }) => ({
        url: `/contest/${id}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Contest', id }, 'Contests'],
    }),

    deleteContest: builder.mutation<{ success: boolean; message?: string }, string>({
      query: (id) => ({
        url: `/contest/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => ['Contests', { type: 'Contest', id }],
    }),
    // Categories
    getContestCategories: builder.query<string[], string>({
      query: (contestId) => `/contest/${contestId}/categories`,
      providesTags: (result, error, contestId) => [{ type: 'ContestCategories', id: contestId }],
    }),

    addCategoryToContest: builder.mutation<
      { success: boolean },
      { contestId: string; categoryId: string }
    >({
      query: ({ contestId, categoryId }) => ({
        url: `/contest/${contestId}/categories`,
        method: 'POST',
        body: { categoryId },
      }),
      invalidatesTags: (result, error, { contestId }) => [
        { type: 'ContestCategories', id: contestId },
        { type: 'Contest', id: contestId },
      ],
    }),

    removeCategoryFromContest: builder.mutation<
      { success: boolean },
      { contestId: string; categoryId: string }
    >({
      query: ({ contestId, categoryId }) => ({
        url: `/contest/${contestId}/categories/${categoryId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { contestId }) => [
        { type: 'ContestCategories', id: contestId },
        { type: 'Contest', id: contestId },
      ],
    }),

    // Entries
    submitEntry: builder.mutation<
      ContestEntry,
      { contestId: string; artworkId: string; submissionNotes?: string | null }
    >({
      query: ({ contestId, artworkId, submissionNotes }) => ({
        url: `/contest/${contestId}/entries`,
        method: 'POST',
        body: { artworkId, submissionNotes },
      }),
      invalidatesTags: (result, error, { contestId }) => [
        { type: 'ContestEntries', id: contestId },
        { type: 'Contest', id: contestId },
      ],
    }),

getContestEntries: builder.query<
  { entries: ContestEntry[]; total?: number },
  { contestId: string; status?: string; search?: string; limit?: number; offset?: number }
>({
  query: ({ contestId, ...params }) => ({
    url: `/contest/${contestId}/entries`,
    params,
  }),
  providesTags: (result, error, { contestId }) => [
    { type: 'ContestEntries', id: contestId },
  ],
}),

    // Single entry, for the brand's submission detail view. Separate from
    // getContestEntries because that one is paginated and status-filtered, so
    // an arbitrary entry is not reliably present in its cache.
    getContestEntry: builder.query<
      { entry: ContestEntryDetail },
      { contestId: string; entryId: string }
    >({
      query: ({ contestId, entryId }) => ({
        url: `/contest/${contestId}/entries/${entryId}`,
      }),
      providesTags: (result, error, { contestId }) => [
        { type: 'ContestEntries', id: contestId },
      ],
    }),

    updateEntryStatus: builder.mutation<
      ContestEntry,
      { contestId: string; entryId: string; status: ContestEntry['status'] }
    >({
      query: ({ contestId, entryId, status }) => ({
        url: `/contest/${contestId}/entries/${entryId}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (result, error, { contestId, entryId }) => [
        { type: 'ContestEntries', id: contestId },
        { type: 'ContestEntry', id: entryId },
        { type: 'Contest', id: contestId },
      ],
    }),

<<<<<<< HEAD
=======
    // Manual licensing tracking for selected winners (Licensing tab). Kept
    // separate from updateEntryStatus: different endpoint, different
    // authorization (brand owner / contests.manage only - judges are out).
    updateEntryLicensingStatus: builder.mutation<
      { entry: { id: string; status: string; rank: number | null; licensing_status: LicensingStatus } },
      { contestId: string; entryId: string; licensing_status: LicensingStatus }
    >({
      query: ({ contestId, entryId, licensing_status }) => ({
        url: `/contest/${contestId}/entries/${entryId}/licensing-status`,
        method: 'PATCH',
        body: { licensing_status },
      }),
      invalidatesTags: (result, error, { contestId, entryId }) => [
        { type: 'ContestEntries', id: contestId },
        { type: 'ContestEntry', id: entryId },
      ],
    }),

>>>>>>> 8f5c3620965f1ac1ad78ff2c5adf1f4a674d1386
    getMyContestEntries: builder.query<
      { entries: any[]; total?: number },
      { status?: string; contestId?: string; limit?: number; offset?: number } | void
    >({
      query: (params) => ({
        url: '/contest/me/contest-entries',
        params: params || {},
      }),
      providesTags: ['MyContestEntries'],
    }),

    deleteContestEntry: builder.mutation<
      { success: boolean; message?: string },
      { contestId: string; entryId: string }
    >({
      query: ({ contestId, entryId }) => ({
        url: `/contest/${contestId}/entries/${entryId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ContestEntries', 'MyContestEntries', 'Contest'],
    }),

    getMySubmittedContests: builder.query<
      GetMySubmittedContestsResponse,
      { status?: string; limit?: number } | void
    >({
      query: (params) => ({
        url: '/contest/my-submitted',
        params: params || {},
      }),
      providesTags: ['MySubmittedContests', 'Contests'],
    }),

    // Judges
    getContestJudges: builder.query<any, string>({
      query: (contestId) => `/contest/${contestId}/judges`,
      providesTags: (result, error, contestId) => [{ type: 'ContestJudges', id: contestId }],
    }),

    assignJudge: builder.mutation<any, { contestId: string; userId: string }>({
      query: ({ contestId, userId }) => ({
        url: `/contest/${contestId}/judges`,
        method: 'POST',
        body: { judgeId: userId }, // ✅ FIX
      }),
    }),
    generateJudgeInviteLink: builder.mutation<GenerateJudgeInviteLinkResponse, GenerateJudgeInviteLinkArgs>({
      query: ({ contestId, judgeId }) => ({
        url: `/contest/${contestId}/judges/${judgeId}/invite-link`,
        method: 'POST',
      }),
    }),
    generateSelfAssignLink: builder.mutation<GenerateSelfAssignLinkResponse, GenerateSelfAssignLinkArgs>({
      query: ({ contestId }) => ({
        url: `/contest/${contestId}/judges/self-assign-link`,
        method: 'POST',
      }),
    }),
    generateOpenLink: builder.mutation<GenerateOpenLinkResponse, GenerateOpenLinkArgs>({
      query: ({ contestId }) => ({
        url: `/contest/${contestId}/judges/open-link`,
        method: 'POST',
      }),
    }),
    redeemJudgeInvite: builder.mutation<RedeemJudgeInviteResponse, RedeemJudgeInviteArgs>({
      query: ({ token }) => ({
        url: `/contest/judge-invite/${token}/redeem`,
        method: 'POST',
      }),
      invalidatesTags: ['JudgeContests'],
    }),
    getJudgeInvitations: builder.query<{ contests: Contest[] }, void>({
      query: () => '/contest/judge/invitations',
      providesTags: ['JudgeContests'],
    }),
    acceptJudgeInvitation: builder.mutation<any, { contestId: string; judgeId: string }>({
      query: ({ contestId, judgeId }) => ({
        url: `/contest/${contestId}/judges/${judgeId}/accept`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, { contestId }) => [{ type: 'ContestJudges', id: contestId }],
    }),

    removeJudge: builder.mutation<{ success: boolean }, { contestId: string; judgeId: string }>({
      query: ({ contestId, judgeId }) => ({
        url: `/contest/${contestId}/judges/${judgeId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { contestId }) => [{ type: 'ContestJudges', id: contestId }],
    }),

    // Judging
    submitJudgeScore: builder.mutation<
      ContestJudgeScore,
      { contestId: string; entryId: string; score: number; comments?: string }
    >({
      query: ({ contestId, entryId, ...body }) => ({
        url: `/contest/${contestId}/entries/${entryId}/score`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { contestId, entryId }) => [
        { type: 'ContestScores', id: `${contestId}-${entryId}` },
        { type: 'ContestScores', id: `my-${contestId}` },
        { type: 'ContestEntry', id: entryId },
        { type: 'ContestEntries', id: contestId },
        { type: 'Leaderboard', id: contestId },
      ],
    }),

    getEntryScores: builder.query<ContestJudgeScore[], { contestId: string; entryId: string }>({
      query: ({ contestId, entryId }) => `/contest/${contestId}/entries/${entryId}/judge-scores`,
      providesTags: (result, error, { contestId, entryId }) => [
        { type: 'ContestScores', id: `${contestId}-${entryId}` },
      ],
    }),

    // Voting
    voteForEntry: builder.mutation<{ success: boolean }, { contestId: string; entryId: string }>({
      query: ({ contestId, entryId }) => ({
        url: `/contest/${contestId}/entries/${entryId}/vote`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, { contestId }) => [
        { type: 'ContestVotes', id: contestId },
        { type: 'Leaderboard', id: contestId },
      ],
    }),

    // Winners & Prizes
    announceWinners: builder.mutation<Contest, string>({
      query: (contestId) => ({
        url: `/contest/${contestId}/announce-winners`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, contestId) => [{ type: 'Contest', id: contestId }],
    }),

<<<<<<< HEAD
=======
    // Replaces the winner selection wholesale: entry_ids ordered, first is
    // rank 1, [] clears. Invalidates the leaderboard and entries so the
    // selection state shown anywhere refreshes.
    selectWinners: builder.mutation<
      { winners: Array<{ id: string; rank: number; status: string }> },
      { contestId: string; entry_ids: string[] }
    >({
      query: ({ contestId, entry_ids }) => ({
        url: `/contest/${contestId}/winners`,
        method: 'PUT',
        body: { entry_ids },
      }),
      invalidatesTags: (result, error, { contestId }) => [
        { type: 'Leaderboard', id: contestId },
        { type: 'ContestEntries', id: contestId },
        { type: 'Contest', id: contestId },
      ],
    }),

    // Get-or-create the public results link. Idempotent on the backend, so
    // repeated copies hand back the same URL.
    getResultsShareLink: builder.mutation<{ share_url: string }, string>({
      query: (contestId) => ({
        url: `/contest/${contestId}/results-share-link`,
        method: 'POST',
      }),
    }),

>>>>>>> 8f5c3620965f1ac1ad78ff2c5adf1f4a674d1386
    distributePrizes: builder.mutation<{ success: boolean; message?: string }, string>({
      query: (contestId) => ({
        url: `/contest/${contestId}/distribute-prizes`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, contestId) => [{ type: 'Contest', id: contestId }],
    }),
    getMyJudgeScores: builder.query<{ scores: ContestJudgeScore[] }, { contestId: string }>({
      query: ({ contestId }) => `/contest/${contestId}/my-scores`,
      // Tagged per contest. A bare 'ContestScores' tag would not be matched by
      // submitJudgeScore, which invalidates specific ids, so the judge's own
      // scores would never refresh after they scored something.
      providesTags: (result, error, { contestId }) => [
        { type: 'ContestScores', id: `my-${contestId}` },
      ],
    }),
    // Leaderboard
    getLeaderboard: builder.query<LeaderboardResponse, { contestId: string; limit?: number }>({
      query: ({ contestId, limit }) =>
        `/contest/${contestId}/leaderboard${limit ? `?limit=${limit}` : ''}`,
      providesTags: (result, error, { contestId }) => [{ type: 'Leaderboard', id: contestId }],
    }),

    getJudgeContests: builder.query<{ contests: Contest[] }, void>({
      query: () => '/contest/judge/contests',
      providesTags: ['JudgeContests', 'Contests'],
    }),
  }),
});

export const {
  useGetContestsQuery,
  useGetContestQuery,
  useGetContestsByStatusQuery,
  useCreateContestMutation,
  useUpdateContestMutation,
  useDeleteContestMutation,
  useGetContestEntriesQuery,
  useGetContestEntryQuery,
  useSubmitEntryMutation,
  useGetMyJudgeScoresQuery,
  useUpdateEntryStatusMutation,
<<<<<<< HEAD
=======
  useUpdateEntryLicensingStatusMutation,
>>>>>>> 8f5c3620965f1ac1ad78ff2c5adf1f4a674d1386
  useGetMyContestEntriesQuery,
  useDeleteContestEntryMutation,
  useGetMySubmittedContestsQuery,
  useGetContestCategoriesQuery,
  useAddCategoryToContestMutation,
  useRemoveCategoryFromContestMutation,
  useGetContestJudgesQuery,
  useLazyGetContestJudgesQuery,
  useAssignJudgeMutation,
  useGetJudgeInvitationsQuery,
  useAcceptJudgeInvitationMutation,
  useRemoveJudgeMutation,
  useSubmitJudgeScoreMutation,
  useGetEntryScoresQuery,
  useVoteForEntryMutation,
  useAnnounceWinnersMutation,
  useDistributePrizesMutation,
<<<<<<< HEAD
=======
  useSelectWinnersMutation,
  useGetResultsShareLinkMutation,
>>>>>>> 8f5c3620965f1ac1ad78ff2c5adf1f4a674d1386
  useGetLeaderboardQuery,
  useGetJudgeContestsQuery,
  useGenerateJudgeInviteLinkMutation,
  useGenerateSelfAssignLinkMutation,
  useGenerateOpenLinkMutation,
  useRedeemJudgeInviteMutation,
} = contestsApi;

export default contestsApi;