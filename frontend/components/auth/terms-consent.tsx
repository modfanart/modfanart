'use client';

import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';

/**
 * The consent line every signup path shows (AUTH-04). Links open in a new tab so reading the
 * terms does not throw away a half-filled form.
 */
export function TermsConsent({
  id,
  checked,
  onCheckedChange,
  children,
}: {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(value === true)}
        className="mt-0.5"
      />
      <label htmlFor={id} className="text-sm text-gray-600 leading-snug cursor-pointer">
        {children ?? 'I agree to the'}{' '}
        <Link
          href="/legal/terms-and-service"
          target="_blank"
          rel="noopener noreferrer"
          className="text-violet-600 hover:underline"
        >
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link
          href="/legal/privacy-policy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-violet-600 hover:underline"
        >
          Privacy Policy
        </Link>
        .
      </label>
    </div>
  );
}
