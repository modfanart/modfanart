// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useLoginMutation } from '@/services/api/authApi';
import { useGetCurrentUserQuery, useLazyGetCurrentUserQuery } from '@/services/api/userApi';

const AuthContext = createContext({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
  hasRole: () => false,
  isLoggingIn: false,
});

export function AuthProvider({ children }) {
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const { data, isLoading, error, refetch } = useGetCurrentUserQuery(undefined, {
    skip: !localStorage.getItem('accessToken'),
  });

  const [loginMutation] = useLoginMutation();
  const [triggerGetUser] = useLazyGetCurrentUserQuery();

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

  console.log('[AuthContext] Current user:', user ? user.username : null, '| Error:', error?.status);

  // Auto-retry logic
  useEffect(() => {
    if (error?.status === 401) {
      const token = localStorage.getItem('accessToken');
      if (token) {
        console.log('[AuthProvider] 401 detected but token exists → forcing refetch');
        setTimeout(() => refetch(), 400);
      }
    }
  }, [error, refetch]);

const login = useCallback(async (credentials) => {
  setIsLoggingIn(true);
  try {
    const res = await loginMutation(credentials).unwrap();

    console.log('[AuthContext] Login Response:', res); // ← Add this for debugging

    const accessToken = res?.accessToken || res?.data?.accessToken;
    const refreshToken = res?.refreshToken || res?.data?.refreshToken;

    if (!accessToken) {
      throw new Error('No access token received from server');
    }

    // Save tokens
    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);

    console.log('✅ Tokens successfully saved to localStorage');
    console.log('Token length:', accessToken.length);

    // Small delay
    await new Promise(r => setTimeout(r, 150));

    // Fetch user
    const userResponse = await triggerGetUser(undefined, { forceRefetch: true }).unwrap();
    
    console.log('[AuthContext] /me response:', userResponse);

    return { success: true };
  } catch (err) {
    console.error('[AuthContext] Login failed:', err);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    throw err;
  } finally {
    setIsLoggingIn(false);
  }
}, [loginMutation, triggerGetUser]);
  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  };

  const hasRole = (roles = []) => {
    if (!Array.isArray(roles) || !user?.role?.name) return false;
    return roles.includes(user.role.name);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: isLoading || (!user && !!localStorage.getItem('accessToken')),
        login,
        logout,
        hasRole,
        isLoggingIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);