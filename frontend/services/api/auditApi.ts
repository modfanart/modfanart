// src/services/api/auditApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// ────────────────────────────────────────────────
// Matches AuditedEventRow from src/db/types.js
// ────────────────────────────────────────────────
export interface AuditedEvent {
  id: string; // UUID
  actor_id: string | null; // user who performed the action
  action: string; // e.g. "CREATE_ARTWORK", "UPDATE_USER_ROLE", "PUBLISH_CONTEST"
  entity_type: string | null; // e.g. "artwork", "user", "contest", "order"
  entity_id: string | null; // foreign key to the affected entity
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string; // ISO timestamptz
}

// ────────────────────────────────────────────────
// Search / list filters — very common for audit endpoints
// ────────────────────────────────────────────────
export interface AuditSearchParams {
  actor_id?: string;
  action?: string; // exact or partial match depending on backend
  entity_type?: string;
  entity_id?: string;
  from_date?: string; // ISO date string (inclusive)
  to_date?: string; // ISO date string (exclusive or inclusive — backend decides)
  page?: number;
  limit?: number;
  sort?: 'created_at:desc' | 'created_at:asc' | 'action:asc' | string;
}

// Flexible response: either flat array (simple lists) or paginated
export type AuditListResponse =
  | AuditedEvent[] // simple / non-paginated endpoint
  | {
      data: AuditedEvent[];
      total: number;
      page: number;
      limit: number;
      total_pages?: number;
    };

// Common mutation response (if your backend returns the created log)
export interface CreateAuditResponse {
  success: boolean;
  event: AuditedEvent;
  message?: string;
}

const auditApi = createApi({
  reducerPath: 'auditApi',

  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers, { getState }) => {
      const token =
        (getState() as any)?.auth?.token ?? (getState() as any)?.auth?.accessToken ?? null;

      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      // Audit endpoints often require admin / elevated permissions
      // You might also set custom headers like X-Role: admin here if needed
      return headers;
    },
    credentials: 'include',
  }),

  tagTypes: ['AuditedEvent'], // rarely invalidated — audit is append-only

  endpoints: (builder) => ({
    // POST   /api/audit
    // Usually called automatically by backend middleware — but exposed for admin/manual logging
    createAuditEvent: builder.mutation<CreateAuditResponse, Partial<AuditedEvent>>({
      query: (body) => ({
        url: '/audit',
        method: 'POST',
        body,
      }),
      // Almost never invalidate — but you could if frontend shows live audit feed
      // invalidatesTags: ['AuditedEvent'],
    }),

    // GET    /api/audit/:id
    getAuditEventById: builder.query<AuditedEvent, string>({
      query: (id) => `/audit/${id}`,
      providesTags: (result, error, id) => [{ type: 'AuditedEvent', id }],
    }),

    // GET    /api/audit/search  (most common & flexible endpoint)
    searchAuditEvents: builder.query<AuditListResponse, AuditSearchParams>({
      query: (params) => ({
        url: '/audit/search',
        params: params as Record<string, string | number | undefined>,
      }),
      providesTags: (result) => {
        if (!result) return [];
        const events = 'data' in result ? result.data : result;
        return [
          ...events.map(({ id }) => ({ type: 'AuditedEvent' as const, id })),
          { type: 'AuditedEvent', id: 'LIST' },
        ];
      },
    }),

    // GET    /api/audit/entity/:entityType/:entityId
    getAuditByEntity: builder.query<AuditedEvent[], { entityType: string; entityId: string }>({
      query: ({ entityType, entityId }) => `/audit/entity/${entityType}/${entityId}`,
      providesTags: (result, error, { entityId }) => [
        { type: 'AuditedEvent', id: `ENTITY_${entityId}` },
        ...(result?.map(({ id }) => ({ type: 'AuditedEvent' as const, id })) ?? []),
      ],
    }),

    // GET    /api/audit/actor/:actorId
    getAuditByActor: builder.query<AuditedEvent[], string>({
      query: (actorId) => `/audit/actor/${actorId}`,
      providesTags: (result, error, actorId) => [
        { type: 'AuditedEvent', id: `ACTOR_${actorId}` },
        ...(result?.map(({ id }) => ({ type: 'AuditedEvent' as const, id })) ?? []),
      ],
    }),
  }),
});

export const {
  useCreateAuditEventMutation,
  useGetAuditEventByIdQuery,
  useLazyGetAuditEventByIdQuery,
  useSearchAuditEventsQuery,
  useLazySearchAuditEventsQuery,
  useGetAuditByEntityQuery,
  useLazyGetAuditByEntityQuery,
  useGetAuditByActorQuery,
  useLazyGetAuditByActorQuery,
} = auditApi;

export default auditApi;
