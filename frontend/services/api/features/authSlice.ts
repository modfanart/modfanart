import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { SyncedUser } from '../authApi';

interface AuthState {
  accessToken: string | null;
  user: SyncedUser | null;
}

const initialState: AuthState = {
  accessToken: null,
  user: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ accessToken: string; user: SyncedUser | null }>) => {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
    },
    setToken: (state, action: PayloadAction<string | null>) => {
      state.accessToken = action.payload;
    },
    logout: (state) => {
      state.accessToken = null;
      state.user = null;
    },
  },
});

export const { setCredentials, setToken, logout } = authSlice.actions;
export default authSlice.reducer;
