
// src/contexts/AuthContext.jsx

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';

import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth';

import { firebaseAuth } from '../lib/firebase';

import {
  useGetCurrentUserQuery,
  useLazyGetCurrentUserQuery,
} from '../services/api/userApi';

import {
  useSyncMutation,
} from '../services/api/authApi';

// ============================================================
// AUTH CONTEXT
// ============================================================

const AuthContext = createContext({
  user: null,
  loading: true,

  login: async () => { },
  loginWithGoogle: async () => { },
  logout: async () => { },

  hasRole: () => false,

  isLoggingIn: false,
  isGoogleLoggingIn: false,
});

// ============================================================
// AUTH PROVIDER
// ============================================================

export function AuthProvider({ children }) {
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [isGoogleLoggingIn, setIsGoogleLoggingIn] =
    useState(false);

  // ----------------------------------------------------------
  // RTK QUERY
  // ----------------------------------------------------------

  /**
   * Firebase -> Backend synchronization.
   *
   * The actual HTTP request is handled by authApi.js.
   *
   * AuthContext only coordinates:
   *
   * Firebase authentication
   *        ↓
   * Firebase ID token
   *        ↓
   * authApi.sync()
   *        ↓
   * Backend
   */
  const [sync] = useSyncMutation();

  // ----------------------------------------------------------
  // Current User
  // ----------------------------------------------------------

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useGetCurrentUserQuery(undefined, {
    skip: !localStorage.getItem('accessToken'),
  });

  const [triggerGetUser] =
    useLazyGetCurrentUserQuery();

  // ----------------------------------------------------------
  // Normalize User
  // ----------------------------------------------------------

  const user = data
    ? {
      id: data.id,
      email: data.email ?? '',
      username: data.username ?? null,
      avatar_url: data.avatar_url ?? null,
      role: data.role,
      permissions: data.permissions ?? {},
      brands: data.brands ?? [],
    }
    : null;

  console.log(
    '[AuthContext] Current user:',
    user ? user.username : null,
    '| Error:',
    error?.status
  );

  // ==========================================================
  // EMAIL / PASSWORD LOGIN
  // ==========================================================

  const login = useCallback(
    async ({ email, password }) => {
      setIsLoggingIn(true);

      try {
        // ----------------------------------------------------
        // 1. Authenticate against Firebase
        // ----------------------------------------------------

        const credential =
          await signInWithEmailAndPassword(
            firebaseAuth,
            email,
            password
          );

        // ----------------------------------------------------
        // 2. Get Firebase ID Token
        // ----------------------------------------------------

        const idToken =
          await credential.user.getIdToken();

        // ----------------------------------------------------
        // 3. Synchronize Firebase user with backend
        //
        // RTK Query now handles the HTTP request.
        // ----------------------------------------------------

        const result = await sync({
          idToken,
        }).unwrap();

        console.log(
          '[AuthContext] Email login sync:',
          result
        );

        // ----------------------------------------------------
        // 4. New User
        //
        // Firebase account exists but application account
        // does not exist yet.
        // ----------------------------------------------------

        if (
          result?.isNewUser ||
          result?.requiresSignup ||
          !result?.user
        ) {
          return {
            success: true,
            isNewUser: true,
            requiresSignup: true,
            idToken,
            user: null,
          };
        }

        // ----------------------------------------------------
        // 5. Existing User
        //
        // Firebase ID token becomes the access token used
        // by the workspace/application API.
        // ----------------------------------------------------

        localStorage.setItem(
          'accessToken',
          idToken
        );

        // ----------------------------------------------------
        // 6. Refresh Current User
        // ----------------------------------------------------

        await triggerGetUser(
          undefined,
          {
            forceRefetch: true,
          }
        ).unwrap();

        // ----------------------------------------------------
        // 7. Return Authentication Result
        // ----------------------------------------------------

        return {
          success: true,
          isNewUser: false,
          requiresSignup: false,
          accessToken: idToken,
          user: result.user,
        };
      } catch (err) {
        console.error(
          '[AuthContext] Email login failed:',
          err
        );

        // ----------------------------------------------------
        // Clear locally stored authentication state
        // ----------------------------------------------------

        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        throw err;
      } finally {
        setIsLoggingIn(false);
      }
    },
    [sync, triggerGetUser]
  );

  // ==========================================================
  // GOOGLE LOGIN
  // ==========================================================

  const loginWithGoogle = useCallback(
    async () => {
      setIsGoogleLoggingIn(true);

      try {
        // ----------------------------------------------------
        // 1. Create Google Provider
        // ----------------------------------------------------

        const provider =
          new GoogleAuthProvider();

        provider.setCustomParameters({
          prompt: 'select_account',
        });

        // ----------------------------------------------------
        // 2. Open Google Popup
        // ----------------------------------------------------

        const credential =
          await signInWithPopup(
            firebaseAuth,
            provider
          );

        // ----------------------------------------------------
        // 3. Get Firebase ID Token
        // ----------------------------------------------------

        const idToken =
          await credential.user.getIdToken();

        // ----------------------------------------------------
        // 4. Synchronize with Backend
        //
        // RTK Query handles:
        //
        // POST /auth/sync
        // Authorization: Bearer <firebase-id-token>
        // ----------------------------------------------------

        const result = await sync({
          idToken,
        }).unwrap();

        console.log(
          '[AuthContext] Google login sync:',
          result
        );

        // ----------------------------------------------------
        // 5. New Google Account
        //
        // Firebase account exists but application account
        // does not exist yet.
        //
        // The caller can redirect the user to signup where
        // they can select:
        //
        // fan
        // artist
        // brand
        // ----------------------------------------------------

        if (
          result?.isNewUser ||
          result?.requiresSignup ||
          !result?.user
        ) {
          return {
            success: true,
            isNewUser: true,
            requiresSignup: true,
            idToken,
            user: null,
          };
        }

        // ----------------------------------------------------
        // 6. Existing Application User
        // ----------------------------------------------------

        localStorage.setItem(
          'accessToken',
          idToken
        );

        // ----------------------------------------------------
        // 7. Refresh Current User
        // ----------------------------------------------------

        await triggerGetUser(
          undefined,
          {
            forceRefetch: true,
          }
        ).unwrap();

        // ----------------------------------------------------
        // 8. Return Authentication Result
        // ----------------------------------------------------

        return {
          success: true,
          isNewUser: false,
          requiresSignup: false,
          accessToken: idToken,
          user: result.user,
        };
      } catch (err) {
        console.error(
          '[AuthContext] Google login failed:',
          err
        );

        // ----------------------------------------------------
        // Don't show an error / clear auth state when the
        // user intentionally closes the Google popup.
        // ----------------------------------------------------

        if (
          err?.code !==
          'auth/popup-closed-by-user'
        ) {
          localStorage.removeItem(
            'accessToken'
          );

          localStorage.removeItem(
            'refreshToken'
          );
        }

        throw err;
      } finally {
        setIsGoogleLoggingIn(false);
      }
    },
    [sync, triggerGetUser]
  );

  // ==========================================================
  // AUTO RETRY LOGIC
  // ==========================================================

  useEffect(() => {
    if (error?.status === 401) {
      const token =
        localStorage.getItem('accessToken');

      if (token) {
        console.log(
          '[AuthProvider] 401 detected but token exists → forcing refetch'
        );

        const timeout = setTimeout(() => {
          refetch();
        }, 400);

        return () => clearTimeout(timeout);
      }
    }
  }, [error, refetch]);

  // ==========================================================
  // LOGOUT
  // ==========================================================

  const logout = useCallback(async () => {
    try {
      // ------------------------------------------------------
      // Sign out from Firebase as well.
      // ------------------------------------------------------

      await signOut(firebaseAuth);
    } catch (err) {
      console.error(
        '[AuthContext] Firebase logout failed:',
        err
      );
    } finally {
      // ------------------------------------------------------
      // Clear application authentication state.
      // ------------------------------------------------------

      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');

      window.location.href = '/login';
    }
  }, []);

  // ==========================================================
  // ROLE HELPER
  // ==========================================================

  const hasRole = useCallback(
    (roles = []) => {
      if (
        !Array.isArray(roles) ||
        !user?.role
      ) {
        return false;
      }

      // Depending on the API response, role may be:
      //
      // "ADMIN"
      //
      // or:
      //
      // { name: "ADMIN" }

      const roleName =
        typeof user.role === 'string'
          ? user.role
          : user.role?.name;

      if (!roleName) {
        return false;
      }

      return roles.includes(roleName);
    },
    [user]
  );

  // ==========================================================
  // PROVIDER
  // ==========================================================

  return (
    <AuthContext.Provider
      value={{
        user,

        loading:
          isLoading ||
          (!user &&
            !!localStorage.getItem(
              'accessToken'
            )),

        login,
        loginWithGoogle,
        logout,

        hasRole,

        isLoggingIn,
        isGoogleLoggingIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================
// USE AUTH
// ============================================================

export const useAuth = () =>
  useContext(AuthContext);
