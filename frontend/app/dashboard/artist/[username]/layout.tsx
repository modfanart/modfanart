'use client';

import RoleGuard from '@/components/RoleGuard';

export default function ArtistLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={['artist']}>{children}</RoleGuard>;
}
