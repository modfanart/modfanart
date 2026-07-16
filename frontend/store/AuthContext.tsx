'use client';

import React, { createContext, useContext } from 'react';
import { useSelector } from 'react-redux';
import { signOut } from 'firebase/auth';
import { firebaseAuth } from '@/lib/firebase';
import { useGetCurrentUserQuery, useGetMyBrandsQuery, Brand } from '@/services/api/userApi';
import { logout as reduxLogout } from '@/services/api/features/authSlice';
import { useAppDispatch } from '@/store/hooks';
import type { RootState } from '@/store';

export interface RoleRow {
  id: string;
  name: string;
  hierarchy_level: number;
  is_system: boolean;
  permissions: Record<string, boolean>;
  created_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  username: string | null;
  avatar_url: string | null;
  role?: RoleRow;
  brands?: Brand[];
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const initialized = useSelector((state: RootState) => state.auth.initialized);

  const { data, isLoading } = useGetCurrentUserQuery(undefined, {
    skip: !accessToken,
  });

  const hasBrandRole = ['BRAND_MANAGER', 'BRAND_OWNER', 'BRAND_EDITOR', 'BRAND_MEMBER'].includes(
    data?.user?.role?.name ?? ''
  );

  const { data: brandsData } = useGetMyBrandsQuery(undefined, {
    skip: !hasBrandRole,
  });

  const handleLogout = async () => {
    await signOut(firebaseAuth);
    dispatch(reduxLogout());
    window.location.href = '/login';
  };

  const user: AuthUser | null = data?.user
    ? {
        id: data.user.id,
        email: data.user.email ?? '',
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
        ...(hasBrandRole && {
          brands: brandsData?.brands ?? [],
        }),
      }
    : null;

  return (
    <AuthContext.Provider
      value={{
        // Stay "loading" until Firebase has reported at least once, so guards
        // don't treat the pre-rehydration window as logged out. After that,
        // only loading while the current-user query is in flight.
        user,
        loading: !initialized || (isLoading && !!accessToken),
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
