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

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL;

const AuthContext = createContext({
  user: null,
  loading: true,

  login: async () => { },
  loginWithGoogle: async () => { },
  logout: () => { },

  hasRole: () => false,

  isLoggingIn: false,
  isGoogleLoggingIn: false,
});

export function AuthProvider({ children }) {
  const [isLoggingIn, setIsLoggingIn] =
    useState(false);

  const [isGoogleLoggingIn, setIsGoogleLoggingIn] =
    useState(false);

  // --------------------------------------------------
  // Current user
  // --------------------------------------------------

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

  // --------------------------------------------------
  // Firebase -> Backend synchronization
  // --------------------------------------------------
  //
  // This is the important common function.
  //
  // Both:
  //   Email/password
  //   Google
  //
  // eventually come here.
  //
  // Firebase gives us the ID token.
  // Backend verifies that token and returns the
  // application user.
  // --------------------------------------------------

  const syncWithBackend = useCallback(
    async (idToken, options = {}) => {
      const response = await fetch(
        `${API_BASE_URL}/auth/sync`,
        {
          method: 'POST',

          headers: {
            Authorization: `Bearer ${idToken}`,
            'Content-Type': 'application/json',
          },

          body: JSON.stringify(options),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error ||
          'Authentication synchronization failed'
        );
      }

      return {
        ...result,
        idToken,
      };
    },
    []
  );

  // --------------------------------------------------
  // Email / Password Login
  // --------------------------------------------------

  const login = useCallback(
    async ({ email, password }) => {
      setIsLoggingIn(true);

      try {
        // --------------------------------------------
        // 1. Authenticate against Firebase
        // --------------------------------------------

        const credential =
          await signInWithEmailAndPassword(
            firebaseAuth,
            email,
            password
          );

        // --------------------------------------------
        // 2. Get Firebase ID token
        // --------------------------------------------

        const idToken =
          await credential.user.getIdToken();

        // --------------------------------------------
        // 3. Synchronize Firebase user with our DB
        // --------------------------------------------

        const result =
          await syncWithBackend(idToken);

        console.log(
          '[AuthContext] Email login sync:',
          result
        );

        // --------------------------------------------
        // 4. New user
        //
        // Firebase account exists but our DB account
        // does not exist yet.
        // --------------------------------------------

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

        // --------------------------------------------
        // 5. Existing user
        //
        // The Firebase ID token becomes the access
        // token used by the workspace API.
        // --------------------------------------------

        localStorage.setItem(
          'accessToken',
          idToken
        );

        // --------------------------------------------
        // 6. Refresh current user
        // --------------------------------------------

        await triggerGetUser(
          undefined,
          {
            forceRefetch: true,
          }
        ).unwrap();

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

        localStorage.removeItem(
          'accessToken'
        );

        localStorage.removeItem(
          'refreshToken'
        );

        throw err;
      } finally {
        setIsLoggingIn(false);
      }
    },
    [
      syncWithBackend,
      triggerGetUser,
    ]
  );

  // --------------------------------------------------
  // Google Login
  // --------------------------------------------------

  const loginWithGoogle = useCallback(
    async () => {
      setIsGoogleLoggingIn(true);

      try {
        // --------------------------------------------
        // 1. Google provider
        // --------------------------------------------

        const provider =
          new GoogleAuthProvider();

        provider.setCustomParameters({
          prompt: 'select_account',
        });

        // --------------------------------------------
        // 2. Open Google popup
        // --------------------------------------------

        const credential =
          await signInWithPopup(
            firebaseAuth,
            provider
          );

        // --------------------------------------------
        // 3. Get Firebase ID token
        // --------------------------------------------

        const idToken =
          await credential.user.getIdToken();

        // --------------------------------------------
        // 4. Synchronize with backend
        // --------------------------------------------

        const result =
          await syncWithBackend(idToken);

        console.log(
          '[AuthContext] Google login sync:',
          result
        );

        // --------------------------------------------
        // 5. New Google account
        //
        // Firebase account exists.
        // Application account does not.
        //
        // Send user to signup so they can select:
        //
        // fan
        // artist
        // brand
        // --------------------------------------------

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

        // --------------------------------------------
        // 6. Existing application user
        // --------------------------------------------

        localStorage.setItem(
          'accessToken',
          idToken
        );

        // --------------------------------------------
        // 7. Refresh current user
        // --------------------------------------------

        await triggerGetUser(
          undefined,
          {
            forceRefetch: true,
          }
        ).unwrap();

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

        // Don't show an error when the user
        // intentionally closes the Google popup.

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
    [
      syncWithBackend,
      triggerGetUser,
    ]
  );

  // --------------------------------------------------
  // Auto retry logic
  // --------------------------------------------------

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

  // --------------------------------------------------
  // Logout
  // --------------------------------------------------

  const logout = useCallback(async () => {
    try {
      // Sign out from Firebase as well.
      await signOut(firebaseAuth);
    } catch (err) {
      console.error(
        '[AuthContext] Firebase logout failed:',
        err
      );
    } finally {
      localStorage.removeItem(
        'accessToken'
      );

      localStorage.removeItem(
        'refreshToken'
      );

      window.location.href = '/login';
    }
  }, []);

  // --------------------------------------------------
  // Role helper
  // --------------------------------------------------

  const hasRole = useCallback(
    (roles = []) => {
      if (
        !Array.isArray(roles) ||
        !user?.role
      ) {
        return false;
      }

      // Depending on your API response,
      // role may be:
      //
      // "ADMIN"
      //
      // or:
      //
      // { name: "ADMIN" }
      //

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

  // --------------------------------------------------
  // Provider
  // --------------------------------------------------

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

export const useAuth = () =>
  useContext(AuthContext);