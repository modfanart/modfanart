'use client';

import RoleGuard from '@/components/RoleGuard';

export default function BrandLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={['brandManager']}>{children}</RoleGuard>;
}
