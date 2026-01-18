import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

/**
 * Aligned strictly with LicenseRow (authoritative schema)
 */
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

  // ── derived / expanded fields (API join responses, optional) ──
  artwork?: {
    id: string;
    title: string;
    thumbnail_url?: string | null;
  };
  buyer?: {
    id: string;
    username: string;
    email?: string;
  };
  seller?: {
    id: string;
    username: string;
  };
}

export interface RevokeLicenseRequest {
  id: string;
  reason?: string;
}

// ─────────────────────────────────────────────────────────────

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

  tagTypes: ['MyLicenses', 'License', 'IssuedLicenses', 'AllLicenses'],

  endpoints: (builder) => ({
    // ── Buyer routes ─────────────────────────────────────────

    // GET /licenses/me
    getMyLicenses: builder.query<License[], void>({
      query: () => '/me',
      providesTags: ['MyLicenses'],
    }),

    // GET /licenses/:id
    getLicense: builder.query<License, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'License', id }],
    }),

    // ── Seller / Brand routes ────────────────────────────────

    // GET /licenses/issued
    getIssuedLicenses: builder.query<License[], void>({
      query: () => '/issued',
      providesTags: ['IssuedLicenses'],
    }),

    // PATCH /licenses/:id/revoke
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

    // ── Admin routes ────────────────────────────────────────

    // GET /licenses
    getAllLicenses: builder.query<License[], void>({
      query: () => '/',
      providesTags: ['AllLicenses'],
    }),
  }),
});

export const {
  useGetMyLicensesQuery,
  useGetLicenseQuery,

  useGetIssuedLicensesQuery,
  useRevokeLicenseMutation,

  useGetAllLicensesQuery,

  useLazyGetMyLicensesQuery,
  useLazyGetLicenseQuery,
} = licensesApi;

export default licensesApi;
