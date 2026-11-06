'use client';

import { useParams } from 'next/navigation';

import { AdminShell } from '@/components/marketplace/admin/admin-shell';
import { ModerationQueue } from '@/components/marketplace/admin/admin-views';

export default function Page() {
  const { role } = useParams<{ role: string }>();
  const basePath = `/admin/${role}`;

  return (
    <AdminShell basePath={basePath} title="Listing moderation">
      <ModerationQueue />
    </AdminShell>
  );
}
