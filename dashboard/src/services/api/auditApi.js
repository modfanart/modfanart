// src/services/api/auditApi.js

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '..';

const auditApi = createApi({
  reducerPath: 'auditApi',

  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,

   prepareHeaders: (headers) => {
    const token = localStorage.getItem('accessToken');

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  },

    credentials: 'include',
  }),

  tagTypes: ['AuditedEvent'],

  endpoints: (builder) => ({
    // POST /audit
    createAuditEvent: builder.mutation({
      query: (body) => ({
        url: '/audit',
        method: 'POST',
        body,
      }),
    }),

    // GET /audit/:id
    getAuditEventById: builder.query({
      query: (id) => `/audit/${id}`,

      providesTags: (result, error, id) => [
        {
          type: 'AuditedEvent',
          id,
        },
      ],
    }),

    // GET /audit/search
    searchAuditEvents: builder.query({
      query: (params) => ({
        url: '/audit/search',
        params,
      }),

      providesTags: (result) => {
        if (!result) return [];

        const events = result.data || result;

        return [
          ...events.map(({ id }) => ({
            type: 'AuditedEvent',
            id,
          })),
          {
            type: 'AuditedEvent',
            id: 'LIST',
          },
        ];
      },
    }),

    // GET /audit/entity/:entityType/:entityId
    getAuditByEntity: builder.query({
      query: ({ entityType, entityId }) =>
        `/audit/entity/${entityType}/${entityId}`,

      providesTags: (result, error, { entityId }) => [
        {
          type: 'AuditedEvent',
          id: `ENTITY_${entityId}`,
        },

        ...(result?.map(({ id }) => ({
          type: 'AuditedEvent',
          id,
        })) ?? []),
      ],
    }),

    // GET /audit/actor/:actorId
    getAuditByActor: builder.query({
      query: (actorId) => `/audit/actor/${actorId}`,

      providesTags: (result, error, actorId) => [
        {
          type: 'AuditedEvent',
          id: `ACTOR_${actorId}`,
        },

        ...(result?.map(({ id }) => ({
          type: 'AuditedEvent',
          id,
        })) ?? []),
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