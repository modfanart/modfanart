'use client';

import { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { store } from '@/store';
import { onIdTokenChanged } from 'firebase/auth';
import { firebaseAuth } from '@/lib/firebase';
import { setCredentials, logout, setInitialized } from '@/services/api/features/authSlice';
import { API_BASE_URL } from '@/services';

function FirebaseAuthSync() {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(firebaseAuth, async (firebaseUser) => {
      try {
        if (!firebaseUser) {
          dispatch(logout());
          return;
        }

        const token = await firebaseUser.getIdToken();

        const syncRes = await fetch(`${API_BASE_URL}/auth/sync`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (syncRes.ok) {
          const { user } = await syncRes.json();
          dispatch(setCredentials({ accessToken: token, user }));
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
        dispatch(setInitialized());
      }
    });

    return unsubscribe;
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
