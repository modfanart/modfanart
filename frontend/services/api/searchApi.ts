// src/features/search/searchApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { GlobalSearchResponse, GlobalSearchParams } from './types'; // ← define these yourself

/**
 * Type for the search response from your backend
 * Adjust fields according to what your globalSearch actually returns
 */
export interface GlobalSearchResponse {
  results: Array<{
    type: 'artwork' | 'user' | 'brand' | 'contest' | 'category' | 'tag';
    id: string;
    title?: string;
    username?: string;
    name?: string;
    slug?: string;
    description?: string | null;
    image?: string | null; // thumbnail_url / avatar_url / logo_url
    status?: string;
    created_at: string;
    // ... other fields you return (categories, prizes, followers_count etc.)
    [key: string]: any;
  }>;
  total: number;
  limit: number;
  offset: number;
}

/**
 * Type for search query parameters
 */
export interface GlobalSearchParams {
  q: string;
  limit?: number;
  offset?: number;
  type?: string; // comma-separated: "artwork,user,brand,contest"
}

/**
 * RTK Query API slice for search
 */
export const searchApi = createApi({
  reducerPath: 'searchApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      const token =
        (getState() as any)?.auth?.token ||
        (getState() as any)?.auth?.accessToken ||
        (getState() as any)?.session?.accessToken;

      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      return headers;
    },
  }),

  endpoints: (builder) => ({
    // ────────────────────────────────────────────────
    // 1. Main global search (triggered manually → useLazyQuery)
    // ────────────────────────────────────────────────
    globalSearch: builder.query<GlobalSearchResponse, GlobalSearchParams>({
      query: (params) => ({
        url: '/search',
        params: {
          q: params.q,
          limit: params.limit ?? 20,
          offset: params.offset ?? 0,
          type: params.type, // optional
        },
      }),

      // Optional: keep unused data for longer in search context
      keepUnusedDataFor: 60, // seconds

      // Optional: transform / normalize response
      transformResponse: (response: GlobalSearchResponse) => {
        // Example: add fallback image or normalize types
        return {
          ...response,
          results: response.results.map((item) => ({
            ...item,
            image: item.image ?? null,
          })),
        };
      },
    }),

    // ────────────────────────────────────────────────
    // 2. Optional: lightweight autocomplete / suggestions
    //    (very fast prefix search – you can add later on backend)
    // ────────────────────────────────────────────────
    // searchSuggestions: builder.query<{ results: Array<{type:string, title:string, slug?:string}> }, string>({
    //   query: (q) => ({ url: '/search/suggestions', params: { q, limit: 8 } }),
    //   keepUnusedDataFor: 30,
    // }),
  }),
});

// Export hooks
export const {
  useGlobalSearchQuery, // auto-fetch (rarely used for search bar)
  useLazyGlobalSearchQuery, // ← most common choice for search bars
  // useSearchSuggestionsQuery,
  // useLazySearchSuggestionsQuery,
} = searchApi;

// Export the reducer to add to store
export default searchApi.reducer;
