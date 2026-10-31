import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '..';
import type { Order } from '@/services/api/orderApi';
import {
  isSellerMockEnabled,
  mockNoSellerProfile,
  type SellerPayoutMethod,
  type SellerProfile,
} from '@/services/mocks/seller.fixtures';

/**
 * Seller onboarding (seller_profiles) + KYC upload + seller-facing order reads.
 *
 * Contract source: backend branch `features/marketplace` @ 855570c,
 * `src/modules/merch/sellerProfile.routes.js`:
 *   GET  <mount>/mine  -> { profile: SellerProfileRow | null }
 *   POST <mount>/      -> { message, profile }   body: { display_name }
 *
 * That router is not mounted in backend/index.js yet, so the mount path below is
 * an assumption agreed in the PR; change SELLER_PROFILE_PATH in one place.
 *
 * Until the backend is merged, each endpoint short-circuits to a fixture when
 * NEXT_PUBLIC_MOCK_SELLER='true' (see services/mocks/seller.fixtures.ts).
 * Search `TODO(marketplace)` to drop the seam.
 */

/** Assumed mount for sellerProfile.routes.js. TODO(marketplace): confirm with backend. */
export const SELLER_PROFILE_PATH = '/sellers';

/** Generic upload route that already exists on main (cdn.routes.js, field `file`). */
const MEDIA_UPLOAD_URL = `${API_BASE_URL}/media/upload`;

export interface SubmitSellerProfileInput {
  /** The only field the backend persists today. */
  display_name: string;
  // Collected by the wizard per the ticket and sent alongside display_name.
  // The current backend ignores unknown keys; the KYC ticket will read them.
  contact_email: string;
  contact_phone?: string | null;
  description?: string | null;
  payout_method: SellerPayoutMethod;
  documents: string[];
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE_URL}${SELLER_PROFILE_PATH}`,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    // The session token lives in the auth slice (set after Firebase sign-in). Nothing ever
    // wrote localStorage 'accessToken', so these requests went out unauthenticated.
    const token = (getState() as any)?.auth?.accessToken;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

export const sellerApi = createApi({
  reducerPath: 'sellerApi',
  baseQuery: rawBaseQuery,
  tagTypes: ['SellerProfile', 'SellerOrders'],
  endpoints: (builder) => ({
    getMySellerProfile: builder.query<SellerProfile | null, void>({
      queryFn: async (_arg, _api, _extra, baseQuery) => {
        if (isSellerMockEnabled()) {
          return { data: mockNoSellerProfile }; // TODO(marketplace): remove mock seam
        }
        const res = await baseQuery('/mine');
        if (res.error) return { error: res.error };
        return { data: (res.data as { profile: SellerProfile | null }).profile ?? null };
      },
      providesTags: ['SellerProfile'],
    }),

    submitSellerProfile: builder.mutation<{ profile: SellerProfile }, SubmitSellerProfileInput>({
      queryFn: async (body, _api, _extra, baseQuery) => {
        if (isSellerMockEnabled()) {
          const now = new Date().toISOString();
          const profile: SellerProfile = {
            id: `mock-profile-${Date.now()}`,
            user_id: 'mock-seller-1',
            display_name: body.display_name,
            status: 'pending',
            payout_ready: false,
            reviewed_by: null,
            reviewed_at: null,
            notes: null,
            created_at: now,
            updated_at: now,
            contact_email: body.contact_email,
            contact_phone: body.contact_phone ?? null,
            description: body.description ?? null,
            payout_method: body.payout_method,
            documents: body.documents,
          };
          return { data: { profile } }; // TODO(marketplace): remove mock seam
        }
        const res = await baseQuery({ url: '/', method: 'POST', body });
        if (res.error) return { error: res.error };
        return { data: res.data as { profile: SellerProfile } };
      },
      invalidatesTags: ['SellerProfile'],
    }),

    uploadKycDocument: builder.mutation<{ url: string }, File>({
      queryFn: async (file, _api, _extra, baseQuery) => {
        if (isSellerMockEnabled()) {
          return { data: { url: `https://mock.local/kyc/${encodeURIComponent(file.name)}` } }; // TODO(marketplace): remove mock seam
        }
        const form = new FormData();
        form.append('file', file);
        // Absolute URL bypasses this slice's baseUrl; the upload lives in the cdn module.
        const res = await baseQuery({ url: MEDIA_UPLOAD_URL, method: 'POST', body: form });
        if (res.error) return { error: res.error };
        const { url } = (res.data as { data: { url: string } }).data;
        return { data: { url } };
      },
    }),

    getSellerOrders: builder.query<Order[], void>({
      queryFn: async (_arg, _api, _extra, baseQuery) => {
        if (isSellerMockEnabled()) {
          return { data: [] }; // TODO(marketplace): remove mock seam
        }
        // TODO(marketplace): no seller-orders endpoint exists on the backend yet;
        // this path is a placeholder for the one a later phase adds.
        const res = await baseQuery('/orders');
        if (res.error) return { error: res.error };
        return { data: (res.data as { orders: Order[] }).orders };
      },
      providesTags: ['SellerOrders'],
    }),
  }),
});

export const {
  useGetMySellerProfileQuery,
  useSubmitSellerProfileMutation,
  useUploadKycDocumentMutation,
  useGetSellerOrdersQuery,
} = sellerApi;

export default sellerApi;
