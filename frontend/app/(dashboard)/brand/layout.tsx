// app/(dashboard)/brand/layout.tsx
import RoleGuard from '@/components/RoleGuard';
import { Sidebar } from './brandsidebar';
import type { ReactNode } from 'react';

export default async function BrandLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard allowedRoles={['brand']}>
      <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
        <Sidebar />
        <div className="flex flex-col">
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </RoleGuard>
  );
}
