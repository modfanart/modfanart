import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '..';
import {
  isSellerMockEnabled,
  mockSellerPayouts,
  type SellerPayout,
} from '@/services/mocks/seller.fixtures';

/**
 * Seller payouts. Points at the real marketplace route GET /payout/mine
 * (envelope `{ payouts }`); serves fixtures under NEXT_PUBLIC_MOCK_SELLER until
 * that backend is merged. Search `TODO(marketplace)` to drop the seam.
 */

const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE_URL}/payout`,
  credentials: 'include',
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

export const payoutApi = createApi({
  reducerPath: 'payoutApi',
  baseQuery: rawBaseQuery,
  tagTypes: ['MyPayouts'],
  endpoints: (builder) => ({
    getMyPayouts: builder.query<SellerPayout[], void>({
      queryFn: async (_arg, _api, _extra, baseQuery) => {
        if (isSellerMockEnabled()) {
          return { data: mockSellerPayouts }; // TODO(marketplace): remove mock seam
        }
        const res = await baseQuery('/mine');
        if (res.error) return { error: res.error };
        return { data: (res.data as { payouts: SellerPayout[] }).payouts };
      },
      providesTags: ['MyPayouts'],
    }),
  }),
});

export const { useGetMyPayoutsQuery } = payoutApi;

export default payoutApi;
