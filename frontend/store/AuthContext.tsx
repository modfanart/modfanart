'use client';

import { createContext, useContext } from 'react';
import { useGetCurrentUserQuery } from '@/services/api/userApi';

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
  username?: string;
  role?: RoleRow;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data, isLoading, isError } = useGetCurrentUserQuery();
  const user: AuthUser | null = data?.user
    ? {
        id: data.user.id,
        email: data.user.email,
        username: data.user.username, // ← add this line
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
      }
    : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
