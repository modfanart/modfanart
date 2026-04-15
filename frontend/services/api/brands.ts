import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

/* =========================================================
   TYPES
========================================================= */

export interface Brand {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  website: string | null;
  social_links: Record<string, string> | null;
  status: 'active' | 'suspended' | 'pending' | 'deactivated';
  verification_request_id: string | null;
  followers_count: number;
  views_count: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;

  artworks?: BrandArtwork[];
  posts?: BrandPost[];
  managers?: BrandManager[];
}

export interface BrandArtwork {
  id: string;
  title: string;
  slug: string;
  preview_url: string | null;
  is_featured: boolean;
  sort_order: number;
}

export interface BrandPost {
  id: string;
  brand_id: string;
  title: string;
  content: string | null;
  media_urls: string[] | null;
  status: 'draft' | 'published' | 'archived';
  is_pinned: boolean;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
}

export interface BrandManager {
  user_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  role: 'owner' | 'manager' | 'editor';
}

export interface BrandVerificationRequest {
  id: string;
  company_name: string;
  website: string | null;
  contact_email: string;
  contact_phone: string | null;
  description: string | null;
  documents: string[];
  status: 'pending' | 'approved' | 'rejected' | 'interview_scheduled';
  created_at: string;
  updated_at: string;
}

interface Success {
  success: true;
  message?: string;
}

/* =========================================================
   API
========================================================= */

