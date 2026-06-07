// src/services/api/artworkTagsApi.js

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '..';

const artworkTagsApi = createApi({
  reducerPath: 'artworkTagsApi',

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

  tagTypes: ['ArtworkTags', 'Artwork', 'Tags'],

  endpoints: (builder) => ({
    // GET /artworks/:artworkId/tags
    getArtworkTags: builder.query({
      query: (artworkId) => `/artworks/${artworkId}/tags`,

      providesTags: (result, error, artworkId) => [
        { type: 'ArtworkTags', id: artworkId },

        ...(result
          ? result.map(({ id }) => ({
              type: 'ArtworkTags',
              id,
            }))
          : []),
      ],
    }),

    // POST /artworks/:artworkId/tags
    addTagToArtwork: builder.mutation({
      query: ({ artworkId, ...payload }) => ({
        url: `/artworks/${artworkId}/tags`,
        method: 'POST',
        body: payload,
      }),

      invalidatesTags: (result, error, { artworkId }) => [
        {
          type: 'ArtworkTags',
          id: artworkId,
        },
        {
          type: 'Artwork',
          id: artworkId,
        },
        'Tags',
      ],
    }),

    // DELETE /artworks/:artworkId/tags/:tagId
    removeTagFromArtwork: builder.mutation({
      query: ({ artworkId, tagId }) => ({
        url: `/artworks/${artworkId}/tags/${tagId}`,
        method: 'DELETE',
      }),

      invalidatesTags: (result, error, { artworkId }) => [
        {
          type: 'ArtworkTags',
          id: artworkId,
        },
        {
          type: 'Artwork',
          id: artworkId,
        },
        'Tags',
      ],
    }),

    // GET /tags?search=...
    searchTags: builder.query({
      query: ({
        query,
        limit = 10,
        approvedOnly = true,
      }) => ({
        url: '/tags',

        params: {
          search: query,
          limit,
          approved: approvedOnly ? 'true' : undefined,
        },
      }),

      providesTags: ['Tags'],
    }),
  }),
});

export const {
  useGetArtworkTagsQuery,
  useLazyGetArtworkTagsQuery,
  useAddTagToArtworkMutation,
  useRemoveTagFromArtworkMutation,
  useSearchTagsQuery,
  useLazySearchTagsQuery,
} = artworkTagsApi;

export default artworkTagsApi;