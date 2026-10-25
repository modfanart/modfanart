// Merch Marketplace API — aligned with backend /merch and /seller-profiles
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  MerchProduct,
  MerchVariant,
  SellerProfile,
  CreateMerchProductPayload,
  UpdateMerchProductPayload,
  CreateVariantPayload,
  UpdateVariantPayload,
  ModerateProductPayload,
  ApplySellerPayload,
  DecideSellerPayload,
} from '../types/merch';
import { API_BASE_URL } from '..';

export const merchApi = createApi({
  reducerPath: 'merchApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any)?.auth?.accessToken;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['MerchProducts', 'MerchProduct', 'MyMerchProducts', 'SellerProfile', 'PendingSellers'],
  endpoints: (builder) => ({
    // ── Public marketplace ───────────────────────────────────
    getPublishedProducts: builder.query<{ products: MerchProduct[] }, void>({
      query: () => '/merch',
      providesTags: (result) =>
        result
          ? [
              ...result.products.map(({ id }) => ({
                type: 'MerchProducts' as const,
                id,
              })),
              { type: 'MerchProducts', id: 'LIST' },
            ]
          : [{ type: 'MerchProducts', id: 'LIST' }],
    }),

    getProduct: builder.query<{ product: MerchProduct }, string>({
      query: (id) => `/merch/${id}`,
      providesTags: (_result, _err, id) => [{ type: 'MerchProduct', id }],
    }),

    // ── Seller: own products ─────────────────────────────────
    getMyProducts: builder.query<{ products: MerchProduct[] }, void>({
      query: () => '/merch/mine',
      providesTags: (result) =>
        result
          ? [
              ...result.products.map(({ id }) => ({
                type: 'MyMerchProducts' as const,
                id,
              })),
              { type: 'MyMerchProducts', id: 'LIST' },
            ]
          : [{ type: 'MyMerchProducts', id: 'LIST' }],
    }),

    createProduct: builder.mutation<
      { message: string; product: MerchProduct },
      CreateMerchProductPayload
    >({
      query: (body) => ({
        url: '/merch',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'MyMerchProducts', id: 'LIST' },
        { type: 'MerchProducts', id: 'LIST' },
      ],
    }),

    updateProduct: builder.mutation<
      { message: string; product: MerchProduct },
      { id: string; data: UpdateMerchProductPayload }
    >({
      query: ({ id, data }) => ({
        url: `/merch/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'MerchProduct', id },
        { type: 'MyMerchProducts', id },
        { type: 'MyMerchProducts', id: 'LIST' },
        { type: 'MerchProducts', id: 'LIST' },
      ],
    }),

    submitForReview: builder.mutation<{ message: string; product: MerchProduct }, string>({
      query: (id) => ({
        url: `/merch/${id}/submit-for-review`,
        method: 'POST',
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'MerchProduct', id },
        { type: 'MyMerchProducts', id },
        { type: 'MyMerchProducts', id: 'LIST' },
      ],
    }),

    moderateProduct: builder.mutation<
      { message: string; product: MerchProduct },
      { id: string; data: ModerateProductPayload }
    >({
      query: ({ id, data }) => ({
        url: `/merch/${id}/moderate`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'MerchProduct', id },
        { type: 'MerchProducts', id: 'LIST' },
        { type: 'MyMerchProducts', id: 'LIST' },
      ],
    }),

    deleteProduct: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/merch/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'MerchProduct', id },
        { type: 'MyMerchProducts', id: 'LIST' },
        { type: 'MerchProducts', id: 'LIST' },
      ],
    }),

    // ── Variants ─────────────────────────────────────────────
    addVariant: builder.mutation<
      { message: string; variant: MerchVariant },
      { productId: string; data: CreateVariantPayload }
    >({
      query: ({ productId, data }) => ({
        url: `/merch/${productId}/variants`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_r, _e, { productId }) => [
        { type: 'MerchProduct', id: productId },
        { type: 'MyMerchProducts', id: productId },
      ],
    }),

    updateVariant: builder.mutation<
      { message: string; variant: MerchVariant },
      { variantId: string; productId: string; data: UpdateVariantPayload }
    >({
      query: ({ variantId, data }) => ({
        url: `/merch/variants/${variantId}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_r, _e, { productId }) => [
        { type: 'MerchProduct', id: productId },
        { type: 'MyMerchProducts', id: productId },
      ],
    }),

    deleteVariant: builder.mutation<{ message: string }, { variantId: string; productId: string }>({
      query: ({ variantId }) => ({
        url: `/merch/variants/${variantId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, { productId }) => [
        { type: 'MerchProduct', id: productId },
        { type: 'MyMerchProducts', id: productId },
      ],
    }),

    // ── Seller profiles ──────────────────────────────────────
    getMySellerProfile: builder.query<{ profile: SellerProfile | null }, void>({
      query: () => '/seller-profiles/mine',
      providesTags: [{ type: 'SellerProfile', id: 'MINE' }],
    }),

    applySeller: builder.mutation<{ message: string; profile: SellerProfile }, ApplySellerPayload>({
      query: (body) => ({
        url: '/seller-profiles',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'SellerProfile', id: 'MINE' }],
    }),

    listPendingSellers: builder.query<{ profiles: SellerProfile[] }, void>({
      query: () => '/seller-profiles/pending',
      providesTags: [{ type: 'PendingSellers', id: 'LIST' }],
    }),

    decideSeller: builder.mutation<
      { message: string; profile: SellerProfile },
      { id: string; data: DecideSellerPayload }
    >({
      query: ({ id, data }) => ({
        url: `/seller-profiles/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: [
        { type: 'PendingSellers', id: 'LIST' },
        { type: 'SellerProfile', id: 'MINE' },
      ],
    }),
  }),
});

export const {
  useGetPublishedProductsQuery,
  useGetProductQuery,
  useGetMyProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useSubmitForReviewMutation,
  useModerateProductMutation,
  useDeleteProductMutation,
  useAddVariantMutation,
  useUpdateVariantMutation,
  useDeleteVariantMutation,
  useGetMySellerProfileQuery,
  useApplySellerMutation,
  useListPendingSellersQuery,
  useDecideSellerMutation,
} = merchApi;
