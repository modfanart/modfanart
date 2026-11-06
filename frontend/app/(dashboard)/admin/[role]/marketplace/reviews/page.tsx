'use client';

import { useParams } from 'next/navigation';

import { AdminShell } from '@/components/marketplace/admin/admin-shell';
import { AdminReviews } from '@/components/marketplace/admin/admin-manage';

export default function Page() {
  const { role } = useParams<{ role: string }>();
  const basePath = `/admin/${role}`;

  return (
    <AdminShell basePath={basePath} title="Reviews">
      <AdminReviews />
    </AdminShell>
  );
}
