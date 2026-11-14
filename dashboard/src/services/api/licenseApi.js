// src/services/api/licensesApi.js

import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '../baseQuery';
import { API_BASE_URL } from "..";

export const licensesApi = createApi({
  reducerPath: "licensesApi",

  baseQuery: createBaseQuery('/licenses'),

  tagTypes: ["MyLicenses", "License", "IssuedLicenses", "AllLicenses"],

  endpoints: (builder) => ({
    // Buyer: My Licenses
    getMyLicenses: builder.query({
      query: () => "/me",

      providesTags: ["MyLicenses"],
    }),

    // Get Single License
    getLicense: builder.query({
      query: (id) => `/${id}`,

      providesTags: (result, error, id) => [
        {
          type: "License",
          id,
        },
      ],
    }),

    // Seller: Issued Licenses
    getIssuedLicenses: builder.query({
      query: () => "/issued",

      providesTags: ["IssuedLicenses"],
    }),

    // Revoke License
    revokeLicense: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/${id}/revoke`,
        method: "PATCH",
        body: { reason },
      }),

      invalidatesTags: (result, error, { id }) => [
        "MyLicenses",
        "IssuedLicenses",
        "AllLicenses",
        {
          type: "License",
          id,
        },
      ],
    }),

    // Admin: All Licenses
    getAllLicenses: builder.query({
      query: () => "/",

      providesTags: ["AllLicenses"],
    }),

    // Create Checkout Session
    createLicenseCheckoutSession: builder.mutation({
      query: (body) => ({
        url: "/checkout-session",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useGetMyLicensesQuery,
  useGetLicenseQuery,
  useGetIssuedLicensesQuery,
  useRevokeLicenseMutation,
  useGetAllLicensesQuery,
  useCreateLicenseCheckoutSessionMutation,
  useLazyGetMyLicensesQuery,
  useLazyGetLicenseQuery,
} = licensesApi;

export default licensesApi;
