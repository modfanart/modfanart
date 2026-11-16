// src/contexts/AuthContext.jsx

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';

import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onIdTokenChanged,
} from 'firebase/auth';

import { firebaseAuth } from '../lib/firebase';

import {
  useGetCurrentUserQuery,
  useLazyGetCurrentUserQuery,
} from '../services/api/userApi';

import {
  useSyncMutation,
} from '../services/api/authApi';


const MAX_AUTH_RETRIES = 2;

const AuthContext = createContext({
  user: null,
  loading: true,
  authError: null,

  login: async () => { },
  loginWithGoogle: async () => { },
  logout: async () => { },

  hasRole: () => false,
  can: () => false,
  isStaff: false,
  isAdmin: false,

  isLoggingIn: false,
  isGoogleLoggingIn: false,
});


export function AuthProvider({ children }) {
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [isGoogleLoggingIn, setIsGoogleLoggingIn] =
    useState(false);


  const [authError, setAuthError] = useState(null);

  const retryCountRef = useRef(0);


  const [sync] = useSyncMutation();


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
      // Effective permissions from the API (admin tier = every key).
      permissions: data.permissions ?? {},
      is_staff: data.is_staff === true,
      is_admin: data.is_admin === true,
      brands: data.brands ?? [],
    }
    : null;

  // Keep the stored ID token fresh: Firebase rotates it hourly and the old
  // code kept sending the expired one.
  useEffect(() => {
    const unsub = onIdTokenChanged(firebaseAuth, async (fbUser) => {
      if (fbUser && localStorage.getItem('authType') !== 'workspace') {
        try {
          localStorage.setItem('accessToken', await fbUser.getIdToken());
        } catch {
          /* handled by the base query on the next request */
        }
      }
    });
    return unsub;
  }, []);


  useEffect(() => {
    if (user) {
      retryCountRef.current = 0;
      setAuthError(null);
    }
  }, [user]);


  const setAuthType = (type) => {
    localStorage.setItem('authType', type);
  };


  const login = useCallback(
    async ({ email, password }) => {
      setIsLoggingIn(true);

      try {

        const credential =
          await signInWithEmailAndPassword(
            firebaseAuth,
            email,
            password
          );

        const idToken =
          await credential.user.getIdToken();


        const result = await sync({
          idToken,
        }).unwrap();

        console.log(
          '[AuthContext] Email login sync:',
          result
        );


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


        localStorage.setItem('accessToken', idToken);
        setAuthType('firebase');

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


        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('authType');

        throw err;
      } finally {
        setIsLoggingIn(false);
      }
    },
    [sync, triggerGetUser]
  );

  const loginWithGoogle = useCallback(
    async () => {
      setIsGoogleLoggingIn(true);

      try {

        const provider =
          new GoogleAuthProvider();

        provider.setCustomParameters({
          prompt: 'select_account',
        });


        const credential =
          await signInWithPopup(
            firebaseAuth,
            provider
          );


        const idToken =
          await credential.user.getIdToken();


        const result = await sync({
          idToken,
        }).unwrap();

        console.log(
          '[AuthContext] Google login sync:',
          result
        );


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

        localStorage.setItem('accessToken', idToken);
        setAuthType('firebase');

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


        if (
          err?.code !==
          'auth/popup-closed-by-user'
        ) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('authType');
        }

        throw err;
      } finally {
        setIsGoogleLoggingIn(false);
      }
    },
    [sync, triggerGetUser]
  );


  useEffect(() => {
    if (error?.status === 401) {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        return;
      }

      if (retryCountRef.current >= MAX_AUTH_RETRIES) {
        console.warn(
          '[AuthProvider] Max auth retries reached — giving up.'
        );

        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('authType');

        setAuthError('SESSION_EXPIRED');
        return;
      }

      retryCountRef.current += 1;

      console.log(
        `[AuthProvider] 401 detected → retry ${retryCountRef.current}/${MAX_AUTH_RETRIES}`
      );

      const timeout = setTimeout(() => {
        refetch();
      }, 400);

      return () => clearTimeout(timeout);
    }
  }, [error, refetch]);


  const logout = useCallback(async () => {
    try {

      await signOut(firebaseAuth);
    } catch (err) {
      console.error(
        '[AuthContext] Firebase logout failed:',
        err
      );
    } finally {

      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('authType');

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


  // Permission check used to show/hide apps and actions. The API enforces
  // the same rules; this only keeps the UI honest.
  const can = useCallback(
    (permission) => {
      if (!user) return false;
      if (user.is_admin) return true;
      if (Array.isArray(permission)) return permission.some((p) => user.permissions?.[p] === true);
      return user.permissions?.[permission] === true;
    },
    [user]
  );

  const hasToken = !!localStorage.getItem('accessToken');

  return (
    <AuthContext.Provider
      value={{
        user,


        // Was `!user && hasToken`, which spun forever when /users/me failed
        // with anything other than 401 (e.g. API down).
        loading: !authError && (isLoading || (!user && hasToken && !error)),

        authError,

        login,
        loginWithGoogle,
        logout,

        hasRole,
        can,
        isStaff: !!user?.is_staff,
        isAdmin: !!user?.is_admin,

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