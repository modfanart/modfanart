'use client';

import { useParams } from 'next/navigation';

import { AdminShell } from '@/components/marketplace/admin/admin-shell';
import { AdminOverview } from '@/components/marketplace/admin/admin-views';

export default function Page() {
  const { role } = useParams<{ role: string }>();
  const basePath = `/admin/${role}`;

  return (
    <AdminShell basePath={basePath} title="Marketplace">
      <AdminOverview root={`${basePath}/marketplace`} />
    </AdminShell>
  );
}
