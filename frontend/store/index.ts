// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

// RTK Query APIs
import authApi from '@/app/api/authApi';           // or '@/services/api/authApi'
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

// If you have the auth slice → uncomment when ready
// import authReducer from '@/store/features/authSlice';

export const store = configureStore({
  reducer: {
    // RTK Query reducers (automatically generated)
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

    // Add this when you activate the slice
    // auth: authReducer,
    // user: userReducer,   // if you ever make a non-query user slice
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Optional: turn off serializable check if you store complex objects (like File in form state)
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
      artworkTagsApi.middleware
    ),

  devTools: process.env.NODE_ENV !== 'production',
});

setupListeners(store.dispatch);

// ────────────────────────────────────────────────
// Types for the whole app
// ────────────────────────────────────────────────
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Optional: helper type for thunks / async actions
export type AppThunk<ReturnType = void> = import('@reduxjs/toolkit').ThunkAction<
  ReturnType,
  RootState,
  unknown,
  import('@reduxjs/toolkit').Action
>;