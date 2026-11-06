'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

// The admin area currently consists of the marketplace console.
export default function AdminHome() {
  const { role } = useParams<{ role: string }>();
  const router = useRouter();

  useEffect(() => {
    router.replace(`/admin/${role}/marketplace`);
  }, [role, router]);

  return null;
}
