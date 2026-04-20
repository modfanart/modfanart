'use client';

import React, { createContext, useContext } from 'react';
import { useGetCurrentUserQuery, useGetMyBrandsQuery, Brand } from '@/services/api/userApi';

/**
 * Role shape (frontend safe)
 */
export interface RoleRow {
  id: string;
  name: string;
  hierarchy_level: number;
  is_system: boolean;
  permissions: Record<string, boolean>;
  created_at: string;
}

/**
 * Frontend-safe user
 */
export interface AuthUser {
  id: string;
  email: string; // always normalized to string
  username: string | null;
  avatar_url: string | null;

  role?: RoleRow;
  brands?: Brand[];
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: () => {},
});

/**
 * Provider
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data, isLoading } = useGetCurrentUserQuery();

  const isBrandManager = data?.user?.role?.name === 'brand_manager';

  const { data: brandsData } = useGetMyBrandsQuery(undefined, {
    skip: !isBrandManager,
  });

  /**
   * Logout handler
   */
  const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  /**
   * Normalize backend → frontend
   */
  const user: AuthUser | null = data?.user
    ? {
        id: data.user.id,

        // ✅ FIX: always string
        email: data.user.email ?? '',

        username: data.user.username ?? null,
        avatar_url: data.user.avatar_url ?? null,

        /**
         * Role normalization
         */
        ...(data.user.role && {
          role: {
            id: data.user.role.id,
            name: data.user.role.name,
            hierarchy_level: data.user.role.hierarchy_level ?? 0,
            is_system: false, // fallback (backend not sending)
            permissions: {}, // fallback
            created_at: '', // fallback
          },
        }),

        /**
         * Brands (only for brand manager)
         */
        ...(isBrandManager && {
          brands: brandsData?.brands ?? [],
        }),
      }
    : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: isLoading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook
 */
export const useAuth = () => useContext(AuthContext);
