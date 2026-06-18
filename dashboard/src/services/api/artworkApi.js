// src/services/api/artworkApi.js

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "..";

const artworkApi = createApi({
  reducerPath: "artworkApi",

  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: "include",

    prepareHeaders: (headers) => {
      const token = localStorage.getItem("accessToken");

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),

  tagTypes: [
    "Artwork",
    "ArtworkList",
    "MyArtworks",
    "ArtworkCategories",
    "Categories",
  ],

  endpoints: (builder) => ({
    // Public

    getArtworks: builder.query({
      query: (params) => {
        const queryParams = {};

        if (params?.page) queryParams.page = params.page;
        if (params?.limit) queryParams.limit = params.limit;
        if (params?.status) queryParams.status = params.status;
        if (params?.category) queryParams.category = params.category;

        return {
          url: "/artwork",
          ...(Object.keys(queryParams).length > 0 && {
            params: queryParams,
          }),
        };
      },

      providesTags: (result) =>
        result
          ? [
              ...result.artworks.map((a) => ({
                type: "Artwork",
                id: a.id,
              })),
              { type: "ArtworkList", id: "LIST" },
            ]
          : [{ type: "ArtworkList", id: "LIST" }],
    }),

    getArtwork: builder.query({
      query: (id) => `/artwork/${id}`,

      providesTags: (result, error, id) => [{ type: "Artwork", id }],
    }),

    getArtworksByCreator: builder.query({
      query: ({ creatorId, page, limit, search }) => {
        const params = {};

        if (page != null) params.page = page;
        if (limit != null) params.limit = limit;
        if (search?.trim()) params.search = search.trim();

        const base = {
          url: `/by-creator/${creatorId}`,
        };

        return Object.keys(params).length > 0 ? { ...base, params } : base;
      },

      providesTags: (result) =>
        result
          ? [
              ...result.artworks.map((a) => ({
                type: "Artwork",
                id: a.id,
              })),
              { type: "ArtworkList", id: "BY_CREATOR" },
            ]
          : [{ type: "ArtworkList", id: "BY_CREATOR" }],
    }),

    // Authenticated

    createArtwork: builder.mutation({
      query: (formData) => ({
        url: "/artwork",
        method: "POST",
        body: formData,
      }),

      invalidatesTags: [
        { type: "ArtworkList", id: "LIST" },
        { type: "MyArtworks", id: "LIST" },
      ],
    }),

    getMyArtworks: builder.query({
      query: (params) => {
        const queryParams = {};

        if (params?.status) queryParams.status = params.status;
        if (params?.page) queryParams.page = params.page;
        if (params?.limit) queryParams.limit = params.limit;

        return {
          url: "/artwork/me",
          ...(Object.keys(queryParams).length > 0 && {
            params: queryParams,
          }),
        };
      },

      providesTags: (result) =>
        result
          ? [
              ...result.artworks.map((a) => ({
                type: "Artwork",
                id: a.id,
              })),
              { type: "MyArtworks", id: "LIST" },
            ]
          : [{ type: "MyArtworks", id: "LIST" }],
    }),

    publishArtwork: builder.mutation({
      query: (id) => ({
        url: `/artwork/${id}/publish`,
        method: "PATCH",
      }),

      invalidatesTags: (result, error, id) => [
        { type: "Artwork", id },
        { type: "ArtworkList", id: "LIST" },
        { type: "MyArtworks", id: "LIST" },
      ],
    }),

    deleteArtwork: builder.mutation({
      query: (id) => ({
        url: `/artwork/${id}`,
        method: "DELETE",
      }),

      invalidatesTags: (result, error, id) => [
        { type: "Artwork", id },
        { type: "ArtworkList", id: "LIST" },
        { type: "MyArtworks", id: "LIST" },
      ],
    }),

    // Categories

    getArtworkCategories: builder.query({
      query: (artworkId) => `/artwork/${artworkId}/categories`,

      transformResponse: (response) => response.categories ?? [],

      providesTags: (result, error, artworkId) => [
        {
          type: "ArtworkCategories",
          id: artworkId,
        },
        {
          type: "Artwork",
          id: artworkId,
        },
      ],
    }),

    addCategoryToArtwork: builder.mutation({
      query: ({ artworkId, categoryId }) => ({
        url: `/artwork/${artworkId}/categories`,
        method: "POST",
        body: { categoryId },
      }),

      invalidatesTags: (result, error, { artworkId }) => [
        {
          type: "ArtworkCategories",
          id: artworkId,
        },
        {
          type: "Artwork",
          id: artworkId,
        },
      ],
    }),

    removeCategoryFromArtwork: builder.mutation({
      query: ({ artworkId, categoryId }) => ({
        url: `/artwork/${artworkId}/categories/${categoryId}`,
        method: "DELETE",
      }),

      invalidatesTags: (result, error, { artworkId }) => [
        {
          type: "ArtworkCategories",
          id: artworkId,
        },
        {
          type: "Artwork",
          id: artworkId,
        },
      ],
    }),

    getAllCategories: builder.query({
      query: (filters) => {
        const queryParams = {};

        if (filters?.parentId) {
          queryParams.parent_id = filters.parentId;
        }

        if (filters?.activeOnly) {
          queryParams.active = "true";
        }

        return {
          url: "/categories",
          ...(Object.keys(queryParams).length > 0 && {
            params: queryParams,
          }),
        };
      },

      providesTags: ["Categories"],
    }),
  }),
});

export const {
  useGetArtworksQuery,
  useGetArtworkQuery,
  useCreateArtworkMutation,
  useGetMyArtworksQuery,
  useLazyGetMyArtworksQuery,
  usePublishArtworkMutation,
  useGetArtworksByCreatorQuery,
  useLazyGetArtworksByCreatorQuery,
  useDeleteArtworkMutation,
  useGetArtworkCategoriesQuery,
  useAddCategoryToArtworkMutation,
  useRemoveCategoryFromArtworkMutation,
  useGetAllCategoriesQuery,
  useLazyGetAllCategoriesQuery,
} = artworkApi;

export default artworkApi;
