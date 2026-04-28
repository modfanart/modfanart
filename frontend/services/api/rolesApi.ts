// src/services/api/rolesApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

/**
 * ─────────────────────────────────────────────────────────────
 * Aligned with:
 * - RoleRow
 * - UserRoleRow
 * (src/db/types.js is the authoritative schema)
 * ─────────────────────────────────────────────────────────────
 */

export interface Role {
  id: string;
  name: string;
  hierarchy_level: number;
  is_system: boolean;
  permissions: Record<string, boolean>;
  created_at: string;
}

export interface CreateRoleRequest {
  name: string;
  hierarchy_level: number;
  permissions: Record<string, boolean>;
}

export interface UpdateRoleRequest {
  id: string;
  name?: string;
  hierarchy_level?: number;
  permissions?: Record<string, boolean>;
}

export interface AssignRoleRequest {
  user_id: string;
  role_id: string;
}

export interface UserRole {
  user_id: string;
  role_id: string;
  assigned_by?: string | null;
  assigned_at: string;
}

// ─────────────────────────────────────────────────────────────

export const rolesApi = createApi({
  reducerPath: 'rolesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/roles',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any)?.auth?.accessToken;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),

  tagTypes: ['Roles', 'Role', 'UserRoles'],

  endpoints: (builder) => ({
    // GET /roles
    getAllRoles: builder.query<Role[], void>({
      query: () => '/',
      providesTags: ['Roles'],
    }),

    // POST /roles
    createRole: builder.mutation<Role, CreateRoleRequest>({
      query: (body) => ({
        url: '/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Roles'],
    }),

    // PATCH /roles/:id
    updateRole: builder.mutation<Role, UpdateRoleRequest>({
      query: ({ id, ...patch }) => ({
        url: `/${id}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => ['Roles', { type: 'Role', id }],
    }),

    // DELETE /roles/:id
    deleteRole: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => ['Roles', { type: 'Role', id }],
    }),

    // POST /roles/users/:userId/roles
    assignRoleToUser: builder.mutation<UserRole, { userId: string; roleId: string }>({
      query: ({ userId, roleId }) => ({
        url: `/users/${userId}/roles`,
        method: 'POST',
        body: { roleId },
      }),
    }),

    // Optional future endpoint:
    // GET /roles/users/:userId
    // getUserRoles: builder.query<UserRole[], string>({
    //   query: (userId) => `/users/${userId}/roles`,
    //   providesTags: (result, error, userId) => [{ type: 'UserRoles', id: userId }],
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