export const brandApi = createApi({
  reducerPath: 'brandApi',

  baseQuery: fetchBaseQuery({
    baseUrl: '/api/brands',
    credentials: 'include',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),

  tagTypes: [
    'Brand',
    'BrandDetail',
    'MyBrands',
    'BrandArtworks',
    'BrandPosts',
    'BrandPostDetail',
    'BrandPostComments',
    'VerificationRequestList',
    'BrandManagers',
  ],

  endpoints: (builder) => ({
    /* =========================
       PUBLIC
    ========================= */

    getAllBrands: builder.query<{ brands: Brand[]; pagination: any }, any>({
      query: (params) => ({ url: '/', params }),
      providesTags: (result) =>
        result
          ? [
              ...result.brands.map((b) => ({ type: 'Brand' as const, id: b.id })),
              { type: 'Brand', id: 'LIST' },
            ]
          : [{ type: 'Brand', id: 'LIST' }],
    }),

    getBrand: builder.query<Brand, string>({
      query: (id) => `/${id}`,
      providesTags: (result, _, id) => [
        { type: 'Brand', id },
        { type: 'BrandDetail', id },
      ],
    }),

    getBrandBySlug: builder.query<Brand, string>({
      query: (slug) => `/slug/${slug}`,
      providesTags: (result) => (result ? [{ type: 'Brand', id: result.id }] : []),
    }),

    incrementBrandView: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}/view`,
        method: 'POST',
      }),
    }),
getBrandManagers: builder.query<BrandManager[], string>({
      query: (brandId) => `/${brandId}/managers`,
      providesTags: (_, __, brandId) => [{ type: 'BrandManagers', id: brandId }],
    }),

    assignBrandManager: builder.mutation<
      { success: true; manager: BrandManager },
      { brandId: string; userId: string; role: 'owner' | 'manager' | 'editor' }
    >({
      query: ({ brandId, ...body }) => ({
        url: `/${brandId}/managers`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_, __, { brandId }) => [
        { type: 'BrandManagers', id: brandId },
        { type: 'Brand', id: brandId },
        { type: 'BrandDetail', id: brandId },
        { type: 'MyBrands', id: 'LIST' },
      ],
    }),
    /* =========================
       FOLLOW
    ========================= */

    followBrand: builder.mutation<Success, string>({
      query: (id) => ({ url: `/${id}/follow`, method: 'POST' }),
      invalidatesTags: (_, __, id) => [{ type: 'Brand', id }],
    }),

    unfollowBrand: builder.mutation<Success, string>({
      query: (id) => ({ url: `/${id}/follow`, method: 'DELETE' }),
      invalidatesTags: (_, __, id) => [{ type: 'Brand', id }],
    }),

    checkIfFollowing: builder.query<boolean, string>({
      query: (id) => `/${id}/is-following`,
      transformResponse: (r: { isFollowing: boolean }) => r.isFollowing,
    }),

    /* =========================
       MY BRANDS
    ========================= */

    getMyBrands: builder.query<Brand[], void>({
      query: () => '/my',
      providesTags: (result) =>
        result
          ? [
              ...result.map((b) => ({ type: 'Brand' as const, id: b.id })),
              { type: 'MyBrands', id: 'LIST' },
            ]
          : [{ type: 'MyBrands', id: 'LIST' }],
    }),

    updateBrand: builder.mutation<Brand, { id: string; data: Partial<Brand> }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: 'Brand', id },
        { type: 'BrandDetail', id },
        { type: 'MyBrands', id: 'LIST' },
      ],
    }),

    deleteBrand: builder.mutation<void, string>({
      query: (id) => ({ url: `/${id}`, method: 'DELETE' }),
      invalidatesTags: (_, __, id) => [
        { type: 'Brand', id },
        { type: 'MyBrands', id: 'LIST' },
      ],
    }),

    /* =========================
       ARTWORKS
    ========================= */

    getBrandArtworks: builder.query<BrandArtwork[], string>({
      query: (brandId) => `/${brandId}/artworks`,
      providesTags: (_, __, id) => [{ type: 'BrandArtworks', id }],
    }),

    addArtworkToBrand: builder.mutation<Success, { brandId: string; artworkId: string }>({
      query: ({ brandId, ...body }) => ({
        url: `/${brandId}/artworks`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_, __, { brandId }) => [{ type: 'BrandArtworks', id: brandId }],
    }),

    removeArtworkFromBrand: builder.mutation<void, { brandId: string; artworkId: string }>({
      query: ({ brandId, artworkId }) => ({
        url: `/${brandId}/artworks/${artworkId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_, __, { brandId }) => [{ type: 'BrandArtworks', id: brandId }],
    }),

    /* =========================
       POSTS
    ========================= */

    getBrandPosts: builder.query<BrandPost[], string>({
      query: (brandId) => `/${brandId}/posts`,
      providesTags: (_, __, id) => [{ type: 'BrandPosts', id }],
    }),

    getBrandPost: builder.query<BrandPost, { brandId: string; postId: string }>({
      query: ({ brandId, postId }) => `/${brandId}/posts/${postId}`,
      providesTags: (_, __, { postId }) => [{ type: 'BrandPostDetail', id: postId }],
    }),

    createBrandPost: builder.mutation<BrandPost, { brandId: string; data: any }>({
      query: ({ brandId, data }) => ({
        url: `/${brandId}/posts`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_, __, { brandId }) => [{ type: 'BrandPosts', id: brandId }],
    }),

    updateBrandPost: builder.mutation<BrandPost, { brandId: string; postId: string; data: any }>({
      query: ({ brandId, postId, data }) => ({
        url: `/${brandId}/posts/${postId}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_, __, { brandId, postId }) => [
        { type: 'BrandPostDetail', id: postId },
        { type: 'BrandPosts', id: brandId },
      ],
    }),

    deleteBrandPost: builder.mutation<void, { brandId: string; postId: string }>({
      query: ({ brandId, postId }) => ({
        url: `/${brandId}/posts/${postId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_, __, { brandId, postId }) => [
        { type: 'BrandPostDetail', id: postId },
        { type: 'BrandPosts', id: brandId },
      ],
    }),

    togglePinBrandPost: builder.mutation<
      Success,
      { brandId: string; postId: string; pin: boolean }
    >({
      query: ({ brandId, postId, pin }) => ({
        url: `/${brandId}/posts/${postId}/pin`,
        method: 'PATCH',
        body: { pin },
      }),
      invalidatesTags: (_, __, { brandId, postId }) => [
        { type: 'BrandPostDetail', id: postId },
        { type: 'BrandPosts', id: brandId },
      ],
    }),

    /* =========================
       LIKES
    ========================= */

    likeBrandPost: builder.mutation<Success, { brandId: string; postId: string }>({
      query: ({ brandId, postId }) => ({
        url: `/${brandId}/posts/${postId}/like`,
        method: 'POST',
      }),
      invalidatesTags: (_, __, { postId }) => [{ type: 'BrandPostDetail', id: postId }],
    }),

    unlikeBrandPost: builder.mutation<Success, { brandId: string; postId: string }>({
      query: ({ brandId, postId }) => ({
        url: `/${brandId}/posts/${postId}/like`,
        method: 'DELETE',
      }),
      invalidatesTags: (_, __, { postId }) => [{ type: 'BrandPostDetail', id: postId }],
    }),

    /* =========================
       COMMENTS
    ========================= */

    getBrandPostComments: builder.query<any[], { brandId: string; postId: string }>({
      query: ({ brandId, postId }) => `/${brandId}/posts/${postId}/comments`,
      providesTags: (_, __, { postId }) => [{ type: 'BrandPostComments', id: postId }],
    }),

    createBrandPostComment: builder.mutation<
      any,
      { brandId: string; postId: string; content: string }
    >({
      query: ({ brandId, postId, ...body }) => ({
        url: `/${brandId}/posts/${postId}/comments`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_, __, { postId }) => [
        { type: 'BrandPostComments', id: postId },
        { type: 'BrandPostDetail', id: postId },
      ],
    }),

    deleteBrandPostComment: builder.mutation<
      void,
      { brandId: string; postId: string; commentId: string }
    >({
      query: ({ brandId, postId, commentId }) => ({
        url: `/${brandId}/posts/${postId}/comments/${commentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_, __, { postId }) => [{ type: 'BrandPostComments', id: postId }],
    }),

    likeBrandPostComment: builder.mutation<
      Success,
      { brandId: string; postId: string; commentId: string }
    >({
      query: ({ brandId, postId, commentId }) => ({
        url: `/${brandId}/posts/${postId}/comments/${commentId}/like`,
        method: 'POST',
      }),
      invalidatesTags: (_, __, { postId }) => [{ type: 'BrandPostComments', id: postId }],
    }),

    /* =========================
       VERIFICATION
    ========================= */

    submitBrandVerificationRequest: builder.mutation<{ requestId: string }, any>({
      query: (body) => ({
        url: '/verification-requests',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['VerificationRequestList'],
    }),

    getVerificationRequests: builder.query<BrandVerificationRequest[], void>({
      query: () => '/verification-requests',
      providesTags: ['VerificationRequestList'],
    }),

    approveVerificationRequest: builder.mutation<Success, { requestId: string; notes?: string }>({
      query: ({ requestId, ...body }) => ({
        url: `/verification-requests/${requestId}/approve`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['VerificationRequestList', 'MyBrands'],
    }),

    /* =========================
       ADMIN
    ========================= */

    adminCreateBrand: builder.mutation<Brand, any>({
      query: (body) => ({
        url: '/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Brand', 'MyBrands'],
    }),
  }),
});

/* =========================================================
   HOOKS
========================================================= */

export const {
  useGetAllBrandsQuery,
  useGetBrandQuery,
  useGetBrandBySlugQuery,
  useIncrementBrandViewMutation,

  useFollowBrandMutation,
  useUnfollowBrandMutation,
  useCheckIfFollowingQuery,

  useGetMyBrandsQuery,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
useGetBrandManagersQuery, useAssignBrandManagerMutation, 
  useGetBrandArtworksQuery,
  useAddArtworkToBrandMutation,
  useRemoveArtworkFromBrandMutation,

  useGetBrandPostsQuery,
  useGetBrandPostQuery,
  useCreateBrandPostMutation,
  useUpdateBrandPostMutation,
  useDeleteBrandPostMutation,
  useTogglePinBrandPostMutation,

  useLikeBrandPostMutation,
  useUnlikeBrandPostMutation,

  useGetBrandPostCommentsQuery,
  useCreateBrandPostCommentMutation,
  useDeleteBrandPostCommentMutation,
  useLikeBrandPostCommentMutation,

  useSubmitBrandVerificationRequestMutation,
  useGetVerificationRequestsQuery,
  useApproveVerificationRequestMutation,

  useAdminCreateBrandMutation,
} = brandApi;

export default brandApi;
