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
        } else {
          // Sync failed (e.g. server down) — still set token so UI isn't stuck
          dispatch(setCredentials({ accessToken: token, user: null }));
        }
      } catch {
        dispatch(logout());
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
