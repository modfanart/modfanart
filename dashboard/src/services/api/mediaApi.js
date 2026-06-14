import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '..';

export const mediaApi = createApi({
  reducerPath: 'mediaApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/media`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),

  tagTypes: ['Media', 'MediaList'],

  endpoints: (builder) => ({
    // GET /media - Get all media files
    getAllMedia: builder.query({
      query: (params = {}) => ({
        url: '/',
        params,
      }),
      providesTags: ['MediaList'],
    }),

    // GET /media/:id - Get single media
    getMediaById: builder.query({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Media', id }],
    }),

    // POST /media - Upload media file(s)
    uploadMedia: builder.mutation({
      query: (formData) => ({
        url: '/',
        method: 'POST',
        body: formData,
        // Important: Do NOT set Content-Type header for multipart/form-data
        // Let the browser set it automatically with boundary
      }),
      invalidatesTags: ['MediaList'],
    }),

    // PATCH /media/:id - Update media info (title, alt_text, description, etc.)
    updateMedia: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        'MediaList',
        { type: 'Media', id },
      ],
    }),

    // DELETE /media/:id - Delete media
    deleteMedia: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['MediaList'],
    }),

    // Optional: Bulk delete
    bulkDeleteMedia: builder.mutation({
      query: (ids) => ({
        url: '/bulk-delete',
        method: 'POST',
        body: { ids },
      }),
      invalidatesTags: ['MediaList'],
    }),

    // Optional: Get media stats
    getMediaStats: builder.query({
      query: () => '/stats',
      providesTags: ['MediaList'],
    }),
  }),
});

export const {
  useGetAllMediaQuery,
  useGetMediaByIdQuery,
  useUploadMediaMutation,
  useUpdateMediaMutation,
  useDeleteMediaMutation,
  useBulkDeleteMediaMutation,
  useGetMediaStatsQuery,
  // Lazy versions
  useLazyGetAllMediaQuery,
  useLazyGetMediaByIdQuery,
} = mediaApi;

export default mediaApi;