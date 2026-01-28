// src/services/api/brandApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// ────────────────────────────────────────────────
// Shared Types (aligned with backend responses)
// ────────────────────────────────────────────────

export interface Brand {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  website: string | null;

  /**
   * Social media profile links.
   * Keys are lowercase platform identifiers.
   * Values are full profile URLs (or empty string / null if not set).
   * Common keys in 2025–2026: instagram, tiktok, youtube, facebook, x (twitter), linkedin, pinterest, threads, snapchat, ...
   */
  social_links: {
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    facebook?: string;
    x?: string; // formerly twitter – many APIs migrated to "x"
    twitter?: string; // keep for backward compatibility if needed
    linkedin?: string;
    pinterest?: string;
    threads?: string;
    snapchat?: string;
    [key: string]: string | undefined; // allow any other platform
  } | null;

  status: 'active' | 'suspended' | 'pending' | 'deactivated';
  verification_request_id: string | null;
  followers_count: number;
  views_count?: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;

  // optional when ?withArtworks=true or ?withPosts=true
  artworks?: BrandArtwork[];
  posts?: BrandPost[];
}

export interface BrandArtwork {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  preview_url: string | null;
  status: string;
  is_featured: boolean;
  sort_order: number;
  added_at: string;
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
  deleted_at: string | null;
}

export interface BrandFollower {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  followed_at: string;
}

interface ApiSuccessResponse<T = unknown> {
  success?: boolean;
  message?: string;
  data?: T;
  error?: string;
}

interface SimpleSuccess {
  success: true;
}

// ────────────────────────────────────────────────
// API
// ────────────────────────────────────────────────

