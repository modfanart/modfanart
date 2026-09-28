import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '..';

import type {
  ScreeningHistoryResponse,
  ScreeningRun,
} from '../types/screening';

export interface ScreeningRunRequest {
  artworkId: string;
}

export interface ScreeningRulesetConfig {
  confidenceThreshold?: number;
  sensitivityLevel?: string;
  autoRejectAI?: boolean;
  requireHumanReview?: boolean;
  notifyArtist?: boolean;
  checkCharacterAccuracy?: boolean;
  checkStyleConsistency?: boolean;
  checkProhibitedContent?: boolean;
  customPrompt?: string;

  [key: string]: unknown;
}

export interface ScreeningRuleset {
  id: string;
  name: string;
  version?: number;
  config: ScreeningRulesetConfig;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateScreeningRulesetRequest {
  name: string;
  config: ScreeningRulesetConfig;
}

export interface CreateScreeningRulesetResponse {
  success: boolean;
  ruleset: ScreeningRuleset;
  message?: string;
}

export interface StyleGuideUploadResponse {
  success: boolean;
  styleGuide?: {
    id: string;
    name?: string;
    url?: string;
    createdAt?: string;
  };
  message?: string;
}

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

  tagTypes: [
    'ScreeningRuns',
    'ScreeningRulesets',
    'StyleGuides',
  ],

  endpoints: (builder) => ({
    getScreeningHistory: builder.query<
      ScreeningHistoryResponse,
      string
    >({
      query: (artworkId) => `/runs/${artworkId}`,

      providesTags: (_result, _error, artworkId) => [
        {
          type: 'ScreeningRuns',
          id: artworkId,
        },
      ],
    }),

    startScreeningRun: builder.mutation<
      ScreeningRun,
      ScreeningRunRequest
    >({
      query: (body) => ({
        url: '/runs',
        method: 'POST',
        body,
      }),

      invalidatesTags: (_result, _error, { artworkId }) => [
        {
          type: 'ScreeningRuns',
          id: artworkId,
        },
      ],
    }),

    getScreeningRulesets: builder.query<
      ScreeningRuleset[],
      void
    >({
      query: () => '/rulesets',
      providesTags: ['ScreeningRulesets'],
    }),

    createScreeningRuleset: builder.mutation<
      CreateScreeningRulesetResponse,
      CreateScreeningRulesetRequest
    >({
      query: (body) => ({
        url: '/rulesets',
        method: 'POST',
        body,
      }),

      invalidatesTags: ['ScreeningRulesets'],
    }),

    uploadStyleGuide: builder.mutation<
      StyleGuideUploadResponse,
      FormData
    >({
      query: (formData) => ({
        url: '/style-guides',
        method: 'POST',
        body: formData,
      }),

      invalidatesTags: ['StyleGuides'],
    }),
  }),
});

export const {
  useGetScreeningHistoryQuery,
  useLazyGetScreeningHistoryQuery,
  useStartScreeningRunMutation,
  useGetScreeningRulesetsQuery,
  useLazyGetScreeningRulesetsQuery,
  useCreateScreeningRulesetMutation,
  useUploadStyleGuideMutation,
} = screeningApi;

export default screeningApi;