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

  const { data, isLoading } = useGetCurrentUserQuery(undefined, {
    skip: !accessToken,
  });

  const isBrandManager = data?.user?.role?.name === 'BRAND_MANAGER';

  const { data: brandsData } = useGetMyBrandsQuery(undefined, {
    skip: !isBrandManager,
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
        ...(isBrandManager && {
          brands: brandsData?.brands ?? [],
        }),
      }
    : null;

  return (
    <AuthContext.Provider value={{ user, loading: isLoading && !!accessToken, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
