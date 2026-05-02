'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_BASE_URL } from '@/services';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link.');
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/verify-email?token=${token}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Verification failed');
        }

        setStatus('success');
        setMessage('Your email has been verified successfully 🎉');

        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } catch (err: any) {
        setStatus('error');
        setMessage(err.message || 'Verification failed. Token may be expired.');
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white shadow-md rounded-xl p-8 text-center space-y-4">
        {status === 'loading' && (
          <>
            <h2 className="text-xl font-semibold">Verifying...</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <h2 className="text-xl font-semibold text-green-600">Success ✅</h2>
            <p className="text-gray-600">{message}</p>
            <p className="text-sm text-gray-400">Redirecting to login...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <h2 className="text-xl font-semibold text-red-600">Error ❌</h2>
            <p className="text-gray-600">{message}</p>

            <Link
              href="/login"
              className="inline-block mt-4 px-4 py-2 bg-black text-white rounded-md"
            >
              Go to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default VerifyEmailContent;
