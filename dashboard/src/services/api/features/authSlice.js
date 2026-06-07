// src/store/features/authSlice.js

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  accessToken: null,
  user: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Allow user to be null
    setCredentials: (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
    },

    logout: (state) => {
      state.accessToken = null;
      state.user = null;

      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;