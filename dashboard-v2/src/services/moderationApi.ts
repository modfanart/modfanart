// src/services/api/moderationApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

/**
 * Aligned with ModerationQueueRow + UserViolationRow
 */

export interface ModerationSubmissionRequest {
  entity_type: string; // artwork | comment | user | contest | etc.
  entity_id: string; // entity being reported
  violation_type: string; // spam | abuse | copyright | etc.
  description?: string;
}

export interface ModerationSubmissionResponse {
  success: boolean;
  moderation_queue_id: string;
  message?: string;
}

/**
 * Mirrors ModerationQueueRow
 */
export interface ModerationQueueItem {
  id: string;
  entity_type: string;
  entity_id: string;
  status: string;
  priority: number;
  assigned_to?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  decision?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Aggregated admin metrics (derived, not a table)
 */
export interface ModerationMetrics {
  total_reports: number;
  pending_reports: number;
  resolved_reports: number;
  rejected_reports: number;
  reports_by_entity_type: Record<string, number>;
  reports_by_status: Record<string, number>;
  average_resolution_time_days?: number;
}

// ─────────────────────────────────────────────────────────────

export const moderationApi = createApi({
  reducerPath: 'moderationApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/moderation',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any)?.auth?.accessToken;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),

  tagTypes: ['ModerationQueue', 'ModerationMetrics'],

  endpoints: (builder) => ({
    // POST /moderation/submit
    submitModerationReport: builder.mutation<
      ModerationSubmissionResponse,
      ModerationSubmissionRequest
    >({
      query: (body) => ({
        url: '/submit',
        method: 'POST',
        body,
      }),
    }),

    // GET /moderation/queue (admin/moderator)
    getModerationQueue: builder.query<ModerationQueueItem[], void>({
      query: () => '/queue',
      providesTags: ['ModerationQueue'],
    }),

    // GET /moderation/metrics (admin)
    getModerationMetrics: builder.query<ModerationMetrics, void>({
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
