// src/store/features/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { UserProfile as User } from '../userApi'; // ← this is your UserProfile type

interface AuthState {
  accessToken: string | null;
  user: User | null;
}

const initialState: AuthState = {
  accessToken: null,
  user: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Allow user to be null (for re-auth preservation or edge cases)
    setCredentials: (state, action: PayloadAction<{ accessToken: string; user: User | null }>) => {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
    },
    logout: (state) => {
      state.accessToken = null;
      state.user = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken'); // ← add this for completeness
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
