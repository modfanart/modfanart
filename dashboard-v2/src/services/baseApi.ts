// src/api/baseApi.ts
import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithAuth } from './baseQuery'

export const baseApi = createApi({
    reducerPath: 'baseApi',
    baseQuery: baseQueryWithAuth,
    tagTypes: ['User', 'Posts' /* ... your tags */],
    endpoints: () => ({}), // <-- empty → you extend it in feature APIs
})
