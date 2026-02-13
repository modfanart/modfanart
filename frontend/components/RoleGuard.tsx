'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/AuthContext';

interface RoleGuardProps {
  children: React.ReactNode;

  allowedRoles?: string[];
  minHierarchyLevel?: number;
  requiredPermissions?: string[];
}

export default function RoleGuard({
  children,
  allowedRoles,
  minHierarchyLevel,
  requiredPermissions,
}: RoleGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // 🔐 Not logged in
    if (!user) {
      router.replace('/login');
      return;
    }

    const role = user.role;

    // 🔴 If role required but user has none → deny
    if (!role && (allowedRoles || minHierarchyLevel !== undefined || requiredPermissions)) {
      router.replace('/');
      return;
    }

    if (role) {
      // ✅ Role name check
      if (allowedRoles && !allowedRoles.includes(role.name)) {
        router.replace('/');
        return;
      }

      // ✅ Hierarchy check
      if (minHierarchyLevel !== undefined && role.hierarchy_level < minHierarchyLevel) {
        router.replace('/');
        return;
      }

      // ✅ Permission check
      if (requiredPermissions) {
        const hasAll = requiredPermissions.every((perm) => role.permissions?.[perm] === true);

        if (!hasAll) {
          router.replace('/');
          return;
        }
      }
    }
  }, [user, loading, allowedRoles, minHierarchyLevel, requiredPermissions, router]);

  if (loading || !user) return null;

  return <>{children}</>;
}
