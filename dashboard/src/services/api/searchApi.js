// src/api/searchApi.js

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '..';

export const searchApi = createApi({
  reducerPath: 'searchApi',

  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}`,
    credentials: 'include',

  prepareHeaders: (headers) => {
    const token = localStorage.getItem('accessToken');

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  },
  }),

  endpoints: (builder) => ({
    // Global Search
    globalSearch: builder.query({
      query: (params) => ({
        url: '/search',

        params: {
          q: params.q,
          limit: params.limit ?? 20,
          offset: params.offset ?? 0,
          type: params.type,
        },
      }),

      keepUnusedDataFor: 60,

      transformResponse: (response) => ({
        ...response,

        results: response.results.map((item) => ({
          ...item,
          image: item.image ?? null,
        })),
      }),
    }),

    // Future endpoint
    // searchSuggestions: builder.query({
    //   query: (q) => ({
    //     url: '/search/suggestions',
    //     params: {
    //       q,
    //       limit: 8,
    //     },
    //   }),
    //   keepUnusedDataFor: 30,
    // }),
  }),
});

export const {
  useGlobalSearchQuery,
  useLazyGlobalSearchQuery,
  // useSearchSuggestionsQuery,
  // useLazySearchSuggestionsQuery,
} = searchApi;

// If you were using this before:
export default searchApi.reducer;