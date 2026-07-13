import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { SyncedUser } from '../authApi';

interface AuthState {
  accessToken: string | null;
  user: SyncedUser | null;
  // False until Firebase's first onIdTokenChanged fires. Guards use this to
  // avoid treating the pre-rehydration window as "logged out".
  initialized: boolean;
}

const initialState: AuthState = {
  accessToken: null,
  user: null,
  initialized: false,
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
    // Marks that Firebase has reported auth state at least once (session or not).
    // Never reset — once we've heard from Firebase, we stay initialized.
    setInitialized: (state) => {
      state.initialized = true;
    },
  },
});

export const { setCredentials, setToken, logout, setInitialized } = authSlice.actions;
export default authSlice.reducer;
