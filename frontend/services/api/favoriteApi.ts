// src/services/api/favoritesApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

/**
 * Minimal artwork shape aligned with ArtworkRow
 * (only fields typically needed for favorites list UI)
 */
export interface ArtworkBasic {
  id: string;
  title: string;
  description?: string | null;
  file_url: string;
  thumbnail_url?: string | null;
  status: 'draft' | 'published' | 'archived' | 'moderation_pending' | 'rejected';
  views_count: number;
  favorites_count: number;
  created_at: string;
  updated_at: string;
  creator: {
    id: string;
    username: string;
    avatar_url?: string | null;
  };
}

export interface FavoriteToggleResponse {
  success: boolean;
  isFavorited: boolean;
  message?: string;
}

export const favoritesApi = createApi({
  reducerPath: 'favoritesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any)?.auth?.accessToken;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['FavoriteArtworks', 'Artwork'],

  endpoints: (builder) => ({
    // POST /artworks/:artworkId/favorite → toggle favorite
    toggleFavorite: builder.mutation<FavoriteToggleResponse, string>({
      query: (artworkId) => ({
        url: `/artworks/${artworkId}/favorite`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, artworkId) => [
        'FavoriteArtworks',
        { type: 'Artwork', id: artworkId },
      ],
    }),

    // GET /me/favorites/artworks → list of favorited artworks
    getMyFavoriteArtworks: builder.query<ArtworkBasic[], void>({
      query: () => '/me/favorites/artworks',
      providesTags: ['FavoriteArtworks'],
    }),

    // GET /artworks/:artworkId/favorite → favorite status (boolean)
    isArtworkFavorited: builder.query<boolean, string>({
      query: (artworkId) => `/artworks/${artworkId}/favorite`,
      providesTags: (result, error, artworkId) => [{ type: 'Artwork', id: artworkId }],
    }),
  }),
});

export const {
  useToggleFavoriteMutation,
  useGetMyFavoriteArtworksQuery,
  useLazyGetMyFavoriteArtworksQuery,
  useIsArtworkFavoritedQuery,
} = favoritesApi;

export default favoritesApi;
