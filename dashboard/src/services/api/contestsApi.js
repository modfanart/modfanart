// src/services/api/contestApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "..";

// ────────────────────────────────────────────────
// RTK Query API
// ────────────────────────────────────────────────

const contestsApi = createApi({
  reducerPath: "contestsApi",

  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("accessToken");

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
    credentials: "include",
  }),

  tagTypes: [
    "Contests",
    "Contest",
    "ContestEntries",
    "ContestEntry",
    "ContestCategories",
    "ContestJudges",
    "ContestScores",
    "ContestVotes",
    "Leaderboard",
    "JudgeContests",
    "MyContestEntries",
    "MySubmittedContests",
    "Artwork",
  ],

  endpoints: (builder) => ({
    // Listing & Detail
    getContests: builder.query({
      query: (params) => ({
        url: "/contest",
        params: params || {},
      }),
      providesTags: ["Contests"],
    }),

    getContest: builder.query({
      query: (id) => `/contest/${id}`,
      providesTags: (result, error, id) => [
        { type: "Contest", id },
        "Contests",
      ],
    }),

    getContestsByStatus: builder.query({
      query: (params) => ({
        url: "/contest/by-status",
        params: {
          ...params,
          visibility: params.visibility ?? "public",
          limit: params.limit ?? 20,
        },
      }),
      providesTags: ["Contests"],
    }),

    // CRUD
    createContest: builder.mutation({
      query: (body) => ({
        url: "/contest",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Contests"],
    }),

    updateContest: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/contest/${id}`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Contest", id },
        "Contests",
      ],
    }),

    deleteContest: builder.mutation({
      query: (id) => ({
        url: `/contest/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        "Contests",
        { type: "Contest", id },
      ],
    }),

    // Categories
    getContestCategories: builder.query({
      query: (contestId) => `/contest/${contestId}/categories`,
      providesTags: (result, error, contestId) => [
        { type: "ContestCategories", id: contestId },
      ],
    }),

    addCategoryToContest: builder.mutation({
      query: ({ contestId, categoryId }) => ({
        url: `/contest/${contestId}/categories`,
        method: "POST",
        body: { categoryId },
      }),
      invalidatesTags: (result, error, { contestId }) => [
        { type: "ContestCategories", id: contestId },
        { type: "Contest", id: contestId },
      ],
    }),

    removeCategoryFromContest: builder.mutation({
      query: ({ contestId, categoryId }) => ({
        url: `/contest/${contestId}/categories/${categoryId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { contestId }) => [
        { type: "ContestCategories", id: contestId },
        { type: "Contest", id: contestId },
      ],
    }),

    // Entries
    submitEntry: builder.mutation({
      query: ({ contestId, artworkId, submissionNotes }) => ({
        url: `/contest/${contestId}/entries`,
        method: "POST",
        body: { artworkId, submissionNotes },
      }),
      invalidatesTags: (result, error, { contestId }) => [
        { type: "ContestEntries", id: contestId },
        { type: "Contest", id: contestId },
      ],
    }),

    getContestEntries: builder.query({
      query: ({ contestId, ...params }) => ({
        url: `/contest/${contestId}/entries`,
        params,
      }),
      providesTags: (result, error, { contestId }) => [
        { type: "ContestEntries", id: contestId },
      ],
    }),

    updateEntryStatus: builder.mutation({
      query: ({ contestId, entryId, status }) => ({
        url: `/contest/${contestId}/entries/${entryId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { contestId, entryId }) => [
        { type: "ContestEntries", id: contestId },
        { type: "ContestEntry", id: entryId },
        { type: "Contest", id: contestId },
      ],
    }),

    getMyContestEntries: builder.query({
      query: (params) => ({
        url: "/me/contest-entries",
        params: params || {},
      }),
      providesTags: ["MyContestEntries"],
    }),

    deleteContestEntry: builder.mutation({
      query: ({ contestId, entryId }) => ({
        url: `/contest/${contestId}/entries/${entryId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ContestEntries", "MyContestEntries", "Contest"],
    }),

    getMySubmittedContests: builder.query({
      query: (params) => ({
        url: "/contest/my-submitted",
        params: params || {},
      }),
      providesTags: ["MySubmittedContests", "Contests"],
    }),

    // Judges
    getContestJudges: builder.query({
      query: (contestId) => `/contest/${contestId}/judges`,
      providesTags: (result, error, contestId) => [
        { type: "ContestJudges", id: contestId },
      ],
    }),

    assignJudge: builder.mutation({
      query: ({ contestId, userId }) => ({
        url: `/contest/${contestId}/judges`,
        method: "POST",
        body: { judgeId: userId },
      }),
    }),

    getJudgeInvitations: builder.query({
      query: () => "/contest/judge/invitations",
      providesTags: ["JudgeContests"],
    }),

    acceptJudgeInvitation: builder.mutation({
      query: ({ contestId, judgeId }) => ({
        url: `/contest/${contestId}/judges/${judgeId}/accept`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, { contestId }) => [
        { type: "ContestJudges", id: contestId },
      ],
    }),

    removeJudge: builder.mutation({
      query: ({ contestId, judgeId }) => ({
        url: `/contest/${contestId}/judges/${judgeId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { contestId }) => [
        { type: "ContestJudges", id: contestId },
      ],
    }),

    // Judging
    submitJudgeScore: builder.mutation({
      query: ({ contestId, entryId, ...body }) => ({
        url: `/contest/${contestId}/entries/${entryId}/judge-score`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { contestId, entryId }) => [
        { type: "ContestScores", id: `${contestId}-${entryId}` },
        { type: "ContestEntry", id: entryId },
        { type: "Leaderboard", id: contestId },
      ],
    }),

    getEntryScores: builder.query({
      query: ({ contestId, entryId }) =>
        `/contest/${contestId}/entries/${entryId}/judge-scores`,
      providesTags: (result, error, { contestId, entryId }) => [
        { type: "ContestScores", id: `${contestId}-${entryId}` },
      ],
    }),

    // Voting
    voteForEntry: builder.mutation({
      query: ({ contestId, entryId }) => ({
        url: `/contest/${contestId}/entries/${entryId}/vote`,
        method: "POST",
      }),
      invalidatesTags: (result, error, { contestId }) => [
        { type: "ContestVotes", id: contestId },
        { type: "Leaderboard", id: contestId },
      ],
    }),

    // Winners & Prizes
    announceWinners: builder.mutation({
      query: (contestId) => ({
        url: `/contest/${contestId}/announce-winners`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, contestId) => [
        { type: "Contest", id: contestId },
      ],
    }),

    distributePrizes: builder.mutation({
      query: (contestId) => ({
        url: `/contest/${contestId}/distribute-prizes`,
        method: "POST",
      }),
      invalidatesTags: (result, error, contestId) => [
        { type: "Contest", id: contestId },
      ],
    }),

    getMyJudgeScores: builder.query({
      query: ({ contestId }) => `/contest/${contestId}/my-scores`,
      providesTags: ["ContestScores"],
    }),

    // Leaderboard
    getLeaderboard: builder.query({
      query: (contestId) => `/contest/${contestId}/leaderboard`,
      providesTags: (result, error, contestId) => [
        { type: "Leaderboard", id: contestId },
      ],
    }),

    getJudgeContests: builder.query({
      query: () => "/contest/judge/contests",
      providesTags: ["JudgeContests", "Contests"],
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
