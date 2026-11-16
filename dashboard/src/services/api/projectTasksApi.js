import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '../baseQuery';
import { API_BASE_URL } from '..';

export const projectTaskApi = createApi({
  reducerPath: 'projectTaskApi',
  baseQuery: createBaseQuery(''),
  tagTypes: ['Project', 'Task', 'ProjectMembers'],
  endpoints: builder => ({
    // ==================== PROJECTS ====================
    getMyProjects: builder.query({
      query: () => '/projects/my-projects',
      providesTags: ['Project'],
    }),

    getProjectById: builder.query({
      query: id => `/projects/${id}`,
      providesTags: (result, error, id) => [{ type: 'Project', id }],
    }),

    createProject: builder.mutation({
      query: body => ({
        url: '/projects',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Project'],
    }),

    updateProject: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/projects/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Project'],
    }),
    getProjectTasks: builder.query({
      query: projectId => `/tasks/project/${projectId}`,
      providesTags: (result, error, projectId) => [
        { type: 'Task', id: projectId },
      ],
    }),
    deleteProject: builder.mutation({
      query: id => ({
        url: `/projects/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Project'],
    }),
    // Members
    getProjectMembers: builder.query({
      query: projectId => `/projects/${projectId}/members`,
      providesTags: ['ProjectMembers'],
    }),

    addProjectMember: builder.mutation({
      query: ({ projectId, ...body }) => ({
        url: `/projects/${projectId}/members`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ProjectMembers'],
    }),

    // ==================== TASKS ====================
    getMyTasks: builder.query({
      query: () => '/tasks/my-tasks',
      providesTags: ['Task'],
    }),

    getTasksByProject: builder.query({
      query: projectId => `/tasks/project/${projectId}`,
      providesTags: (result, error, projectId) => [
        { type: 'Task', id: projectId },
      ],
    }),

    getTaskById: builder.query({
      query: id => `/tasks/${id}`,
      providesTags: (result, error, id) => [{ type: 'Task', id }],
    }),

    createTask: builder.mutation({
      query: body => ({
        url: '/tasks',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Task'],
    }),

    updateTask: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/tasks/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Task'],
    }),

    updateTaskStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/tasks/${id}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['Task'],
    }),

    assignTask: builder.mutation({
      query: ({ id, user_id }) => ({
        url: `/tasks/${id}/assign`,
        method: 'PUT',
        body: { user_id },
      }),
      invalidatesTags: ['Task'],
    }),
  }),
});

export const {
  useGetMyProjectsQuery,
  useGetProjectByIdQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useGetProjectMembersQuery,
  useAddProjectMemberMutation,
  useGetProjectTasksQuery,
  useLazyGetProjectTasksQuery,
  useGetMyTasksQuery,
  useDeleteProjectMutation,
  useGetTasksByProjectQuery,
  useLazyGetTasksByProjectQuery,
  useGetTaskByIdQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useUpdateTaskStatusMutation,
  useAssignTaskMutation,
} = projectTaskApi;
