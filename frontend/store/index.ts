// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authApi from '@/app/api/authApi';
import userApi from '../app/api/userApi';
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
// import other reducers as needed

export const store = configureStore({
  reducer: {
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
    // auth: authReducer,           // add when you create authSlice
    // other slices...
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
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

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
