'use client';

import { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { store } from '@/store';
import { onIdTokenChanged } from 'firebase/auth';
import { firebaseAuth } from '@/lib/firebase';
import { setCredentials, setToken, logout, setInitialized } from '@/services/api/features/authSlice';

// Hard ceiling on how long the header/guards may show a loading state.
// Previously a hung /auth/sync (slow API, blocked network) left `initialized`
// false forever: permanent pulsing avatar skeleton, no mobile menu (TECH-01),
// and stuck "Signing in…" screens (AUTH-11).
const AUTH_SYNC_TIMEOUT_MS = 8000;
const AUTH_INIT_FALLBACK_MS = 6000;
import { API_BASE_URL } from '@/services';
import { userApi } from '@/services/api/userApi';

function FirebaseAuthSync() {
  const dispatch = useDispatch();

  useEffect(() => {
    // If Firebase itself never reports (offline, blocked script), stop
    // "loading" anyway and render the logged-out chrome.
    const fallback = setTimeout(() => dispatch(setInitialized()), AUTH_INIT_FALLBACK_MS);

    const unsubscribe = onIdTokenChanged(firebaseAuth, async (firebaseUser) => {
      try {
        if (!firebaseUser) {
          dispatch(logout());
          return;
        }

        const token = await firebaseUser.getIdToken();

        // Make the token available to RTK Query immediately so authenticated
        // requests don't race the sync call and go out without a bearer
        // (cause of the logged-out header flicker: ART-10 / BRD-10 / FAN-08).
        dispatch(setToken(token));

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), AUTH_SYNC_TIMEOUT_MS);
        const syncRes = await fetch(`${API_BASE_URL}/auth/sync`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        }).finally(() => clearTimeout(timer));

        if (syncRes.ok) {
          const { user } = await syncRes.json();
          dispatch(setCredentials({ accessToken: token, user }));
          // A brand-new account may have hit /users/me before sync created
          // the DB row (403). Refetch now that it exists.
          dispatch(userApi.util.invalidateTags(['CurrentUser']));
        }
        // A failed sync here (e.g. transient server hiccup) doesn't mean
        // Firebase signed the user out — leave existing credentials alone
        // rather than clobbering a session another caller (login/signup
        // page) may have just established. Only `!firebaseUser` above,
        // Firebase's own signal, should ever log the user out.
      } catch {
        // Same reasoning as above: a thrown fetch/getIdToken error isn't a
        // sign-out signal, so don't dispatch logout() here either.
      } finally {
        // Auth has now resolved (with or without a session) — let guards stop
        // showing "loading" and decide. Fires once per callback, all paths.
        clearTimeout(fallback);
        dispatch(setInitialized());
      }
    });

    return () => {
      clearTimeout(fallback);
      unsubscribe();
    };
  }, [dispatch]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <FirebaseAuthSync />
      {children}
    </Provider>
  );
}
