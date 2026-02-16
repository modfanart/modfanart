'use client';

import RoleGuard from '@/components/RoleGuard';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard>
      <div className="dashboard-layout">
        {/* Sidebar / Navbar */}
        {children}
      </div>
    </RoleGuard>
  );
}
