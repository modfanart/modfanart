// src/services/api/screeningApi.js
//
// AI screening resources: versioned rulesets and per-artwork run history. Rulesets are
// immutable on the backend — "editing" publishes a new version, so there is no update endpoint.

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '..';

export const screeningApi = createApi({
  reducerPath: 'screeningApi',

  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/screening`,

    prepareHeaders: headers => {
      const token = localStorage.getItem('accessToken');

      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      return headers;
    },
  }),

  tagTypes: ['Rulesets', 'ScreeningRuns'],

  endpoints: builder => ({
    // GET /screening/rulesets?brand_id=  (no brand_id → platform default)
    // → { brand_id, effective_ruleset, effective_config, versions }
    getRulesets: builder.query({
      query: ({ brandId } = {}) => ({
        url: '/rulesets',
        params: { brand_id: brandId },
      }),

      providesTags: ['Rulesets'],
    }),

    // POST /screening/rulesets  { brand_id?, config: {partial fields} }
    // Unspecified fields carry over from the current version.
    publishRuleset: builder.mutation({
      query: ({ brandId, config }) => ({
        url: '/rulesets',
        method: 'POST',
        body: { brand_id: brandId, config },
      }),

      invalidatesTags: ['Rulesets'],
    }),

    // GET /screening/runs/:artworkId → { artwork_id, runs }
    getScreeningRuns: builder.query({
      query: artworkId => `/runs/${artworkId}`,

      providesTags: (result, error, artworkId) => [
        { type: 'ScreeningRuns', id: artworkId },
      ],
    }),
  }),
});

export const {
  useGetRulesetsQuery,
  usePublishRulesetMutation,
  useGetScreeningRunsQuery,
} = screeningApi;

export default screeningApi;
