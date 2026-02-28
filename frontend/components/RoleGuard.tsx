'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';

import { useAuth } from '@/store/AuthContext';

// ────────────────────────────────────────────────
// Type definitions (extracted / improved)
interface UserRole {
  name: string;
  hierarchy_level?: number;
  permissions?: Record<string, boolean>;
}

interface AuthUser {
  id: string;
  username?: string;
  email?: string;
  role?: UserRole | null;
  // ... other fields
}

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[]; // e.g. ['Artist', 'BrandManager', 'Admin']
  minHierarchyLevel?: number; // e.g. 50 (only users >= level 50)
  requiredPermissions?: string[]; // e.g. ['artwork:publish', 'brand:manage']
  fallback?: React.ReactNode; // optional custom loading / denied UI
  redirectTo?: string; // custom redirect path on failure (default: '/')
  loginRedirect?: string; // where to send unauthenticated users (default: '/login')
}

// ────────────────────────────────────────────────

export default function RoleGuard({
  children,
  allowedRoles,
  minHierarchyLevel,
  requiredPermissions,
  fallback = null, // or <div>Access denied</div> or skeleton
  redirectTo = '/',
  loginRedirect = '/login',
}: RoleGuardProps) {
  const { user, loading } = useAuth() as { user: AuthUser | null; loading: boolean };
  const router = useRouter();
  console.log(user);
  // Memoize the check so it doesn't re-run unnecessarily
  const hasAccess = useMemo(() => {
    if (loading) return true; // don't decide yet
    if (!user) return false;

    const role = user.role;

    // No role but restrictions exist → deny
    if (
      !role &&
      (allowedRoles?.length || minHierarchyLevel !== undefined || requiredPermissions?.length)
    ) {
      return false;
    }

    if (!role) return true; // no role + no restrictions = allowed

    // Role name check
    if (allowedRoles?.length && !allowedRoles.includes(role.name)) {
      return false;
    }

    // Hierarchy check
    if (minHierarchyLevel !== undefined && (role.hierarchy_level ?? 0) < minHierarchyLevel) {
      return false;
    }

    // Permissions check (all must be true)
    if (requiredPermissions?.length) {
      return requiredPermissions.every((perm) => role.permissions?.[perm] === true);
    }

    return true;
  }, [user, loading, allowedRoles, minHierarchyLevel, requiredPermissions]);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace(`${loginRedirect}?from=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (!hasAccess) {
      router.replace(redirectTo);
    }
  }, [hasAccess, loading, user, router, redirectTo, loginRedirect]);

  // ── Rendering logic ────────────────────────────────────────────────

  // Still loading → show fallback or nothing
  if (loading) {
    return fallback || null;
  }

  // No user or access denied → nothing (redirect is already in motion)
  if (!user || !hasAccess) {
    return fallback || null;
  }

  // Has access → render children
  return <>{children}</>;
}
