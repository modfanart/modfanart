// src/services/api/licensesApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface License {
  id: string;
  order_item_id: string;
  artwork_id: string;
  buyer_id: string;
  seller_id: string;
  license_type: string;
  contract_pdf_url: string;
  expires_at?: string | null;
  is_active: boolean;
  revoked_at?: string | null;
  created_at: string;

  // expanded fields (joined)
  artwork?: {
    id: string;
    title: string;
    thumbnail_url?: string | null;
  };
  buyer?: { id: string; username: string; email?: string };
  seller?: { id: string; username: string };
}

export interface RevokeLicenseRequest {
  id: string;
  reason?: string | undefined;
}

/**
 * Payload the frontend sends when initiating a license purchase
 */
export interface CreateLicenseCheckoutSessionRequest {
  artwork_id: string;
  pricing_tier_id: string;
}

/**
 * Response from /api/licenses/checkout-session
 */
export interface LicenseCheckoutSessionResponse {
  clientSecret: string; // paymentIntent.client_secret
  orderId: string;
  amount: number; // total in cents
  currency: string; // 'inr' | 'usd'
  // optional extras you might return
  paymentIntentId?: string;
  metadata?: Record<string, any>;
}

export const licensesApi = createApi({
  reducerPath: 'licensesApi',

  baseQuery: fetchBaseQuery({
    baseUrl: '/api/licenses',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any)?.auth?.accessToken;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),

  tagTypes: [
    'MyLicenses',
    'License',
    'IssuedLicenses',
    'AllLicenses',
    // You could add 'PendingOrders' if you want to invalidate later
  ],

  endpoints: (builder) => ({
    // ── Buyer: My licenses ────────────────────────────────
    getMyLicenses: builder.query<License[], void>({
      query: () => '/me',
      providesTags: ['MyLicenses'],
    }),

    getLicense: builder.query<License, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'License', id }],
    }),

    // ── Seller: Issued licenses ───────────────────────────
    getIssuedLicenses: builder.query<License[], void>({
      query: () => '/issued',
      providesTags: ['IssuedLicenses'],
    }),

    revokeLicense: builder.mutation<License, RevokeLicenseRequest>({
      query: ({ id, reason }) => ({
        url: `/${id}/revoke`,
        method: 'PATCH',
        body: { reason },
      }),
      invalidatesTags: (result, error, { id }) => [
        'MyLicenses',
        'IssuedLicenses',
        'AllLicenses',
        { type: 'License', id },
      ],
    }),

    // ── Admin ─────────────────────────────────────────────
    getAllLicenses: builder.query<License[], void>({
      query: () => '/',
      providesTags: ['AllLicenses'],
    }),

    // ── NEW: Create Stripe checkout session / PaymentIntent ──
    createLicenseCheckoutSession: builder.mutation<
      LicenseCheckoutSessionResponse,
      CreateLicenseCheckoutSessionRequest
    >({
      query: (body) => ({
        url: '/checkout-session', // or '/checkout' — match your route
        method: 'POST',
        body,
      }),
      // Optional: invalidate tags if needed (e.g. pending orders)
      // invalidatesTags: ['MyLicenses'], // usually not needed here
    }),
  }),
});

export const {
  useGetMyLicensesQuery,
  useGetLicenseQuery,
  useGetIssuedLicensesQuery,
  useRevokeLicenseMutation,
  useGetAllLicensesQuery,

  // new hook
  useCreateLicenseCheckoutSessionMutation,

  // lazy versions if needed
  useLazyGetMyLicensesQuery,
  useLazyGetLicenseQuery,
} = licensesApi;

export default licensesApi;
