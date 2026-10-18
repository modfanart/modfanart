// src/services/api/moderationApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '..';

import type {
  AuthenticityStage,
  ContentSafetyStage,
  ModerationStatus,
  ScreeningDecision,
  ScreeningReason,
  StyleStage,
} from '../types/screening';


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
 * A review-queue item: the `moderation_queue` row, the screening run that flagged it (when it came
 * from screening rather than a user report), and the artwork, artist and contest it is about.
 */
export interface ModerationQueueItem {
  id: string;
  entity_type: 'artwork' | 'contest_entry' | (string & {});
  entity_id: string;
  status: 'pending' | 'reviewed';
  priority: number;
  assigned_to: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  /** null while undecided; 'escalated' items stay pending for platform moderators. */
  decision: ModerationDecision | null;
  notes: string | null;
  created_at: string;
  updated_at: string;

  screening_run_id: string | null;
  /** The engine's reasons for a screening flag, or the report payload for a user report. */
  rule_matches: ScreeningReason[] | UserReportMatch | null;
  screening_decision: ScreeningDecision | null;
  aiornot: AuthenticityStage | null;
  moderation: ContentSafetyStage | null;
  style: StyleStage | null;

  artwork: {
    id: string;
    title: string;
    description: string | null;
    file_url: string | null;
    thumbnail_url: string | null;
    status: string;
    moderation_status: ModerationStatus;
    creator: { id: string; username: string; avatar_url: string | null };
  } | null;
  contest_entry: {
    id: string;
    status: string;
    moderation_status: ModerationStatus;
    contest_id: string;
    contest_title: string;
    brand_id: string;
  } | null;
}

export interface UserReportMatch {
  source: 'user_report';
  violation_type: string;
  description: string | null;
  reporter_id: string | null;
}

export type ModerationDecision = 'approved' | 'rejected' | 'escalated';

/** `escalated` lists pending items handed up to platform moderators; `pending` excludes them. */
export interface ModerationQueueQuery {
  brand_id?: string;
  status?: 'pending' | 'escalated' | 'reviewed';
  limit?: number;
  offset?: number;
}

/**
 * Request body for resolving a moderation queue item.
 */
export interface ResolveModerationQueueRequest {
  decision: ModerationDecision;
  notes?: string;
}

/**
 * Response returned after resolving a moderation queue item.
 */
export interface ResolveModerationQueueResponse {
  success: boolean;
  message: string;
  moderation_status: ModerationStatus;
  queue_item: ModerationQueueItem;
}


// ─────────────────────────────────────────────────────────────

export const moderationApi = createApi({
  reducerPath: 'moderationApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/moderation`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any)?.auth?.accessToken;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),

  tagTypes: ['ModerationQueue'],

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

    // GET /moderation/queue — platform moderators see everything; a brand member must pass
    // their own brand_id and sees that brand's items.
    getModerationQueue: builder.query<ModerationQueueItem[], ModerationQueueQuery>({
      query: (params) => ({ url: '/queue', params }),
      providesTags: ['ModerationQueue'],
    }),


    // POST /moderation/queue/:id/resolve
    resolveModerationQueueItem: builder.mutation<
      ResolveModerationQueueResponse,
      {
        id: string;
        body: ResolveModerationQueueRequest;
      }
    >({
      query: ({ id, body }) => ({
        url: `/queue/${id}/resolve`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ModerationQueue'],
    }),
  }),
});

export const {
  useSubmitModerationReportMutation,
  useGetModerationQueueQuery,
  useResolveModerationQueueItemMutation,
} = moderationApi;

export default moderationApi;
