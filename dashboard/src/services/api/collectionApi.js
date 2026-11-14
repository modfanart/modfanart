// src/services/api/collectionApi.js

import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '../baseQuery';
import { API_BASE_URL } from "..";

const baseQuery = createBaseQuery('');

export const collectionsApi = createApi({
  reducerPath: "collectionsApi",

  baseQuery,

  tagTypes: ["Collection", "CollectionList", "CollectionItems"],

  endpoints: (builder) => ({
    // Create Collection
    createCollection: builder.mutation({
      query: (body) => ({
        url: "/collections",
        method: "POST",
        body,
      }),

      invalidatesTags: ["CollectionList"],
    }),

    // Get Collections
    getCollections: builder.query({
      query: (params) => ({
        url: "/collections",
        params,
      }),

      providesTags: (result) =>
        result
          ? [
              ...result.collections.map(({ id }) => ({
                type: "Collection",
                id,
              })),
              {
                type: "CollectionList",
                id: "LIST",
              },
            ]
          : [
              {
                type: "CollectionList",
                id: "LIST",
              },
            ],
    }),

    // Get Single Collection
    getCollection: builder.query({
      query: (id) => `/collections/${id}`,

      providesTags: (result, error, id) => [
        {
          type: "Collection",
          id,
        },
      ],
    }),

    // Update Collection
    updateCollection: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/collections/${id}`,
        method: "PUT",
        body: patch,
      }),

      invalidatesTags: (result, error, { id }) => [
        {
          type: "Collection",
          id,
        },
        {
          type: "CollectionList",
          id: "LIST",
        },
      ],
    }),

    // Delete Collection
    deleteCollection: builder.mutation({
      query: (id) => ({
        url: `/collections/${id}`,
        method: "DELETE",
      }),

      invalidatesTags: (result, error, id) => [
        {
          type: "Collection",
          id,
        },
        {
          type: "CollectionList",
          id: "LIST",
        },
      ],
    }),

    // Add Artwork To Collection
    addArtworkToCollection: builder.mutation({
      query: ({ collectionId, artworkId }) => ({
        url: `/collections/${collectionId}/items`,
        method: "POST",
        body: {
          artworkId,
        },
      }),

      invalidatesTags: (result, error, { collectionId }) => [
        {
          type: "Collection",
          id: collectionId,
        },
      ],
    }),

    // Remove Artwork From Collection
    removeArtworkFromCollection: builder.mutation({
      query: ({ collectionId, artworkId }) => ({
        url: `/collections/${collectionId}/items/${artworkId}`,
        method: "DELETE",
      }),

      invalidatesTags: (result, error, { collectionId }) => [
        {
          type: "Collection",
          id: collectionId,
        },
      ],
    }),
  }),
});

export const {
  useCreateCollectionMutation,
  useGetCollectionsQuery,
  useGetCollectionQuery,
  useUpdateCollectionMutation,
  useDeleteCollectionMutation,
  useAddArtworkToCollectionMutation,
  useRemoveArtworkFromCollectionMutation,
} = collectionsApi;
