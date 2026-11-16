// src/services/api/rolesApi.js

import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '../baseQuery';
import { API_BASE_URL } from '..';

export const rolesApi = createApi({
  reducerPath: 'rolesApi',

  baseQuery: createBaseQuery('/roles'),

  tagTypes: ['Roles', 'Role', 'UserRoles'],

  endpoints: builder => ({
    // GET /roles
    getAllRoles: builder.query({
      query: () => '/',

      providesTags: ['Roles'],
    }),

    // POST /roles
    createRole: builder.mutation({
      query: body => ({
        url: '/',
        method: 'POST',
        body,
      }),

      invalidatesTags: ['Roles'],
    }),

    // PATCH /roles/:id
    updateRole: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/${id}`,
        method: 'PATCH',
        body: patch,
      }),

      invalidatesTags: (result, error, { id }) => [
        'Roles',
        { type: 'Role', id },
      ],
    }),

    // DELETE /roles/:id
    deleteRole: builder.mutation({
      query: id => ({
        url: `/${id}`,
        method: 'DELETE',
      }),

      invalidatesTags: (result, error, id) => ['Roles', { type: 'Role', id }],
    }),

    // POST /roles/users/:userId/roles
    assignRoleToUser: builder.mutation({
      query: ({ userId, roleId }) => ({
        url: `/users/${userId}/roles`,
        method: 'POST',
        body: { roleId },
      }),

      invalidatesTags: ['UserRoles'],
    }),

    // Future endpoint example:
    // getUserRoles: builder.query({
    //   query: (userId) => `/users/${userId}/roles`,
    //   providesTags: (result, error, userId) => [
    //     { type: 'UserRoles', id: userId },
    //   ],
    // }),
  }),
});

export const {
  useGetAllRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useAssignRoleToUserMutation,

  useLazyGetAllRolesQuery,
} = rolesApi;

export default rolesApi;
