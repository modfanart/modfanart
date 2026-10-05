import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '..';
import {
  isSellerMockEnabled,
  mockSellerProducts,
  type MerchProduct,
} from '@/services/mocks/seller.fixtures';

/**
 * Seller merch products. Points at the real marketplace route GET /merch/mine
 * (envelope `{ products }`); serves fixtures under NEXT_PUBLIC_MOCK_SELLER until
 * that backend is merged. Search `TODO(marketplace)` to drop the seam.
 */

const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE_URL}/merch`,
  credentials: 'include',
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

export const merchApi = createApi({
  reducerPath: 'merchApi',
  baseQuery: rawBaseQuery,
  tagTypes: ['MyMerchProducts'],
  endpoints: (builder) => ({
    getMyProducts: builder.query<MerchProduct[], void>({
      queryFn: async (_arg, _api, _extra, baseQuery) => {
        if (isSellerMockEnabled()) {
          return { data: mockSellerProducts }; // TODO(marketplace): remove mock seam
        }
        const res = await baseQuery('/mine');
        if (res.error) return { error: res.error };
        return { data: (res.data as { products: MerchProduct[] }).products };
      },
      providesTags: ['MyMerchProducts'],
    }),
  }),
});

export const { useGetMyProductsQuery } = merchApi;

export default merchApi;
