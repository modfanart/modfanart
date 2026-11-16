// src/services/api/favoritesApi.js

import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '../baseQuery';
import { API_BASE_URL } from "..";

export const favoritesApi = createApi({
  reducerPath: "favoritesApi",

  baseQuery: createBaseQuery(''),

  tagTypes: ["FavoriteArtworks", "Artwork"],

  endpoints: (builder) => ({
    // POST /artworks/:artworkId/favorite
    toggleFavorite: builder.mutation({
      query: (artworkId) => ({
        url: `/artworks/${artworkId}/favorite`,
        method: "POST",
      }),

      invalidatesTags: (result, error, artworkId) => [
        "FavoriteArtworks",
        {
          type: "Artwork",
          id: artworkId,
        },
      ],
    }),

    // GET /me/favorites/artworks
    getMyFavoriteArtworks: builder.query({
      query: () => "/me/favorites/artworks",

      providesTags: ["FavoriteArtworks"],
    }),

    // GET /artworks/:artworkId/favorite
    isArtworkFavorited: builder.query({
      query: (artworkId) => `/artworks/${artworkId}/favorite`,

      providesTags: (result, error, artworkId) => [
        {
          type: "Artwork",
          id: artworkId,
        },
      ],
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
