// src/services/api/categoryApi.js

import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '../baseQuery';
import { API_BASE_URL } from "..";

const categoriesApi = createApi({
  reducerPath: "categoriesApi",

  baseQuery: createBaseQuery('', { credentials: 'include' }),

  tagTypes: ["Categories", "Category"],

  endpoints: (builder) => ({
    // GET /category
    getAllCategories: builder.query({
      query: () => ({
        url: "/category",
      }),

      providesTags: ["Categories"],
    }),

    // GET /category/:id
    getCategory: builder.query({
      query: (id) => `/category/${id}`,

      providesTags: (result, error, id) => [
        {
          type: "Category",
          id,
        },
      ],
    }),

    // POST /category
    createCategory: builder.mutation({
      query: (body) => ({
        url: "/category",
        method: "POST",
        body,
      }),

      invalidatesTags: ["Categories"],
    }),

    // PATCH /category/:id
    updateCategory: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/category/${id}`,
        method: "PATCH",
        body: patch,
      }),

      invalidatesTags: (result, error, { id }) => [
        "Categories",
        {
          type: "Category",
          id,
        },
      ],
    }),

    // DELETE /category/:id
    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/category/${id}`,
        method: "DELETE",
      }),

      invalidatesTags: (result, error, id) => [
        "Categories",
        {
          type: "Category",
          id,
        },
      ],
    }),

    // GET /category/slug/:slug
    getCategoryBySlug: builder.query({
      query: (slug) => `/category/slug/${encodeURIComponent(slug)}`,

      providesTags: (result, error, slug) => [
        {
          type: "Category",
          id: `SLUG-${slug}`,
        },
        "Categories",
      ],
    }),

    // GET /category/tree
    getCategoryTree: builder.query({
      query: (params = {}) => ({
        url: "/category/tree",
        params,
      }),

      providesTags: ["Categories"],
    }),
  }),
});

export const {
  useGetAllCategoriesQuery,
  useLazyGetAllCategoriesQuery,
  useGetCategoryQuery,
  useLazyGetCategoryQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetCategoryBySlugQuery,
  useGetCategoryTreeQuery,
  useLazyGetCategoryTreeQuery,
} = categoriesApi;

export default categoriesApi;
