// src/services/api/artworkTagsApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// ────────────────────────────────────────────────
// Matches TagRow from src/db/types.js
// ────────────────────────────────────────────────
export interface Tag {
  id: string;
  name: string;
  slug: string;
  approved: boolean;
  usage_count: number;
  created_by: string | null;
  approved_by: string | null;
  created_at: string; // ISO timestamptz
}

// Minimal shape returned when a new tag is created + attached
export interface CreatedTagResponse {
  success: boolean;
  tag: Tag; // the newly created or matched tag
  message?: string;
}

// Common success shape for mutations
interface ApiSuccessResponse {
  success: boolean;
  message?: string;
  data?: any;
}

// Two common patterns — decide based on your backend
export interface AddTagByNameRequest {
  artworkId: string;
  name: string; // free-text → backend may create or match existing
}

export interface AddTagByIdRequest {
  artworkId: string;
  tagId: string; // attaching existing approved tag
}

export type AddTagRequest = AddTagByNameRequest | AddTagByIdRequest;

export interface RemoveTagRequest {
  artworkId: string;
  tagId: string;
}

const artworkTagsApi = createApi({
  reducerPath: 'artworkTagsApi',

  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers, { getState }) => {
      // More flexible — support different auth slice shapes
      const token =
        (getState() as any)?.auth?.token ??
        (getState() as any)?.auth?.accessToken ??
        (getState() as any)?.session?.accessToken ??
        null;

      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
    credentials: 'include', // useful if you mix cookie + bearer auth
  }),

  tagTypes: ['ArtworkTags', 'Artwork', 'Tags'],

  endpoints: (builder) => ({
    // GET    /artworks/:artworkId/tags
    // → usually returns full Tag objects (with name, slug, usage_count, etc.)
    getArtworkTags: builder.query<Tag[], string>({
      query: (artworkId) => `/artworks/${artworkId}/tags`,
      providesTags: (result, error, artworkId) => [
        { type: 'ArtworkTags', id: artworkId },
        ...(result ? result.map(({ id }) => ({ type: 'ArtworkTags', id } as const)) : []),
      ],
    }),

    // POST   /artworks/:artworkId/tags
    // Supports both: { name: "sunset vibe" } or { tagId: "uuid-xxx" }
    addTagToArtwork: builder.mutation<CreatedTagResponse | ApiSuccessResponse, AddTagRequest>({
      query: ({ artworkId, ...payload }) => ({
        url: `/artworks/${artworkId}/tags`,
        method: 'POST',
        body: payload, // { name: string } or { tagId: string }
      }),

      invalidatesTags: (result, error, { artworkId }) => [
        { type: 'ArtworkTags', id: artworkId },
        { type: 'Artwork', id: artworkId }, // if artwork detail shows tags
        'Tags', // if you have global tag list / suggestions
      ],
    }),

    // DELETE /artworks/:artworkId/tags/:tagId
    removeTagFromArtwork: builder.mutation<ApiSuccessResponse, RemoveTagRequest>({
      query: ({ artworkId, tagId }) => ({
        url: `/artworks/${artworkId}/tags/${tagId}`,
        method: 'DELETE',
      }),

      invalidatesTags: (result, error, { artworkId }) => [
        { type: 'ArtworkTags', id: artworkId },
        { type: 'Artwork', id: artworkId },
        'Tags',
      ],
    }),

    // ───────────────────────────────────────────────────────────────
    // Bonus: useful for tag input autocomplete / suggestions
    // GET    /tags?search=...&limit=10&approved=true
    // ───────────────────────────────────────────────────────────────
    searchTags: builder.query<Tag[], { query: string; limit?: number; approvedOnly?: boolean }>({
      query: ({ query, limit = 10, approvedOnly = true }) => ({
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
