'use client';

import { redirect } from 'next/navigation';
import dynamic from 'next/dynamic';

const AuthDebug = dynamic(() => import('@/components/auth-debug').then((mod) => mod.AuthDebug), {
  ssr: false,
});

export default function AuthDebugPage() {
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_DEBUG !== 'true') {
    redirect('/');
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Authentication Debug</h1>
      <div className="max-w-2xl">
        <AuthDebug />
      </div>
    </div>
  );
}
