'use client';

import { createContext, useContext, useEffect, useState } from 'react';

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
  role: RoleRow;
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
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
          credentials: 'include',
        });

        if (!res.ok) throw new Error('Not authenticated');

        const data = await res.json();
        setUser(data);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
