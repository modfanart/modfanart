'use client';

import { Check, Circle } from 'lucide-react';
import { PASSWORD_RULES } from '@/lib/auth/password-policy';
import { cn } from '@/lib/utils';

/** Live list of the password rules under a "new password" field, ticking as each is met. */
export function PasswordChecklist({ password, id }: { password: string; id?: string }) {
  return (
    <ul id={id} className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs" aria-live="polite">
      {PASSWORD_RULES.map((rule) => {
        const met = rule.test(password || '');
        return (
          <li
            key={rule.id}
            className={cn('flex items-center gap-1.5', met ? 'text-green-700' : 'text-gray-500')}
          >
            {met ? (
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <Circle className="h-3 w-3" aria-hidden="true" />
            )}
            <span>
              {rule.label}
              <span className="sr-only">{met ? ' (done)' : ' (missing)'}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
