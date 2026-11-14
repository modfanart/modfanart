// src/services/api/opsApi.js
//
// Workspace operations: activity logs, RBAC matrix, campaigns (contests,
// prizes) and marketplace / finance administration. One slice so related
// screens share cache tags (e.g. approving a seller refreshes the overview).

import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '../baseQuery';
import { API_BASE_URL } from '..';

const clean = (params = {}) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''));

export const opsApi = createApi({
  reducerPath: 'opsApi',
  baseQuery: createBaseQuery(''),
  tagTypes: [
    'Audit',
    'RoleMatrix',
    'RoleMembers',
    'Users',
    'Contests',
    'Prizes',
    'Products',
    'Sellers',
    'Orders',
    'Payouts',
    'FeeRules',
    'Providers',
    'Reviews',
    'Disputes',
    'Overview',
    'BrandRequests',
  ],
  endpoints: (b) => ({
    // ── Activity logs ───────────────────────────────────────────────
    getAuditEvents: b.query({
      query: (params) => ({ url: '/audit', params: clean(params) }),
      providesTags: ['Audit'],
    }),
    getAuditEvent: b.query({
      query: (id) => `/audit/${id}`,
      transformResponse: (r) => r?.data ?? r,
    }),
    getAuditFacets: b.query({ query: () => '/audit/facets', providesTags: ['Audit'] }),
    getAuditDaily: b.query({
      query: (params) => ({ url: '/audit/daily', params: clean(params) }),
      transformResponse: (r) => r?.data ?? [],
      providesTags: ['Audit'],
    }),

    // ── RBAC ────────────────────────────────────────────────────────
    getRoleMatrix: b.query({ query: () => '/roles/matrix', providesTags: ['RoleMatrix'] }),
    getRoleMembers: b.query({
      query: (roleId) => `/roles/${roleId}/members`,
      transformResponse: (r) => r?.members ?? [],
      providesTags: (r, e, id) => [{ type: 'RoleMembers', id }],
    }),
    createRole: b.mutation({
      query: (body) => ({ url: '/roles', method: 'POST', body }),
      invalidatesTags: ['RoleMatrix', 'Audit'],
    }),
    updateRole: b.mutation({
      query: ({ id, ...body }) => ({ url: `/roles/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['RoleMatrix', 'Audit'],
    }),
    deleteRole: b.mutation({
      query: (id) => ({ url: `/roles/${id}`, method: 'DELETE' }),
      invalidatesTags: ['RoleMatrix', 'Audit'],
    }),
    assignRole: b.mutation({
      query: ({ userId, roleId }) => ({ url: `/roles/users/${userId}/roles`, method: 'POST', body: { roleId } }),
      invalidatesTags: ['RoleMatrix', 'RoleMembers', 'Users', 'Audit'],
    }),
    searchUsers: b.query({
      query: (params) => ({ url: '/admin/users', params: clean({ limit: 20, ...params }) }),
      providesTags: ['Users'],
    }),

    // ── Campaigns ───────────────────────────────────────────────────
    getAllContests: b.query({
      query: (params) => ({ url: '/contest', params: clean({ scope: 'all', limit: 50, ...params }) }),
      providesTags: ['Contests'],
    }),
    updateContest: b.mutation({
      query: ({ id, ...body }) => ({ url: `/contest/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Contests', 'Audit'],
    }),
    deleteContest: b.mutation({
      query: (id) => ({ url: `/contest/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Contests', 'Audit'],
    }),
    distributePrizes: b.mutation({
      query: (id) => ({ url: `/contest/${id}/distribute-prizes`, method: 'POST' }),
      invalidatesTags: ['Prizes', 'Overview', 'Audit'],
    }),
    getPrizes: b.query({
      query: (params) => ({ url: '/marketplace-admin/prizes', params: clean(params) }),
      providesTags: ['Prizes'],
    }),
    setPrizeStatus: b.mutation({
      query: ({ id, ...body }) => ({ url: `/marketplace-admin/prizes/${id}/status`, method: 'PATCH', body }),
      invalidatesTags: ['Prizes', 'Overview', 'Audit'],
    }),

    // ── Brand applications ──────────────────────────────────────────
    getBrandRequests: b.query({
      query: (params) => ({ url: '/brands/verification-requests', params: clean({ limit: 100, ...params }) }),
      transformResponse: (r) => (Array.isArray(r) ? r : r?.requests ?? []),
      providesTags: ['BrandRequests'],
    }),
    approveBrandRequest: b.mutation({
      query: ({ id, ...body }) => ({ url: `/brands/verification-requests/${id}/approve`, method: 'PATCH', body }),
      invalidatesTags: ['BrandRequests', 'Audit'],
    }),
    rejectBrandRequest: b.mutation({
      query: ({ id, notes }) => ({ url: `/brands/verification-requests/${id}/reject`, method: 'PATCH', body: { notes } }),
      invalidatesTags: ['BrandRequests', 'Audit'],
    }),

    // ── Marketplace ─────────────────────────────────────────────────
    getMarketplaceOverview: b.query({ query: () => '/marketplace-admin/overview', providesTags: ['Overview'] }),

    getAdminProducts: b.query({
      query: (params) => ({ url: '/marketplace-admin/products', params: clean(params) }),
      providesTags: ['Products'],
    }),
    // pending_review listings are decided here (approve / reject with notes)
    moderateProduct: b.mutation({
      query: ({ id, decision, notes }) => ({ url: `/merch/${id}/moderate`, method: 'POST', body: { decision, notes } }),
      invalidatesTags: ['Products', 'Overview', 'Audit'],
    }),
    setProductStatus: b.mutation({
      query: ({ id, status }) => ({ url: `/marketplace-admin/products/${id}/status`, method: 'PATCH', body: { status } }),
      invalidatesTags: ['Products', 'Overview', 'Audit'],
    }),

    getSellerProfiles: b.query({
      query: (params) => ({ url: '/marketplace-admin/sellers', params: clean(params) }),
      transformResponse: (r) => r?.sellers ?? r ?? [],
      providesTags: ['Sellers'],
    }),
    setSellerStatus: b.mutation({
      query: ({ id, status, notes }) => ({
        url: `/marketplace-admin/sellers/${id}/status`,
        method: 'PATCH',
        body: { status, notes },
      }),
      invalidatesTags: ['Sellers', 'Overview', 'Audit'],
    }),

    getAllOrders: b.query({
      query: (params) => ({ url: '/orders/admin/all', params: clean(params) }),
      providesTags: ['Orders'],
    }),
    getOrderDetail: b.query({ query: (id) => `/orders/${id}`, providesTags: ['Orders'] }),
    getOrderFulfillments: b.query({
      query: (orderId) => `/orders/${orderId}/fulfillments`,
      providesTags: ['Orders'],
    }),
    updateFulfillmentStatus: b.mutation({
      query: ({ orderId, id, status }) => ({
        url: `/orders/${orderId}/fulfillments/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Orders', 'Audit'],
    }),
    updateFulfillmentTracking: b.mutation({
      query: ({ orderId, id, ...body }) => ({
        url: `/orders/${orderId}/fulfillments/${id}/tracking`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Orders', 'Audit'],
    }),
    cancelOrder: b.mutation({
      query: (id) => ({ url: `/marketplace-admin/orders/${id}/cancel`, method: 'POST' }),
      invalidatesTags: ['Orders', 'Overview', 'Audit'],
    }),

    getReviews: b.query({
      query: (params) => ({ url: '/marketplace-admin/reviews', params: clean(params) }),
      transformResponse: (r) => r?.reviews ?? [],
      providesTags: ['Reviews'],
    }),
    removeReview: b.mutation({
      query: (id) => ({ url: `/marketplace-admin/reviews/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Reviews', 'Audit'],
    }),

    getProviders: b.query({
      query: () => '/marketplace-admin/print-providers',
      transformResponse: (r) => r?.providers ?? [],
      providesTags: ['Providers'],
    }),
    createProvider: b.mutation({
      query: (body) => ({ url: '/marketplace-admin/print-providers', method: 'POST', body }),
      invalidatesTags: ['Providers', 'Audit'],
    }),
    updateProvider: b.mutation({
      query: ({ id, ...body }) => ({ url: `/marketplace-admin/print-providers/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Providers', 'Audit'],
    }),

    // ── Ledger ──────────────────────────────────────────────────────
    getPayouts: b.query({
      query: (params) => ({ url: '/payout', params: clean(params) }),
      providesTags: ['Payouts'],
    }),
    markPayoutPaid: b.mutation({
      query: ({ id, stripeTransferId }) => ({ url: `/payout/${id}/paid`, method: 'PATCH', body: { stripe_transfer_id: stripeTransferId } }),
      invalidatesTags: ['Payouts', 'Overview', 'Audit'],
    }),
    markPayoutFailed: b.mutation({
      query: ({ id }) => ({ url: `/payout/${id}/failed`, method: 'PATCH' }),
      invalidatesTags: ['Payouts', 'Overview', 'Audit'],
    }),
    generateOrderPayouts: b.mutation({
      query: (orderId) => ({ url: `/payout/orders/${orderId}/generate`, method: 'POST' }),
      invalidatesTags: ['Payouts', 'Overview', 'Audit'],
    }),

    getFeeRules: b.query({
      query: () => '/marketplace-admin/fee-rules',
      transformResponse: (r) => r?.rules ?? [],
      providesTags: ['FeeRules'],
    }),
    createFeeRule: b.mutation({
      query: (body) => ({ url: '/marketplace-admin/fee-rules', method: 'POST', body }),
      invalidatesTags: ['FeeRules', 'Audit'],
    }),
    updateFeeRule: b.mutation({
      query: ({ id, ...body }) => ({ url: `/marketplace-admin/fee-rules/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['FeeRules', 'Audit'],
    }),

    getDisputes: b.query({
      query: (params) => ({ url: '/marketplace-admin/disputes', params: clean(params) }),
      transformResponse: (r) => r?.disputes ?? [],
      providesTags: ['Disputes'],
    }),
  }),
});

/** Authenticated CSV download of the activity log for the current filters. */
export async function downloadAuditCsv(params, token) {
  const qs = new URLSearchParams(clean(params)).toString();
  const res = await fetch(`${API_BASE_URL}/audit/export?${qs}`, {
    headers: { Authorization: `Bearer ${token}`, 'X-Client': 'workspace' },
  });
  if (!res.ok) throw new Error(`Export failed (HTTP ${res.status})`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `activity-log-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export const {
  useGetAuditEventsQuery,
  useGetAuditEventQuery,
  useGetAuditFacetsQuery,
  useGetAuditDailyQuery,
  useGetRoleMatrixQuery,
  useGetRoleMembersQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useAssignRoleMutation,
  useSearchUsersQuery,
  useGetAllContestsQuery,
  useUpdateContestMutation,
  useDeleteContestMutation,
  useDistributePrizesMutation,
  useGetPrizesQuery,
  useSetPrizeStatusMutation,
  useGetMarketplaceOverviewQuery,
  useGetAdminProductsQuery,
  useModerateProductMutation,
  useSetProductStatusMutation,
  useGetSellerProfilesQuery,
  useSetSellerStatusMutation,
  useGetAllOrdersQuery,
  useGetOrderDetailQuery,
  useGetOrderFulfillmentsQuery,
  useUpdateFulfillmentStatusMutation,
  useUpdateFulfillmentTrackingMutation,
  useCancelOrderMutation,
  useGetReviewsQuery,
  useRemoveReviewMutation,
  useGetProvidersQuery,
  useCreateProviderMutation,
  useUpdateProviderMutation,
  useGetPayoutsQuery,
  useMarkPayoutPaidMutation,
  useMarkPayoutFailedMutation,
  useGenerateOrderPayoutsMutation,
  useGetFeeRulesQuery,
  useCreateFeeRuleMutation,
  useUpdateFeeRuleMutation,
  useGetDisputesQuery,
  useGetBrandRequestsQuery,
  useApproveBrandRequestMutation,
  useRejectBrandRequestMutation,
} = opsApi;

export default opsApi;
