import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '..';

import type {
  PublishRulesetRequest,
  PublishRulesetResponse,
  RulesetsResponse,
  ScreeningHistoryResponse,
  StartScreeningRunRequest,
  StartScreeningRunResponse,
  StyleGuidesResponse,
  UploadStyleGuideResponse,
} from '../types/screening';

/** A style guide arrives either as a PDF upload or as pasted text. */
export type UploadStyleGuideRequest =
  | { brand_id: string; file: File }
  | { brand_id: string; source_text: string };

export const screeningApi = createApi({
  reducerPath: 'screeningApi',

  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/screening`,

    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any)?.auth?.accessToken;

      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      return headers;
    },
  }),

  tagTypes: ['ScreeningRuns', 'ScreeningRulesets', 'StyleGuides'],

  endpoints: (builder) => ({
    // GET /screening/runs/:artworkId — reviewer view: platform moderators and the brand the
    // artwork was submitted to.
    getScreeningHistory: builder.query<ScreeningHistoryResponse, string>({
      query: (artworkId) => `/runs/${artworkId}`,
      providesTags: (_result, _error, artworkId) => [{ type: 'ScreeningRuns', id: artworkId }],
    }),

    // POST /screening/runs — rescreen. Resets the verdict to pending and queues a fresh run.
    startScreeningRun: builder.mutation<StartScreeningRunResponse, StartScreeningRunRequest>({
      query: (body) => ({ url: '/runs', method: 'POST', body }),
      invalidatesTags: (_result, _error, { artworkId }) => [
        { type: 'ScreeningRuns', id: artworkId },
      ],
    }),

    // GET /screening/rulesets?brand_id= — the brand's versions plus the config in force.
    getScreeningRulesets: builder.query<RulesetsResponse, string>({
      query: (brandId) => ({ url: '/rulesets', params: { brand_id: brandId } }),
      providesTags: (_result, _error, brandId) => [{ type: 'ScreeningRulesets', id: brandId }],
    }),

    // POST /screening/rulesets — publishes a new immutable version; omitted fields carry over.
    publishScreeningRuleset: builder.mutation<PublishRulesetResponse, PublishRulesetRequest>({
      query: (body) => ({ url: '/rulesets', method: 'POST', body }),
      invalidatesTags: (_result, _error, { brand_id }) => [
        { type: 'ScreeningRulesets', id: brand_id },
      ],
    }),

    // GET /screening/style-guides?brand_id=
    getStyleGuides: builder.query<StyleGuidesResponse, string>({
      query: (brandId) => ({ url: '/style-guides', params: { brand_id: brandId } }),
      providesTags: (_result, _error, brandId) => [{ type: 'StyleGuides', id: brandId }],
    }),

    // POST /screening/style-guides — compiled into checkable rules before the response returns.
    uploadStyleGuide: builder.mutation<UploadStyleGuideResponse, UploadStyleGuideRequest>({
      query: (request) => {
        if ('file' in request) {
          const body = new FormData();
          body.append('brand_id', request.brand_id);
          body.append('file', request.file);
          return { url: '/style-guides', method: 'POST', body };
        }

        return { url: '/style-guides', method: 'POST', body: request };
      },
      invalidatesTags: (_result, _error, { brand_id }) => [{ type: 'StyleGuides', id: brand_id }],
    }),
  }),
});

export const {
  useGetScreeningHistoryQuery,
  useStartScreeningRunMutation,
  useGetScreeningRulesetsQuery,
  usePublishScreeningRulesetMutation,
  useGetStyleGuidesQuery,
  useUploadStyleGuideMutation,
} = screeningApi;

export default screeningApi;
