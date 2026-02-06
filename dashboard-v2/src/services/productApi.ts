// src/services/api/productsApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  currency?: string;
  images: string[]; // array of URLs
  category?: string;
  artistId?: string;
  artist?: {
    id: string;
    username: string;
    name?: string;
  };
  brandId?: string;
  brand?: {
    id: string;
    name: string;
    slug?: string;
  };
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'archived';
  isFeatured?: boolean;
  isNew?: boolean;
  stock?: number;
  createdAt: string;
  updatedAt?: string;
  // add tags, variants, dimensions, etc. if needed
}

export interface ProductFilters {
  category?: string;
  artistId?: string;
  brandId?: string;
  status?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  isNew?: boolean;
  isFeatured?: boolean;
  sortBy?: 'price' | 'createdAt' | 'title' | 'popularity';
  sortDir?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  // add more filters as your backend supports
}

export interface PaginatedProducts {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateProductRequest {
  title: string;
  description?: string;
  price: number;
  currency?: string;
  images: string[];
  category?: string;
  artistId?: string;
  brandId?: string;
  status?: 'draft' | 'pending';
  // ... other creation fields
}

export interface UpdateProductRequest {
  id: string;
  title?: string;
  description?: string;
  price?: number;
  images?: string[];
  category?: string;
  status?: string;
  // ... partial updates
}

// ─────────────────────────────────────────────────────────────

export const productsApi = createApi({
  reducerPath: 'productsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/products',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any)?.auth?.accessToken;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),

  tagTypes: ['Products', 'Product', 'GalleryProducts', 'MarketplaceProducts', 'Storefronts'],

  endpoints: (builder) => ({
    // ── Core CRUD ───────────────────────────────────────────

    createProduct: builder.mutation<Product, CreateProductRequest>({
      query: (product) => ({
        url: '/',
        method: 'POST',
        body: product,
      }),
      invalidatesTags: ['Products', 'MarketplaceProducts'],
    }),

    getProducts: builder.query<PaginatedProducts, ProductFilters | void>({
      query: (filters = {}) => ({
        url: '/',
        params: filters as Record<string, any>,
      }),
      providesTags: ['Products'],
    }),

    getProductById: builder.query<Product, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),

    updateProduct: builder.mutation<Product, UpdateProductRequest>({
      query: ({ id, ...patch }) => ({
        url: `/${id}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        'Products',
        { type: 'Product', id },
        'MarketplaceProducts',
        'GalleryProducts',
      ],
    }),

    deleteProduct: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        'Products',
        { type: 'Product', id },
        'MarketplaceProducts',
        'GalleryProducts',
      ],
    }),

    // ── Legacy / Convenience Routes ─────────────────────────

    getProductsByCategory: builder.query<Product[], string>({
      query: (category) => `/category/${category}`,
      providesTags: ['Products'],
    }),

    getProductsByArtist: builder.query<Product[], string>({
      query: (artistId) => `/artist/${artistId}`,
      providesTags: ['Products'],
    }),

    getProductsByBrand: builder.query<Product[], string>({
      query: (brandId) => `/brand/${brandId}`,
      providesTags: ['Products'],
    }),

    // ── Marketplace & Discovery ─────────────────────────────

    getApprovedGalleryItems: builder.query<Product[], void>({
      query: () => '/gallery',
      providesTags: ['GalleryProducts'],
    }),

    getMarketplaceProducts: builder.query<PaginatedProducts, ProductFilters | void>({
      query: (filters = {}) => ({
        url: '/marketplace',
        params: filters as Record<string, any>,
      }),
      providesTags: ['MarketplaceProducts'],
    }),

    getStorefronts: builder.query<any[], { featured?: boolean } | void>({
      query: () => ({
        url: '/storefronts',
      }),
      providesTags: ['Storefronts'],
    }),
  }),
});

export const {
  useCreateProductMutation,
  useGetProductsQuery,
  useGetProductByIdQuery,
  useUpdateProductMutation,
  useDeleteProductMutation,

  // Legacy
  useGetProductsByCategoryQuery,
  useGetProductsByArtistQuery,
  useGetProductsByBrandQuery,

  // Discovery
  useGetApprovedGalleryItemsQuery,
  useGetMarketplaceProductsQuery,
  useGetStorefrontsQuery,

  // Lazy versions if needed
  useLazyGetProductsQuery,
  useLazyGetMarketplaceProductsQuery,
  useLazyGetProductByIdQuery,
} = productsApi;

export default productsApi;
