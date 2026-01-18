// src/services/api/artworkApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// ────────────────────────────────────────────────
// Types — aligned with real API response
// ────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  description: string | null;
  icon_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Full artwork — returned by /artwork/:id
 */
export interface Artwork {
  id: string;
  creator_id: string;

  title: string;
  description: string | null;

  file_url: string;
  thumbnail_url: string | null;
  source_file_url: string | null;

  status: 'draft' | 'published' | 'archived' | 'moderation_pending' | 'rejected';
  moderation_status: string;
  moderation_notes: string | null;
  moderated_by: string | null;
  moderated_at: string | null;

  views_count: number;
  favorites_count: number;

  created_at: string;
  updated_at: string;
  deleted_at: string | null;

  categories?: Category[];
}

/**
 * Lightweight artwork — returned by /artwork and /artwork/me
 */
export interface ArtworkListItem {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;

  views_count: number;
  favorites_count: number;

  creator_id: string;
  created_at: string;
}

export interface ArtworkListResponse {
  artworks: ArtworkListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

interface ApiSuccessResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

// ────────────────────────────────────────────────
// API
// ────────────────────────────────────────────────

const artworkApi = createApi({
  reducerPath: 'artworkApi',

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

  tagTypes: ['Artwork', 'ArtworkList', 'MyArtworks', 'ArtworkCategories', 'Categories'],

  endpoints: (builder) => ({
    // ────────────────────────────────────────────────
    // Public
    // ────────────────────────────────────────────────

    getArtworks: builder.query<
      ArtworkListResponse,
      { page?: number; limit?: number; status?: string; category?: string } | void
    >({
      query: (params) => {
        const queryParams: Record<string, string | number> = {};

        if (params?.page) queryParams['page'] = params.page;
        if (params?.limit) queryParams['limit'] = params.limit;
        if (params?.status) queryParams['status'] = params.status;
        if (params?.category) queryParams['category'] = params.category;

        return {
          url: '/artwork',
          ...(Object.keys(queryParams).length > 0 && { params: queryParams }),
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.artworks.map((a) => ({ type: 'Artwork' as const, id: a.id })),
              { type: 'ArtworkList', id: 'LIST' },
            ]
          : [{ type: 'ArtworkList', id: 'LIST' }],
    }),

    getArtwork: builder.query<Artwork, string>({
      query: (id) => `/artwork/${id}`,
      providesTags: (result, error, id) => [{ type: 'Artwork', id }],
    }),

    // ────────────────────────────────────────────────
    // Authenticated
    // ────────────────────────────────────────────────

    createArtwork: builder.mutation<ApiSuccessResponse<Artwork>, FormData>({
      query: (formData) => ({
        url: '/artwork',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: [
        { type: 'ArtworkList', id: 'LIST' },
        { type: 'MyArtworks', id: 'LIST' },
      ],
    }),

    getMyArtworks: builder.query<
      ArtworkListResponse,
      { status?: string; page?: number; limit?: number } | void
    >({
      query: (params) => {
        const queryParams: Record<string, string | number> = {};

        if (params?.status) queryParams['status'] = params.status;
        if (params?.page) queryParams['page'] = params.page;
        if (params?.limit) queryParams['limit'] = params.limit;

        return {
          url: '/artwork/me',
          ...(Object.keys(queryParams).length > 0 && { params: queryParams }),
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.artworks.map((a) => ({ type: 'Artwork' as const, id: a.id })),
              { type: 'MyArtworks', id: 'LIST' },
            ]
          : [{ type: 'MyArtworks', id: 'LIST' }],
    }),

    publishArtwork: builder.mutation<ApiSuccessResponse<{ artwork: Artwork }>, string>({
      query: (id) => ({
        url: `/artwork/${id}/publish`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Artwork', id },
        { type: 'ArtworkList', id: 'LIST' },
        { type: 'MyArtworks', id: 'LIST' },
      ],
    }),

    deleteArtwork: builder.mutation<ApiSuccessResponse, string>({
      query: (id) => ({
        url: `/artwork/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Artwork', id },
        { type: 'ArtworkList', id: 'LIST' },
        { type: 'MyArtworks', id: 'LIST' },
      ],
    }),

    // ────────────────────────────────────────────────
    // Categories
    // ────────────────────────────────────────────────

    // in artworkApi.ts
    getArtworkCategories: builder.query<Category[], string>({
      query: (artworkId) => `/artwork/${artworkId}/categories`,
      transformResponse: (response: { categories: Category[] }) => response.categories ?? [],
      providesTags: (result, error, artworkId) => [
        { type: 'ArtworkCategories', id: artworkId },
        { type: 'Artwork', id: artworkId },
      ],
    }),
    addCategoryToArtwork: builder.mutation<
      ApiSuccessResponse<{ category: Category }>,
      { artworkId: string; categoryId: string }
    >({
      query: ({ artworkId, categoryId }) => ({
        url: `/artwork/${artworkId}/categories`,
        method: 'POST',
        body: { categoryId },
      }),
      invalidatesTags: (result, error, { artworkId }) => [
        { type: 'ArtworkCategories', id: artworkId },
        { type: 'Artwork', id: artworkId },
      ],
    }),

    removeCategoryFromArtwork: builder.mutation<
      ApiSuccessResponse,
      { artworkId: string; categoryId: string }
    >({
      query: ({ artworkId, categoryId }) => ({
        url: `/artwork/${artworkId}/categories/${categoryId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { artworkId }) => [
        { type: 'ArtworkCategories', id: artworkId },
        { type: 'Artwork', id: artworkId },
      ],
    }),

    // ────────────────────────────────────────────────
    // Utility
    // ────────────────────────────────────────────────

    getAllCategories: builder.query<Category[], { parentId?: string; activeOnly?: boolean } | void>(
      {
        query: (filters) => {
          const queryParams: Record<string, string> = {};

          if (filters?.parentId) queryParams['parent_id'] = filters.parentId;
          if (filters?.activeOnly) queryParams['active'] = 'true';

          return {
            url: '/categories',
            ...(Object.keys(queryParams).length > 0 && { params: queryParams }),
          };
        },
        providesTags: ['Categories'],
      }
    ),
  }),
});

// ────────────────────────────────────────────────
// Hooks
// ────────────────────────────────────────────────

export const {
  useGetArtworksQuery,
  useGetArtworkQuery,
  useCreateArtworkMutation,
  useGetMyArtworksQuery,
  useLazyGetMyArtworksQuery,
  usePublishArtworkMutation,
  useDeleteArtworkMutation,
  useGetArtworkCategoriesQuery,
  useAddCategoryToArtworkMutation,
  useRemoveCategoryFromArtworkMutation,
  useGetAllCategoriesQuery,
  useLazyGetAllCategoriesQuery,
} = artworkApi;

export default artworkApi;
