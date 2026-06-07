// src/services/api/moderationApi.js

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '..';

export const moderationApi = createApi({
  reducerPath: 'moderationApi',

  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/moderation`,

 prepareHeaders: (headers) => {
    const token = localStorage.getItem('accessToken');

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  },
  }),

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