// src/store/features/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
// adjust import
import type { User } from '../authApi'

export interface AuthState {
    accessToken: string | null
    user: User | null
    isAuthenticated: boolean
    lastRefreshedAt?: number
}

const loadPersistedState = (): Partial<AuthState> => {
    try {
        const token = localStorage.getItem('accessToken')
        // const refresh = localStorage.getItem('refreshToken') // if you add later
        if (!token) return {}

        return {
            accessToken: token,
            // refreshToken: refresh,
            isAuthenticated: true, // optimistic — will be verified by API
        }
    } catch {
        return {}
    }
}

const initialState: AuthState = {
    accessToken: null,
    user: null,
    isAuthenticated: false,
    ...loadPersistedState(),
}

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (
            state,
            action: PayloadAction<{
                accessToken: string
                user: User | null
                persist?: boolean
            }>,
        ) => {
            const { accessToken, user, persist = true } = action.payload

            state.accessToken = accessToken
            state.user = user
            state.isAuthenticated = !!accessToken && !!user
            state.lastRefreshedAt = Date.now()

            if (persist) {
                localStorage.setItem('accessToken', accessToken)
                // localStorage.setItem('refreshToken', refreshToken) // if you have it
            }
        },

        logout: (state) => {
            state.accessToken = null
            state.user = null
            state.isAuthenticated = false
            state.lastRefreshedAt = undefined

            localStorage.removeItem('accessToken')
            // localStorage.removeItem('refreshToken')
        },

        updateAccessToken: (state, action: PayloadAction<string>) => {
            state.accessToken = action.payload
            localStorage.setItem('accessToken', action.payload)
            state.lastRefreshedAt = Date.now()
        },
    },
})

export const { setCredentials, logout, updateAccessToken } = authSlice.actions
export default authSlice.reducer
