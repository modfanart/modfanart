'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MailWarning, X } from 'lucide-react';
import { useAuth } from '@/store/AuthContext';

const DISMISSED_KEY = 'emailVerificationBannerDismissed';

/**
 * Reminder for accounts that have not confirmed their email (AUTH-03). They can browse, but
 * the server refuses uploads, contest entries and brand verification until they do, so say
 * so before they hit that wall.
 *
 * Floats at the bottom of the viewport: the site header is fixed over the hero at the top,
 * and dashboards fill exactly one screen height, so an in-flow top bar would be covered or
 * push the layout. Dismissible for the rest of the browser session.
 */
export function EmailVerificationBanner() {
  const { user, loading } = useAuth();
  const pathname = usePathname() || '/';
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(sessionStorage.getItem(DISMISSED_KEY) === '1');
  }, []);

  if (loading || !user || user.email_verified || dismissed) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-xl items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-lg"
    >
      <MailWarning className="h-5 w-5 shrink-0" aria-hidden="true" />
      <p className="flex-1">
        Confirm your email address to submit artwork and enter contests.{' '}
        <Link
          href={`/verify-account?next=${encodeURIComponent(pathname)}`}
          className="font-medium underline underline-offset-2"
        >
          Verify now
        </Link>
      </p>
      <button
        type="button"
        onClick={() => {
          sessionStorage.setItem(DISMISSED_KEY, '1');
          setDismissed(true);
        }}
        className="rounded p-1 hover:bg-amber-100"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
