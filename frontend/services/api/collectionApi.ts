// src/services/api/collectionApi.ts

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
export interface CollectionRow {
  id: string;
  owner_type: 'user' | 'brand';
  owner_id: string;
  name: string;
  slug: string;
  description: string | null;
  is_public: boolean;
  cover_image_url: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CollectionItemRow {
  id: string;
  collection_id: string;
  artwork_id: string;
  sort_order: number;
  added_at: string;
}

// Optional: if you have a base query with auth token handling
const baseQuery = fetchBaseQuery({
  baseUrl: '/api',
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const collectionsApi = createApi({
  reducerPath: 'collectionsApi',
  baseQuery,
  tagTypes: ['Collection', 'CollectionList', 'CollectionItems'],
  endpoints: (builder) => ({
    // ────────────────────────────────────────────────
    // 1. Create a new collection
    // POST /api/collections
    // ────────────────────────────────────────────────
    createCollection: builder.mutation<
      { collection: CollectionRow },
      {
        name: string;
        description?: string | null;
        is_public?: boolean;
        cover_image_url?: string | null;
        owner_type: 'user' | 'brand';
        owner_id: string;
      }
    >({
      query: (body) => ({
        url: '/collections',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['CollectionList'],
    }),

    // ────────────────────────────────────────────────
    // 2. Get collections (filtered by owner)
    // GET /api/collections ?owner_type=user&owner_id=xxx
    // ────────────────────────────────────────────────
    getCollections: builder.query<
      { collections: CollectionRow[] },
      { owner_type?: 'user' | 'brand'; owner_id?: string }
    >({
      query: (params) => ({
        url: '/collections',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.collections.map(({ id }) => ({ type: 'Collection' as const, id })),
              { type: 'CollectionList', id: 'LIST' },
            ]
          : [{ type: 'CollectionList', id: 'LIST' }],
    }),

    // ────────────────────────────────────────────────
    // 3. Get single collection + items
    // GET /api/collections/:id
    // ────────────────────────────────────────────────
    getCollection: builder.query<
      { collection: CollectionRow; items?: CollectionItemRow[] },
      string // collection id
    >({
      query: (id) => `/collections/${id}`,
      providesTags: (result, error, id) => [{ type: 'Collection', id }],
    }),

    // ────────────────────────────────────────────────
    // 4. Update collection
    // PUT /api/collections/:id
    // ────────────────────────────────────────────────
    updateCollection: builder.mutation<
      { collection: CollectionRow },
      Partial<CollectionRow> & { id: string }
    >({
      query: ({ id, ...patch }) => ({
        url: `/collections/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Collection', id },
        { type: 'CollectionList', id: 'LIST' },
      ],
    }),

    // ────────────────────────────────────────────────
    // 5. Delete collection (soft or hard – depending on backend)
    // DELETE /api/collections/:id
    // ────────────────────────────────────────────────
    deleteCollection: builder.mutation<void, string>({
      query: (id) => ({
        url: `/collections/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Collection', id },
        { type: 'CollectionList', id: 'LIST' },
      ],
    }),

    // ────────────────────────────────────────────────
    // Bonus: Add artwork to collection
    // POST /api/collections/:collectionId/items
    // ────────────────────────────────────────────────
    addArtworkToCollection: builder.mutation<void, { collectionId: string; artworkId: string }>({
      query: ({ collectionId, artworkId }) => ({
        url: `/collections/${collectionId}/items`,
        method: 'POST',
        body: { artworkId },
      }),
      invalidatesTags: (result, error, { collectionId }) => [
        { type: 'Collection', id: collectionId },
      ],
    }),

    // ────────────────────────────────────────────────
    // Bonus: Remove artwork from collection
    // DELETE /api/collections/:collectionId/items/:artworkId
    // ────────────────────────────────────────────────
    removeArtworkFromCollection: builder.mutation<
      void,
      { collectionId: string; artworkId: string }
    >({
      query: ({ collectionId, artworkId }) => ({
        url: `/collections/${collectionId}/items/${artworkId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { collectionId }) => [
        { type: 'Collection', id: collectionId },
      ],
    }),
  }),
});

// Export hooks
export const {
  useCreateCollectionMutation,
  useGetCollectionsQuery,
  useGetCollectionQuery,
  useUpdateCollectionMutation,
  useDeleteCollectionMutation,
  useAddArtworkToCollectionMutation,
  useRemoveArtworkFromCollectionMutation,
} = collectionsApi;
