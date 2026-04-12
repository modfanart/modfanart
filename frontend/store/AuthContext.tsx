'use client';

import { createContext, useContext } from 'react';
import { useGetCurrentUserQuery, useGetMyBrandsQuery } from '@/services/api/userApi';

export interface RoleRow {
  id: string;
  name: string;
  hierarchy_level: number;
  is_system: boolean;
  permissions: Record<string, boolean>;
  created_at: string;
}

/**
 * Frontend-safe user shape
 */
export interface AuthUser {
  id: string;
  email: string;
  username: string | null;
  avatar_url: string | null;

  role?: RoleRow;
  brands?: any[];
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data, isLoading } = useGetCurrentUserQuery();

  const isBrandManager = data?.user?.role?.name === 'brand_manager';

  const { data: brandsData } = useGetMyBrandsQuery(undefined, {
    skip: !isBrandManager,
  });

  /**
   * ✅ Logout handler (centralized auth control)
   */
  const logout = () => {
    localStorage.removeItem('token'); // remove JWT
    window.location.href = '/login'; // full reset
  };

  /**
   * Normalize backend user → frontend user
   */
  const user: AuthUser | null = data?.user
    ? {
        id: data.user.id,
        email: data.user.email,
        username: data.user.username ?? null,
        avatar_url: data.user.avatar_url ?? null,

        ...(data.user.role && {
          role: {
            id: data.user.role.id,
            name: data.user.role.name,
            hierarchy_level: data.user.role.hierarchy_level ?? 0,
            is_system: false,
            permissions: {},
            created_at: '',
          },
        }),

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