const brandApi = createApi({
  reducerPath: 'brandApi',

  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      const token =
        (getState() as any)?.auth?.token ||
        (getState() as any)?.auth?.accessToken ||
        localStorage.getItem('token');

      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),

  tagTypes: [
    'Brand',
    'MyBrands',
    'BrandArtworks',
    'BrandPosts',
    'BrandFollowers',
    'BrandDetail',
    'BrandPostDetail',
    'BrandPostComments',
  ],

  endpoints: (builder) => ({
    // ────────────────────────────────────────────────
    // Brand CRUD & Discovery
    // ────────────────────────────────────────────────

    createBrand: builder.mutation<Brand, Partial<Brand>>({
      query: (body) => ({
        url: '/brands',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'MyBrands', id: 'LIST' }],
    }),

    getMyBrands: builder.query<Brand[], void>({
      query: () => '/brands/my',
      providesTags: (result) =>
        result
          ? [
              ...result.map((b) => ({ type: 'Brand' as const, id: b.id })),
              { type: 'MyBrands', id: 'LIST' },
            ]
          : [{ type: 'MyBrands', id: 'LIST' }],
    }),

    getBrand: builder.query<Brand, string>({
      query: (id) => `/brands/${id}?withArtworks=true&withPosts=true`,
      providesTags: (result, error, id) => [
        { type: 'Brand', id },
        { type: 'BrandDetail', id },
      ],
    }),
    getAllBrands: builder.query<
      {
        brands: Brand[];
        pagination: { total: number; limit: number; offset: number; hasMore: boolean };
      },
      {
        search?: string;
        status?: string;
        sortBy?: 'followers_count' | 'created_at' | 'name';
        sortOrder?: 'asc' | 'desc';
        limit?: number;
        offset?: number;
        minFollowers?: number;
      } | void
    >({
      query: (params) => ({
        url: '/brands',
        params: params ?? {}, // ← safe: undefined → empty object
      }),
      providesTags: ['Brand'],
    }),
    getBrandBySlug: builder.query<Brand, string>({
      query: (slug) => `/brands/slug/${slug}?withArtworks=true&withPosts=true`,
      providesTags: (result): { type: 'Brand'; id: string }[] => {
        if (!result?.id) return [];
        return [{ type: 'Brand', id: result.id }];
      },
    }),

    updateBrand: builder.mutation<Brand, { id: string } & Partial<Brand>>({
      query: ({ id, ...patch }) => ({
        url: `/brands/${id}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Brand', id },
        { type: 'BrandDetail', id },
        { type: 'MyBrands', id: 'LIST' },
      ],
    }),

    deleteBrand: builder.mutation<void, string>({
      query: (id) => ({
        url: `/brands/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Brand', id },
        { type: 'MyBrands', id: 'LIST' },
      ],
    }),

    // ────────────────────────────────────────────────
    // Storefront – Brand Artworks
    // ────────────────────────────────────────────────

    addArtworkToBrand: builder.mutation<
      any,
      { brandId: string; artworkId: string; is_featured?: boolean; sort_order?: number }
    >({
      query: ({ brandId, artworkId, ...rest }) => ({
        url: `/brands/${brandId}/artworks`,
        method: 'POST',
        body: { artworkId, ...rest },
      }),
      invalidatesTags: (result, error, { brandId }) => [
        { type: 'BrandArtworks', id: brandId },
        { type: 'Brand', id: brandId },
        { type: 'BrandDetail', id: brandId },
      ],
    }),

    getBrandArtworks: builder.query<
      BrandArtwork[],
      { brandId: string; featuredOnly?: boolean; limit?: number; offset?: number }
    >({
      query: ({ brandId, featuredOnly = false, limit = 50, offset = 0 }) => ({
        url: `/brands/${brandId}/artworks`,
        params: {
          featuredOnly: featuredOnly ? 'true' : undefined,
          limit,
          offset,
        },
      }),
      providesTags: (result, error, { brandId }) => [
        { type: 'BrandArtworks', id: brandId },
        ...(result?.map(() => ({ type: 'Brand' as const, id: brandId })) ?? []),
      ],
    }),

    removeArtworkFromBrand: builder.mutation<void, { brandId: string; artworkId: string }>({
      query: ({ brandId, artworkId }) => ({
        url: `/brands/${brandId}/artworks/${artworkId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { brandId }) => [
        { type: 'BrandArtworks', id: brandId },
        { type: 'Brand', id: brandId },
        { type: 'BrandDetail', id: brandId },
      ],
    }),

    // ────────────────────────────────────────────────
    // Follow / Social
    // ────────────────────────────────────────────────

    followBrand: builder.mutation<SimpleSuccess & { action: 'followed' }, string>({
      query: (id) => ({
        url: `/brands/${id}/follow`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Brand', id },
        { type: 'BrandFollowers', id },
        { type: 'BrandDetail', id },
      ],
    }),

    unfollowBrand: builder.mutation<SimpleSuccess & { action: 'unfollowed' }, string>({
      query: (id) => ({
        url: `/brands/${id}/follow`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Brand', id },
        { type: 'BrandFollowers', id },
        { type: 'BrandDetail', id },
      ],
    }),

    checkIfFollowing: builder.query<boolean, string>({
      query: (id) => `/brands/${id}/is-following`,
      transformResponse: (res: { isFollowing: boolean }) => !!res.isFollowing,
      providesTags: (result, error, id) => [{ type: 'Brand', id }],
    }),

    getBrandFollowers: builder.query<
      BrandFollower[],
      { brandId: string; limit?: number; offset?: number }
    >({
      query: ({ brandId, limit = 20, offset = 0 }) => ({
        url: `/brands/${brandId}/followers`,
        params: { limit, offset },
      }),
      providesTags: (result, error, { brandId }) => [{ type: 'BrandFollowers', id: brandId }],
    }),

    // ────────────────────────────────────────────────
    // Brand Posts
    // ────────────────────────────────────────────────

    createBrandPost: builder.mutation<
      BrandPost,
      {
        brandId: string;
        title: string;
        content?: string;
        media_urls?: string[];
        status?: 'draft' | 'published';
      }
    >({
      query: ({ brandId, ...body }) => ({
        url: `/brands/${brandId}/posts`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { brandId }) => [
        { type: 'BrandPosts', id: brandId },
        { type: 'Brand', id: brandId },
      ],
    }),

    getBrandPosts: builder.query<
      BrandPost[],
      { brandId: string; limit?: number; offset?: number; drafts?: boolean }
    >({
      query: ({ brandId, limit = 12, offset = 0, drafts = false }) => ({
        url: `/brands/${brandId}/posts`,
        params: { limit, offset, drafts: drafts ? 'true' : undefined },
      }),
      providesTags: (result, error, { brandId }) => [{ type: 'BrandPosts', id: brandId }],
    }),

    getBrandPost: builder.query<BrandPost, { brandId: string; postId: string }>({
      query: ({ brandId, postId }) => `/brands/${brandId}/posts/${postId}`,
      providesTags: (result, error, { postId }) => [{ type: 'BrandPostDetail', id: postId }],
    }),

    updateBrandPost: builder.mutation<
      BrandPost,
      { brandId: string; postId: string } & Partial<BrandPost>
    >({
      query: ({ brandId, postId, ...patch }) => ({
        url: `/brands/${brandId}/posts/${postId}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: 'BrandPostDetail', id: postId },
        { type: 'BrandPosts', id: 'LIST' },
      ],
    }),

    deleteBrandPost: builder.mutation<void, { brandId: string; postId: string }>({
      query: ({ brandId, postId }) => ({
        url: `/brands/${brandId}/posts/${postId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: 'BrandPostDetail', id: postId },
        { type: 'BrandPosts', id: 'LIST' },
      ],
    }),

    togglePinBrandPost: builder.mutation<
      SimpleSuccess,
      { brandId: string; postId: string; pin: boolean }
    >({
      query: ({ brandId, postId, pin }) => ({
        url: `/brands/${brandId}/posts/${postId}/pin`,
        method: 'PATCH',
        body: { pin },
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: 'BrandPostDetail', id: postId },
        { type: 'BrandPosts', id: 'LIST' },
      ],
    }),

    likeBrandPost: builder.mutation<SimpleSuccess, { brandId: string; postId: string }>({
      query: ({ brandId, postId }) => ({
        url: `/brands/${brandId}/posts/${postId}/like`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, { postId }) => [{ type: 'BrandPostDetail', id: postId }],
    }),

    unlikeBrandPost: builder.mutation<SimpleSuccess, { brandId: string; postId: string }>({
      query: ({ brandId, postId }) => ({
        url: `/brands/${brandId}/posts/${postId}/like`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { postId }) => [{ type: 'BrandPostDetail', id: postId }],
    }),

    // ────────────────────────────────────────────────
    // Brand Post Comments
    // ────────────────────────────────────────────────

    createBrandPostComment: builder.mutation<
      any,
      { brandId: string; postId: string; content: string }
    >({
      query: ({ brandId, postId, content }) => ({
        url: `/brands/${brandId}/posts/${postId}/comments`,
        method: 'POST',
        body: { content },
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: 'BrandPostComments', id: postId },
        { type: 'BrandPostDetail', id: postId },
      ],
    }),

    getBrandPostComments: builder.query<
      any[],
      { brandId: string; postId: string; limit?: number; offset?: number }
    >({
      query: ({ brandId, postId, limit = 20, offset = 0 }) => ({
        url: `/brands/${brandId}/posts/${postId}/comments`,
        params: { limit, offset },
      }),
      providesTags: (result, error, { postId }) => [{ type: 'BrandPostComments', id: postId }],
    }),

    deleteBrandPostComment: builder.mutation<
      void,
      { brandId: string; postId: string; commentId: string }
    >({
      query: ({ brandId, postId, commentId }) => ({
        url: `/brands/${brandId}/posts/${postId}/comments/${commentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: 'BrandPostComments', id: postId },
        { type: 'BrandPostDetail', id: postId },
      ],
    }),

    likeBrandPostComment: builder.mutation<
      SimpleSuccess,
      { brandId: string; postId: string; commentId: string }
    >({
      query: ({ brandId, postId, commentId }) => ({
        url: `/brands/${brandId}/posts/${postId}/comments/${commentId}/like`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, { commentId }) => [
        { type: 'BrandPostComments', id: commentId },
      ],
    }),

    // ────────────────────────────────────────────────
    // Views
    // ────────────────────────────────────────────────

    incrementBrandView: builder.mutation<void, string>({
      query: (id) => ({
        url: `/brands/${id}/view`,
        method: 'POST',
      }),
      // No invalidation – view count is usually not critical for cache
    }),
  }),
});

// ────────────────────────────────────────────────
// Hooks
// ────────────────────────────────────────────────

export const {
  useCreateBrandMutation,
  useGetMyBrandsQuery,
  useGetBrandQuery,
  useGetBrandBySlugQuery,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
  useGetAllBrandsQuery,
  useAddArtworkToBrandMutation,
  useGetBrandArtworksQuery,
  useRemoveArtworkFromBrandMutation,

  useFollowBrandMutation,
  useUnfollowBrandMutation,
  useCheckIfFollowingQuery,
  useGetBrandFollowersQuery,

  useCreateBrandPostMutation,
  useGetBrandPostsQuery,
  useGetBrandPostQuery,
  useUpdateBrandPostMutation,
  useDeleteBrandPostMutation,
  useTogglePinBrandPostMutation,
  useLikeBrandPostMutation,
  useUnlikeBrandPostMutation,

  useCreateBrandPostCommentMutation,
  useGetBrandPostCommentsQuery,
  useDeleteBrandPostCommentMutation,
  useLikeBrandPostCommentMutation,

  useIncrementBrandViewMutation,
} = brandApi;

export default brandApi;
