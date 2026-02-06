// src/store/features/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { UserProfile as User } from '../userApi' // or wherever your User type lives

interface AuthState {
    accessToken: string | null
    user: User | null
    // Optional but very useful in real apps:
    isAuthenticated: boolean // derived, but convenient for quick checks
    lastRefreshedAt?: number // timestamp — helps debug stale sessions
}

const initialState: AuthState = {
    accessToken: localStorage.getItem('accessToken') || null,
    user: null,
    isAuthenticated: false,
    // lastRefreshedAt: undefined,
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
                persist?: boolean // optional — some flows don't want to save to storage
            }>,
        ) => {
            state.accessToken = action.payload.accessToken
            state.user = action.payload.user
            state.isAuthenticated =
                !!action.payload.accessToken && !!action.payload.user

            if (action.payload.persist !== false) {
                localStorage.setItem('accessToken', action.payload.accessToken)
                // If you store refreshToken separately:
                // localStorage.setItem('refreshToken', action.payload.refreshToken);
            }

            state.lastRefreshedAt = Date.now()
        },

        logout: (state) => {
            state.accessToken = null
            state.user = null
            state.isAuthenticated = false
            state.lastRefreshedAt = undefined

            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken') // good — you already have this
            // Optional: clear other auth-related storage if you have any
            // sessionStorage.clear(); // only if you use sessionStorage too
        },

        // Optional: lightweight action for token refresh without full user reload
        updateAccessToken: (state, action: PayloadAction<string>) => {
            if (state.accessToken) {
                state.accessToken = action.payload
                localStorage.setItem('accessToken', action.payload)
                state.lastRefreshedAt = Date.now()
            }
        },

        // Optional: clear user data but keep token (rare, but useful during profile update flows)
        clearUser: (state) => {
            state.user = null
        },
    },
})

export const { setCredentials, logout, updateAccessToken, clearUser } =
    authSlice.actions

export default authSlice.reducer
