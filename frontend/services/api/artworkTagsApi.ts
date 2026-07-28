// src/services/api/artworkTagsApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '..';

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

// The backend resolves tags by name only: it matches an existing tag or
// creates one. There is no attach-by-id path, so this does not offer one.
export interface AddTagRequest {
  artworkId: string;
  name: string; // free-text → backend matches existing or creates
}

export interface RemoveTagRequest {
  artworkId: string;
  tagId: string;
}

const artworkTagsApi = createApi({
  reducerPath: 'artworkTagsApi',

  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}`,
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
      query: (artworkId) => `/artwork/${artworkId}/tags`,
      // Backend wraps the list as { tags: [...] }.
      transformResponse: (response: { tags: Tag[] } | Tag[]) =>
        Array.isArray(response) ? response : (response?.tags ?? []),
      providesTags: (result, error, artworkId) => [
        { type: 'ArtworkTags', id: artworkId },
        ...(result ? result.map(({ id }) => ({ type: 'ArtworkTags', id }) as const) : []),
      ],
    }),

    // POST   /artworks/:artworkId/tags
    // Supports both: { name: "sunset vibe" } or { tagId: "uuid-xxx" }
    addTagToArtwork: builder.mutation<CreatedTagResponse | ApiSuccessResponse, AddTagRequest>({
      query: ({ artworkId, ...payload }) => ({
        url: `/artwork/${artworkId}/tags`,
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
        url: `/artwork/${artworkId}/tags/${tagId}`,
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
          approved: approvedOnly ? 'true' : 'false',
        },
      }),
      // Backend wraps the list as { tags: [...] }.
      transformResponse: (response: { tags: Tag[] } | Tag[]) =>
        Array.isArray(response) ? response : (response?.tags ?? []),
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
