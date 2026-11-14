// src/services/api/moderationApi.js

import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '../baseQuery';
import { API_BASE_URL } from '..';

export const moderationApi = createApi({
  reducerPath: 'moderationApi',

  baseQuery: createBaseQuery('/moderation'),

  tagTypes: ['ModerationQueue', 'ModerationMetrics'],

  endpoints: (builder) => ({
    // POST /moderation/submit
    submitModerationReport: builder.mutation({
      query: (body) => ({
        url: '/submit',
        method: 'POST',
        body,
      }),
    }),

    // GET /moderation/queue
    getModerationQueue: builder.query({
      query: () => '/queue',

      providesTags: ['ModerationQueue'],
    }),

    // GET /moderation/metrics
    getModerationMetrics: builder.query({
      query: () => '/metrics',

      providesTags: ['ModerationMetrics'],
    }),
  }),
});

export const {
  useSubmitModerationReportMutation,
  useGetModerationQueueQuery,
  useGetModerationMetricsQuery,
  useLazyGetModerationQueueQuery,
  useLazyGetModerationMetricsQuery,
} = moderationApi;

export default moderationApi;