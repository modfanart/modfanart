// src/services/api/favoritesApi.js

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "..";

export const favoritesApi = createApi({
  reducerPath: "favoritesApi",

  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,

    prepareHeaders: (headers) => {
      const token = localStorage.getItem("accessToken");

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),

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
