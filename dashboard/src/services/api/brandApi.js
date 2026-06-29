import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "..";

/* =========================================================
   API
========================================================= */

export const brandApi = createApi({
  reducerPath: "brandApi",

  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/brands`,
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("accessToken");

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),

  tagTypes: [
    "Brand",
    "BrandDetail",
    "MyBrands",
    "BrandArtworks",
    "BrandPosts",
    "BrandPostDetail",
    "BrandPostComments",
    "VerificationRequestList",
    "BrandManagers",
  ],

  endpoints: (builder) => ({
    /* =========================
       PUBLIC
    ========================= */

    getAllBrands: builder.query({
      query: (params) => ({ url: "/", params }),
      providesTags: (result) =>
        result
          ? [
              ...result.brands.map((b) => ({ type: "Brand", id: b.id })),
              { type: "Brand", id: "LIST" },
            ]
          : [{ type: "Brand", id: "LIST" }],
    }),

    getBrand: builder.query({
      query: (id) => `/${id}`,
      providesTags: (result, _, id) => [
        { type: "Brand", id },
        { type: "BrandDetail", id },
      ],
    }),

    getBrandBySlug: builder.query({
      query: (slug) => `/slug/${slug}`,
      providesTags: (result) =>
        result ? [{ type: "Brand", id: result.id }] : [],
    }),

    incrementBrandView: builder.mutation({
      query: (id) => ({
        url: `/${id}/view`,
        method: "POST",
      }),
    }),

    getBrandManagers: builder.query({
      query: (brandId) => `/${brandId}/managers`,
      providesTags: (_, __, brandId) => [
        { type: "BrandManagers", id: brandId },
      ],
    }),

    assignBrandManager: builder.mutation({
      query: ({ brandId, ...body }) => ({
        url: `/${brandId}/managers`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_, __, { brandId }) => [
        { type: "BrandManagers", id: brandId },
        { type: "Brand", id: brandId },
        { type: "BrandDetail", id: brandId },
        { type: "MyBrands", id: "LIST" },
      ],
    }),

    /* =========================
       FOLLOW
    ========================= */

    followBrand: builder.mutation({
      query: (id) => ({ url: `/${id}/follow`, method: "POST" }),
      invalidatesTags: (_, __, id) => [{ type: "Brand", id }],
    }),

    unfollowBrand: builder.mutation({
      query: (id) => ({ url: `/${id}/follow`, method: "DELETE" }),
      invalidatesTags: (_, __, id) => [{ type: "Brand", id }],
    }),

    checkIfFollowing: builder.query({
      query: (id) => `/${id}/is-following`,
      transformResponse: (r) => r.isFollowing,
    }),

    /* =========================
       MY BRANDS
    ========================= */

    getMyBrands: builder.query({
      query: () => "/my",
      providesTags: (result) =>
        result
          ? [
              ...result.map((b) => ({ type: "Brand", id: b.id })),
              { type: "MyBrands", id: "LIST" },
            ]
          : [{ type: "MyBrands", id: "LIST" }],
    }),

    updateBrand: builder.mutation({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: "Brand", id },
        { type: "BrandDetail", id },
        { type: "MyBrands", id: "LIST" },
      ],
    }),

    deleteBrand: builder.mutation({
      query: (id) => ({ url: `/${id}`, method: "DELETE" }),
      invalidatesTags: (_, __, id) => [
        { type: "Brand", id },
        { type: "MyBrands", id: "LIST" },
      ],
    }),

    /* =========================
       ARTWORKS
    ========================= */

    getBrandArtworks: builder.query({
      query: (brandId) => `/${brandId}/artworks`,
      providesTags: (_, __, id) => [{ type: "BrandArtworks", id }],
    }),

    addArtworkToBrand: builder.mutation({
      query: ({ brandId, ...body }) => ({
        url: `/${brandId}/artworks`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_, __, { brandId }) => [
        { type: "BrandArtworks", id: brandId },
      ],
    }),

    removeArtworkFromBrand: builder.mutation({
      query: ({ brandId, artworkId }) => ({
        url: `/${brandId}/artworks/${artworkId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_, __, { brandId }) => [
        { type: "BrandArtworks", id: brandId },
      ],
    }),

    /* =========================
       POSTS
    ========================= */

    getBrandPosts: builder.query({
      query: (brandId) => `/${brandId}/posts`,
      providesTags: (_, __, id) => [{ type: "BrandPosts", id }],
    }),

    getBrandPost: builder.query({
      query: ({ brandId, postId }) => `/${brandId}/posts/${postId}`,
      providesTags: (_, __, { postId }) => [
        { type: "BrandPostDetail", id: postId },
      ],
    }),

    createBrandPost: builder.mutation({
      query: ({ brandId, data }) => ({
        url: `/${brandId}/posts`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_, __, { brandId }) => [
        { type: "BrandPosts", id: brandId },
      ],
    }),

    updateBrandPost: builder.mutation({
      query: ({ brandId, postId, data }) => ({
        url: `/${brandId}/posts/${postId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_, __, { brandId, postId }) => [
        { type: "BrandPostDetail", id: postId },
        { type: "BrandPosts", id: brandId },
      ],
    }),

    deleteBrandPost: builder.mutation({
      query: ({ brandId, postId }) => ({
        url: `/${brandId}/posts/${postId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_, __, { brandId, postId }) => [
        { type: "BrandPostDetail", id: postId },
        { type: "BrandPosts", id: brandId },
      ],
    }),

    togglePinBrandPost: builder.mutation({
      query: ({ brandId, postId, pin }) => ({
        url: `/${brandId}/posts/${postId}/pin`,
        method: "PATCH",
        body: { pin },
      }),
      invalidatesTags: (_, __, { brandId, postId }) => [
        { type: "BrandPostDetail", id: postId },
        { type: "BrandPosts", id: brandId },
      ],
    }),

    /* =========================
       LIKES
    ========================= */

    likeBrandPost: builder.mutation({
      query: ({ brandId, postId }) => ({
        url: `/${brandId}/posts/${postId}/like`,
        method: "POST",
      }),
      invalidatesTags: (_, __, { postId }) => [
        { type: "BrandPostDetail", id: postId },
      ],
    }),

    unlikeBrandPost: builder.mutation({
      query: ({ brandId, postId }) => ({
        url: `/${brandId}/posts/${postId}/like`,
        method: "DELETE",
      }),
      invalidatesTags: (_, __, { postId }) => [
        { type: "BrandPostDetail", id: postId },
      ],
    }),

    /* =========================
       COMMENTS
    ========================= */

    getBrandPostComments: builder.query({
      query: ({ brandId, postId }) => `/${brandId}/posts/${postId}/comments`,
      providesTags: (_, __, { postId }) => [
        { type: "BrandPostComments", id: postId },
      ],
    }),

    createBrandPostComment: builder.mutation({
      query: ({ brandId, postId, ...body }) => ({
        url: `/${brandId}/posts/${postId}/comments`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_, __, { postId }) => [
        { type: "BrandPostComments", id: postId },
        { type: "BrandPostDetail", id: postId },
      ],
    }),

    deleteBrandPostComment: builder.mutation({
      query: ({ brandId, postId, commentId }) => ({
        url: `/${brandId}/posts/${postId}/comments/${commentId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_, __, { postId }) => [
        { type: "BrandPostComments", id: postId },
      ],
    }),

    likeBrandPostComment: builder.mutation({
      query: ({ brandId, postId, commentId }) => ({
        url: `/${brandId}/posts/${postId}/comments/${commentId}/like`,
        method: "POST",
      }),
      invalidatesTags: (_, __, { postId }) => [
        { type: "BrandPostComments", id: postId },
      ],
    }),

    /* =========================
       VERIFICATION
    ========================= */

    submitBrandVerificationRequest: builder.mutation({
      query: (body) => ({
        url: "/verification-requests",
        method: "POST",
        body,
      }),
      invalidatesTags: ["VerificationRequestList"],
    }),

    getVerificationRequests: builder.query({
      query: () => "/verification-requests",
      providesTags: ["VerificationRequestList"],
    }),

    approveVerificationRequest: builder.mutation({
      query: ({ requestId, ...body }) => ({
        url: `/verification-requests/${requestId}/approve`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["VerificationRequestList", "MyBrands"],
    }),

    /* =========================
       ADMIN
    ========================= */

    adminCreateBrand: builder.mutation({
      query: (body) => ({
        url: "/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Brand", "MyBrands"],
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
  useGetBrandManagersQuery,
  useAssignBrandManagerMutation,
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
