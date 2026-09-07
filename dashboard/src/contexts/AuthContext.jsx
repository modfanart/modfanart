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


  const hasToken = !!localStorage.getItem('accessToken');

  return (
    <AuthContext.Provider
      value={{
        user,


        loading:
          !authError &&
          (isLoading || (!user && hasToken)),

        authError,

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