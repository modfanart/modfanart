import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// ────────────────────────────────────────────────
// Matches CategoryRow exactly from src/db/types.js
// ────────────────────────────────────────────────
export interface Category {
  id: string; // UUID
  name: string;
  slug: string; // unique, URL-friendly
  parent_id: string | null; // self-referential for hierarchy
  description: string | null;
  icon_url: string | null; // e.g. URL to icon or emoji reference
  sort_order: number; // for custom ordering in UI
  is_active: boolean;
  created_at: string; // ISO timestamptz
  updated_at: string; // ISO timestamptz
}

// ────────────────────────────────────────────────
// Request shapes (most common patterns)
// ────────────────────────────────────────────────
export interface CreateCategoryRequest {
  name: string;
  slug?: string; // optional — backend can auto-generate
  description?: string | null;
  parent_id?: string | null;
  icon_url?: string | null;
  sort_order?: number;
  is_active?: boolean; // default usually true
}

export interface UpdateCategoryRequest {
  id: string;
  name?: string;
  slug?: string;
  description?: string | null;
  parent_id?: string | null;
  icon_url?: string | null;
  sort_order?: number;
  is_active?: boolean;
}

// Common success shape for mutations (adjust if your backend returns full entity)
interface ApiSuccessResponse {
  success: boolean;
  message?: string;
  data?: Category | any;
}

const categoriesApi = createApi({
  reducerPath: 'categoriesApi',

  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers, { getState }) => {
      const token =
        (getState() as any)?.auth?.accessToken ?? (getState() as any)?.auth?.token ?? null;

      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
    credentials: 'include', // useful if using session/cookie auth for admin
  }),

  tagTypes: ['Categories', 'Category'],

  endpoints: (builder) => ({
    // GET /category
    // → usually returns flat list or optionally tree-structured
    getAllCategories: builder.query<{ categories: Category[] }, void>({
      query: () => ({
        url: '/category',
      }),
      providesTags: ['Categories'],
    }),

    // GET /category/:id   (or /category/slug:xxx if slug-based routing)
    getCategory: builder.query<Category, string>({
      query: (id) => `/category/${id}`,
      providesTags: (result, error, id) => [{ type: 'Category', id }],
    }),

    // POST /category          → admin / moderator only
    createCategory: builder.mutation<Category, CreateCategoryRequest>({
      query: (body) => ({
        url: '/category',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Categories'],
    }),

    // PATCH /category/:id     → admin only
    updateCategory: builder.mutation<Category, UpdateCategoryRequest>({
      query: ({ id, ...patch }) => ({
        url: `/category/${id}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => ['Categories', { type: 'Category', id }],
    }),

    // DELETE /category/:id    → admin only (soft or hard delete depending on backend)
    deleteCategory: builder.mutation<ApiSuccessResponse, string>({
      query: (id) => ({
        url: `/category/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => ['Categories', { type: 'Category', id }],
    }),
    // ─── GET /categories/slug/:slug ──────────────────────────────
    // Dedicated slug-based lookup (cleaner for frontend in many cases)
    getCategoryBySlug: builder.query<Category, string>({
      query: (slug) => `/category/slug/${encodeURIComponent(slug)}`,
      providesTags: (result, error, slug) => [
        { type: 'Category', id: `SLUG-${slug}` },
        'Categories',
      ],
    }),
    // ───────────────────────────────────────────────────────────────
    // Bonus: Get category tree (if your backend supports hierarchical response)
    // GET /category/tree?root_id=xxx&depth=3
    // ───────────────────────────────────────────────────────────────
    getCategoryTree: builder.query<Category[], { root_id?: string; depth?: number }>({
      query: (params) => ({
        url: '/category/tree',
        params,
      }),
      providesTags: ['Categories'],
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
  useGetCategoryBySlugQuery,
  useDeleteCategoryMutation,
  useGetCategoryTreeQuery,
  useLazyGetCategoryTreeQuery,
} = categoriesApi;

export default categoriesApi;
