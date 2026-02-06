// src/api/customBaseQuery.ts
import {
    fetchBaseQuery,
    FetchArgs,
    BaseQueryFn,
    FetchBaseQueryError,
} from '@reduxjs/toolkit/query'
import appConfig from '@/configs/app.config'
import {
    TOKEN_TYPE,
    REQUEST_HEADER_AUTH_KEY,
    TOKEN_NAME_IN_STORAGE,
} from '@/constants/api.constant'
import { useToken, useSessionUser } from '@/store/authStore'

const unauthorizedCodes = [401, 419, 440]

const rawBaseQuery = fetchBaseQuery({
    baseUrl: appConfig.apiPrefix,
    timeout: 60000,
    prepareHeaders: (headers) => {
        // Read token directly from zustand (sync!)
        const token = useToken.getState().token // adjust depending on your store shape

        if (token) {
            headers.set(REQUEST_HEADER_AUTH_KEY, `${TOKEN_TYPE}${token}`)
        }

        return headers
    },
})

export const baseQueryWithAuth: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
> = async (args, api, extraOptions) => {
    const result = await rawBaseQuery(args, api, extraOptions)

    const { response } = result.error || {}

    if (response && unauthorizedCodes.includes(response.status)) {
        // Same logic as your Axios interceptor
        useToken.getState().setToken('')
        useSessionUser.getState().setUser({})
        useSessionUser.getState().setSessionSignedIn(false)

        // Optional: you can also throw or return custom error shape
        // result.error = { status: 'CUSTOM_UNAUTHORIZED', data: response.data }
    }

    return result
}
