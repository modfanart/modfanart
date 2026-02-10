// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'

// RTK Query APIs
import authApi from '../services/authApi'
import userApi from '../services/userApi'
import rolesApi from '../services/rolesApi'
import productsApi from '../services/productApi'
import ordersApi from '../services/orderApi'
import moderationApi from '../services/moderationApi'
import licensesApi from '../services/licenseApi'
import favoritesApi from '../services/favoriteApi'
import contestsApi from '../services/contestsApi'
import categoriesApi from '../services/categoriesApi'
import auditApi from '../services/auditApi'
import artworkApi from '../services/artworkApi'
import artworkTagsApi from '../services/artworkTagsApi'
import brandApi from '../services/brands'
// Reducers
import authReducer from '../services/features/authSlice'
// ... other reducers if any ...

// ────────────────────────────────────────────────
// No need for manual preloadedState anymore!
// The authSlice already loads accessToken from localStorage in initialState
// ────────────────────────────────────────────────

export const store = configureStore({
    reducer: {
        auth: authReducer,
        [authApi.reducerPath]: authApi.reducer,
        [userApi.reducerPath]: userApi.reducer,
        [rolesApi.reducerPath]: rolesApi.reducer,
        [productsApi.reducerPath]: productsApi.reducer,
        [ordersApi.reducerPath]: ordersApi.reducer,
        [moderationApi.reducerPath]: moderationApi.reducer,
        [licensesApi.reducerPath]: licensesApi.reducer,
        [favoritesApi.reducerPath]: favoritesApi.reducer,
        [contestsApi.reducerPath]: contestsApi.reducer,
        [categoriesApi.reducerPath]: categoriesApi.reducer,
        [auditApi.reducerPath]: auditApi.reducer,
        [artworkApi.reducerPath]: artworkApi.reducer,
        [artworkTagsApi.reducerPath]: artworkTagsApi.reducer,
        [brandApi.reducerPath]: brandApi.reducer,
    },

    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }).concat(
            authApi.middleware,
            userApi.middleware,
            rolesApi.middleware,
            productsApi.middleware,
            ordersApi.middleware,
            moderationApi.middleware,
            licensesApi.middleware,
            favoritesApi.middleware,
            contestsApi.middleware,
            categoriesApi.middleware,
            auditApi.middleware,
            artworkApi.middleware,
            artworkTagsApi.middleware,
            brandApi.middleware,
        ),

    // No preloadedState needed anymore
    devTools: process.env.NODE_ENV !== 'production',
})

setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export type AppThunk<ReturnType = void> =
    import('@reduxjs/toolkit').ThunkAction<
        ReturnType,
        RootState,
        unknown,
        import('@reduxjs/toolkit').Action
    >
