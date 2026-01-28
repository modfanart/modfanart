// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

// ────────────────────────────────────────────────
// RTK Query API slices
// ────────────────────────────────────────────────
import authApi from '@/app/api/authApi';
import userApi from '@/app/api/userApi';
import rolesApi from '@/app/api/rolesApi';
import productsApi from '@/app/api/productApi';
import ordersApi from '@/app/api/orderApi';
import moderationApi from '@/app/api/moderationApi';
import licensesApi from '@/app/api/licenseApi';
import favoritesApi from '@/app/api/favoriteApi';
import contestsApi from '@/app/api/contestsApi';
import categoriesApi from '@/app/api/categoriesApi';
import auditApi from '@/app/api/auditApi';
import artworkApi from '@/app/api/artworkApi';
import artworkTagsApi from '@/app/api/artworkTagsApi';
import brandApi from '@/app/api/brands';

// ────────────────────────────────────────────────
// Reducers (slices)
// ────────────────────────────────────────────────
import authReducer from '@/app/api/features/authSlice';
// import otherSliceReducer from '@/features/other/otherSlice';  // add more as needed

// ────────────────────────────────────────────────
// Persist access token from localStorage (critical for auth surviving reload)
// ────────────────────────────────────────────────
const persistedAccessToken =
  typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

const preloadedState = persistedAccessToken
  ? {
      auth: {
        accessToken: persistedAccessToken,
        user: null, // user will be populated via getCurrentUser query after reload
      },
    }
  : undefined;

// ────────────────────────────────────────────────
// Create the store
// ────────────────────────────────────────────────
export const store = configureStore({
  reducer: {
    // Regular slices
    auth: authReducer,
    // Add other non-RTK reducers here when you create them
    // example: theme: themeReducer,

    // RTK Query auto-generated reducers
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
      // Disable serializable check → allows non-serializable values (File, functions, etc.)
      serializableCheck: false,
    }).concat(
      // All RTK Query middlewares
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
      brandApi.middleware
      // add more .middleware when you create new api slices
    ),

  // Restore persisted auth state on app start
  preloadedState,

  // Enable Redux DevTools in development only
  devTools: process.env.NODE_ENV !== 'production',
});

// Optional but very useful: makes refetchOnFocus, refetchOnReconnect, etc. work
setupListeners(store.dispatch);

// ────────────────────────────────────────────────
// TypeScript types for the whole app
// ────────────────────────────────────────────────
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Helper type for thunks / async actions (optional but recommended)
export type AppThunk<ReturnType = void> = import('@reduxjs/toolkit').ThunkAction<
  ReturnType,
  RootState,
  unknown,
  import('@reduxjs/toolkit').Action
>;
