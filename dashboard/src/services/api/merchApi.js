// src/services/api/merchApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '..';

export const merchApi = createApi({
  reducerPath: 'merchApi',

  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/merch`,
    credentials: 'include',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),

  tagTypes: ['MerchProduct', 'MerchProductList', 'MyMerch', 'PrintProviders'],

  endpoints: (builder) => ({
    getPublishedProducts: builder.query({
      query: (params = {}) => {
        const queryParams = {};
        if (params.search) queryParams.search = params.search;
        if (params.type) queryParams.type = params.type;
        if (params.fulfillment_type)
          queryParams.fulfillment_type = params.fulfillment_type;
        if (params.brand_id) queryParams.brand_id = params.brand_id;
        if (params.seller_id) queryParams.seller_id = params.seller_id;
        if (params.artwork_id) queryParams.artwork_id = params.artwork_id;
        if (params.sort) queryParams.sort = params.sort;

        return {
          url: '/',
          params: queryParams,
        };
      },
      providesTags: (result) =>
        result?.products
          ? [
              ...result.products.map((p) => ({
                type: 'MerchProduct',
                id: p.id,
              })),
              { type: 'MerchProductList', id: 'LIST' },
            ]
          : [{ type: 'MerchProductList', id: 'LIST' }],
    }),

    getProduct: builder.query({
      query: (id) => `/${id}`,
      providesTags: (result, _, id) => [{ type: 'MerchProduct', id }],
    }),

    getMyProducts: builder.query({
      query: () => '/mine',
      providesTags: (result) =>
        result?.products
          ? [
              ...result.products.map((p) => ({
                type: 'MerchProduct',
                id: p.id,
              })),
              { type: 'MyMerch', id: 'LIST' },
            ]
          : [{ type: 'MyMerch', id: 'LIST' }],
    }),

    getMySummary: builder.query({
      query: () => '/mine/summary',
      providesTags: [{ type: 'MyMerch', id: 'SUMMARY' }],
    }),

    getPrintProviders: builder.query({
      query: () => '/print-providers',
      providesTags: ['PrintProviders'],
    }),

    getEligibleArtworks: builder.query({
      query: (params = {}) => ({
        url: '/eligible-artworks',
        params: params.brand_id ? { brand_id: params.brand_id } : {},
      }),
    }),

    createProduct: builder.mutation({
      query: (body) => ({
        url: '/',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'MerchProductList', id: 'LIST' },
        { type: 'MyMerch', id: 'LIST' },
      ],
    }),

    updateProduct: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'MerchProduct', id },
        { type: 'MerchProductList', id: 'LIST' },
        { type: 'MyMerch', id: 'LIST' },
      ],
    }),

    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'MerchProduct', id },
        { type: 'MerchProductList', id: 'LIST' },
        { type: 'MyMerch', id: 'LIST' },
      ],
    }),

    submitForReview: builder.mutation({
      query: (id) => ({
        url: `/${id}/submit-for-review`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'MerchProduct', id },
        { type: 'MyMerch', id: 'LIST' },
      ],
    }),

    addVariant: builder.mutation({
      query: ({ productId, ...body }) => ({
        url: `/${productId}/variants`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: 'MerchProduct', id: productId },
      ],
    }),

    updateVariant: builder.mutation({
      query: ({ variantId, productId, ...body }) => ({
        url: `/variants/${variantId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: 'MerchProduct', id: productId },
      ],
    }),

    deleteVariant: builder.mutation({
      query: ({ variantId, productId }) => ({
        url: `/variants/${variantId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: 'MerchProduct', id: productId },
      ],
    }),
  }),
});

export const {
  useGetPublishedProductsQuery,
  useGetProductQuery,
  useGetMyProductsQuery,
  useGetMySummaryQuery,
  useGetPrintProvidersQuery,
  useGetEligibleArtworksQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useSubmitForReviewMutation,
  useAddVariantMutation,
  useUpdateVariantMutation,
  useDeleteVariantMutation,
} = merchApi;

export default merchApi;
