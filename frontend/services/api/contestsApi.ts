// src/services/api/contestApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

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

export interface ContestEntry {
  id: string;
  contest_id: string;
  artwork_id: string;
  creator_id: string;
  submission_notes?: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'disqualified' | 'winner';
  rank?: number | null;
  score_public: number;
  score_judge: number;
  moderation_status: string;
  moderated_by?: string | null;
  moderated_at?: string | null;
  created_at: string;
  updated_at: string;
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
  artwork_title?: string;
  creator_username?: string;
  creator_id: string;
  rank: number | null;
  score_public: number;
  score_judge: number;
  vote_count: number;
  thumbnail_url?: string | null;
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
    baseUrl: '/api',
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
      { entries: ContestEntry[] },
      { contestId: string; status?: string }
    >({
      query: ({ contestId, ...params }) => ({
        url: `/contest/${contestId}/entries`,
        params,
      }),
      providesTags: (result, error, { contestId }) => [{ type: 'ContestEntries', id: contestId }],
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

    getMyContestEntries: builder.query<
      { entries: any[]; total?: number },
      { status?: string; limit?: number; offset?: number } | void
    >({
      query: (params) => ({
        url: '/me/contest-entries',
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
        url: `/contest/${contestId}/entries/${entryId}/judge-score`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { contestId, entryId }) => [
        { type: 'ContestScores', id: `${contestId}-${entryId}` },
        { type: 'ContestEntry', id: entryId },
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

    distributePrizes: builder.mutation<{ success: boolean; message?: string }, string>({
      query: (contestId) => ({
        url: `/contest/${contestId}/distribute-prizes`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, contestId) => [{ type: 'Contest', id: contestId }],
    }),
    getMyJudgeScores: builder.query<{ scores: ContestJudgeScore[] }, { contestId: string }>({
      query: ({ contestId }) => `/contest/${contestId}/my-scores`,
      providesTags: ['ContestScores'],
    }),
    // Leaderboard
    getLeaderboard: builder.query<LeaderboardEntry[], string>({
      query: (contestId) => `/contest/${contestId}/leaderboard`,
      providesTags: (result, error, contestId) => [{ type: 'Leaderboard', id: contestId }],
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
  useSubmitEntryMutation,
  useGetMyJudgeScoresQuery,
  useUpdateEntryStatusMutation,
  useGetMyContestEntriesQuery,
  useDeleteContestEntryMutation,
  useGetMySubmittedContestsQuery,
  useGetContestCategoriesQuery,
  useAddCategoryToContestMutation,
  useRemoveCategoryFromContestMutation,
  useGetContestJudgesQuery,
  useAssignJudgeMutation,
  useGetJudgeInvitationsQuery,
  useAcceptJudgeInvitationMutation,
  useRemoveJudgeMutation,
  useSubmitJudgeScoreMutation,
  useGetEntryScoresQuery,
  useVoteForEntryMutation,
  useAnnounceWinnersMutation,
  useDistributePrizesMutation,
  useGetLeaderboardQuery,
  useGetJudgeContestsQuery,
} = contestsApi;

export default contestsApi;
