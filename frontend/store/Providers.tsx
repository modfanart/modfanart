'use client';

import { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { store } from '@/store';
import { onIdTokenChanged } from 'firebase/auth';
import { firebaseAuth } from '@/lib/firebase';
import { setCredentials, logout } from '@/services/api/features/authSlice';
import { API_BASE_URL } from '@/services';

function FirebaseAuthSync() {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(firebaseAuth, async (firebaseUser) => {
      if (!firebaseUser) {
        dispatch(logout());
        return;
      }

      try {
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
