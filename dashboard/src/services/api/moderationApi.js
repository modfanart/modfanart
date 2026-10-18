// src/services/api/moderationApi.js
//
// The human review surface: the queue that AI screening (and user reports) feed, resolving an
// item, and the metrics computed from both. Screening's own resources (rulesets, run history)
// live in screeningApi.js, mirroring the backend's /api/moderation vs /api/screening split.

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '..';

export const moderationApi = createApi({
  reducerPath: 'moderationApi',

  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/moderation`,

    prepareHeaders: headers => {
      const token = localStorage.getItem('accessToken');

      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      return headers;
    },
  }),

  tagTypes: ['ModerationQueue', 'ModerationMetrics'],

  endpoints: builder => ({
    // GET /moderation/queue?status=pending|escalated|reviewed&entity_type=&brand_id=&limit=&offset=
    // Returns a bare array of queue items, each enriched with its screening run and artwork.
    getModerationQueue: builder.query({
      query: (params = {}) => ({
        url: '/queue',
        params: {
          status: params.status,
          entity_type: params.entity_type,
          brand_id: params.brand_id,
          limit: params.limit ?? 20,
          offset: params.offset ?? 0,
        },
      }),

      providesTags: ['ModerationQueue'],
    }),

    // POST /moderation/queue/:id/resolve  { decision: approved|rejected|escalated, notes? }
    resolveModerationItem: builder.mutation({
      query: ({ id, decision, notes }) => ({
        url: `/queue/${id}/resolve`,
        method: 'POST',
        body: { decision, notes: notes || undefined },
      }),

      invalidatesTags: ['ModerationQueue', 'ModerationMetrics'],
    }),

    // GET /moderation/metrics
    getModerationMetrics: builder.query({
      query: () => '/metrics',

      providesTags: ['ModerationMetrics'],
    }),
  }),
});

export const {
  useGetModerationQueueQuery,
  useResolveModerationItemMutation,
  useGetModerationMetricsQuery,
} = moderationApi;

export default moderationApi;
