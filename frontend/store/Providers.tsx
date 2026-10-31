'use client';

import { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { store } from '@/store';
import { onIdTokenChanged } from 'firebase/auth';
import { firebaseAuth } from '@/lib/firebase';
import { setCredentials, logout, setInitialized } from '@/services/api/features/authSlice';
import { userApi } from '@/services/api/userApi';
import { syncSession } from '@/lib/auth/session';

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
        const { user } = await syncSession(token);

        // No local account yet: Firebase just created the user and the signup page is
        // about to create the account with the chosen role. Publishing this token now made
        // AuthProvider fetch /users/me, get a 403, and cache it — and the signup page's own
        // setCredentials with the same token never refetched, so a new account landed on the
        // home page looking logged out (AUTH-13). Let the signup page publish the session.
        if (!user) return;

        dispatch(setCredentials({ accessToken: token, user }));
        // A new token can carry new facts (e.g. email_verified after the link was clicked);
        // make AuthProvider re-read the profile instead of serving a stale cached copy.
        dispatch(userApi.util.invalidateTags(['CurrentUser']));
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
