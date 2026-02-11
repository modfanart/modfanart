// src/services/api/contestApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// ────────────────────────────────────────────────
// Core types aligned with your db/types.js
// ────────────────────────────────────────────────

export interface Contest {
  id: string;
  brand_id: string;
  title: string;
  slug: string;
  description: string;
  rules?: string | null;
  prizes: Array<{ rank: number; amount_inr?: number; type: string; [key: string]: any }> | null;
  start_date: string;
  submission_end_date: string;
  voting_end_date?: string | null;
  judging_end_date?: string | null;
  status: 'draft' | 'published' | 'live' | 'judging' | 'completed' | 'archived';
  visibility: 'public' | 'private' | 'unlisted';
  max_entries_per_user: number;
  entry_requirements: Record<string, any> | null;
  judging_criteria: Record<string, any> | null;
  winner_announced: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}
export interface ContestDetail extends Contest {
  // Hero / visual
  hero_image?: string | null; // main banner/cover image
  gallery?: string[]; // optional multiple images (for Swiper)

  // Brand info (likely populated via ?populate=brand or join)
  brand_name?: string | null;
  brand_logo?: string | null;
  brand_slug?: string | null; // if you want direct link to brand page

  // Stats / engagement
  view_count?: number;
  entry_count?: number; // optional – number of submissions
  // vote_count?: number;              // if public voting is shown

  // Optional extras you might add later
  categories?: string[]; // if you populate categories
  judges_count?: number;
}

export interface GetContestsResponse {
  contests: Contest[]; // list uses minimal Contest
  total?: number;
  page?: number;
  limit?: number;
}
export interface ContestEntry {
  id: string;
  contest_id: string;
  artwork_id: string; // link to ArtworkRow
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

export interface ContestJudge {
  contest_id: string;
  judge_id: string; // user id
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

export interface ContestVote {
  entry_id: string;
  user_id: string;
  vote_weight: number;
  created_at: string;
}

// For leaderboard / winners view (aggregated)
export interface LeaderboardEntry {
  entry_id: string;
  artwork_title?: string;
  creator_username?: string;
  creator_id: string;
  rank: number | null;
  score_public: number;
  score_judge: number;
  vote_count: number;
  // optional joined fields
  thumbnail_url?: string | null;
}

// ────────────────────────────────────────────────
// Add this interface
export interface GetContestsResponse {
  contests: Contest[];
  // Add more if you plan to support pagination later, e.g.:
  // total?: number;
  // page?: number;
  // limit?: number;
}
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
    'Artwork', // useful when entry links to artwork
  ],

  endpoints: (builder) => ({
    // ── Listing & Detail ─────────────────────────────────────

    getContests: builder.query<
      GetContestsResponse, // ← Now matches actual response
      {
        status?: string;
        brandId?: string;
        activeOnly?: boolean;
        page?: number;
        limit?: number;
      } | void
    >({
      query: (params) =>
        params
          ? {
              url: '/contest',
              params,
            }
          : {
              url: '/contest',
            },
      providesTags: ['Contests'],
    }),

    getContest: builder.query<ContestDetail, string>({
      query: (id) => `/contest/${id}`, // ← add ?populate=brand if your backend needs it
      providesTags: (result, error, id) => [{ type: 'Contest', id }, 'Contests'],
    }),
    // ── CRUD ─────────────────────────────────────────────────

    createContest: builder.mutation<Contest, Partial<Contest>>({
      query: (body) => ({
        url: '/contest',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Contests'],
    }),

    updateContest: builder.mutation<Contest, { id: string } & Partial<Contest>>({
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

    // ── Categories ───────────────────────────────────────────

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

    // ── Entries ──────────────────────────────────────────────

    submitEntry: builder.mutation<
      ContestEntry,
      {
        contestId: string;
        artworkId: string;
        submissionNotes?: string | null | undefined;
      }
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
      ContestEntry[],
      {
        contestId: string;
        status?: string;
        moderatedOnly?: boolean;
      }
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

    // ── Judges ───────────────────────────────────────────────

    getContestJudges: builder.query<ContestJudge[], string>({
      query: (contestId) => `/contest/${contestId}/judges`,
      providesTags: (result, error, contestId) => [{ type: 'ContestJudges', id: contestId }],
    }),

    inviteJudge: builder.mutation<ContestJudge, { contestId: string; judgeId: string }>({
      query: ({ contestId, judgeId }) => ({
        url: `/contest/${contestId}/judges`,
        method: 'POST',
        body: { judgeId },
      }),
      invalidatesTags: (result, error, { contestId }) => [{ type: 'ContestJudges', id: contestId }],
    }),

    acceptJudgeInvitation: builder.mutation<ContestJudge, { contestId: string; judgeId: string }>({
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

    // ── Judging ──────────────────────────────────────────────

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

    // ── Public Voting ────────────────────────────────────────

    voteForEntry: builder.mutation<{ success: boolean }, { contestId: string; entryId: string }>({
      query: ({ contestId, entryId }) => ({
        url: `/contest/${contestId}/entries/${entryId}/vote`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, { contestId }) => [
        { type: 'ContestVotes', id: contestId },
        { type: 'Leaderboard', id: contestId },
        { type: 'ContestEntry', id: contestId }, // if entry shows vote count
      ],
    }),

    // ── Winners & Completion ─────────────────────────────────

    announceWinners: builder.mutation<
      Contest,
      { contestId: string; winners: Array<{ entryId: string; rank: number }> }
    >({
      query: ({ contestId, winners }) => ({
        url: `/contest/${contestId}/announce-winners`,
        method: 'PATCH',
        body: { winners },
      }),
      invalidatesTags: (result, error, { contestId }) => [
        { type: 'Contest', id: contestId },
        'Leaderboard',
      ],
    }),

    // Optional: if you have a separate prize distribution step
    distributePrizes: builder.mutation<{ success: boolean; message?: string }, string>({
      query: (contestId) => ({
        url: `/contest/${contestId}/distribute-prizes`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, contestId) => [{ type: 'Contest', id: contestId }],
    }),

    // ── Leaderboard ──────────────────────────────────────────

    getLeaderboard: builder.query<LeaderboardEntry[], string>({
      query: (contestId) => `/contest/${contestId}/leaderboard`,
      providesTags: (result, error, contestId) => [{ type: 'Leaderboard', id: contestId }],
    }),
  }),
});

export const {
  useGetContestsQuery,
  useGetContestQuery,
  useGetLeaderboardQuery,

  useCreateContestMutation,
  useUpdateContestMutation,
  useDeleteContestMutation,

  useGetContestCategoriesQuery,
  useAddCategoryToContestMutation,
  useRemoveCategoryFromContestMutation,

  useSubmitEntryMutation,
  useGetContestEntriesQuery,
  useUpdateEntryStatusMutation,

  useGetContestJudgesQuery,
  useInviteJudgeMutation,
  useAcceptJudgeInvitationMutation,
  useRemoveJudgeMutation,

  useSubmitJudgeScoreMutation,
  useGetEntryScoresQuery,

  useVoteForEntryMutation,

  useAnnounceWinnersMutation,
  useDistributePrizesMutation,
} = contestsApi;

export default contestsApi;
