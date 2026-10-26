'use client';

import { useCurrency } from '@/lib/marketplace/use-currency';
import { cn } from '@/lib/utils';

export function CurrencyToggle({ className }: { className?: string }) {
  const [currency, setCurrency] = useCurrency();

  return (
    <div
      className={cn('inline-flex rounded-md border p-0.5 text-sm', className)}
      role="group"
      aria-label="Currency"
    >
      {(['INR', 'USD'] as const).map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => setCurrency(c)}
          aria-pressed={currency === c}
          className={cn(
            'rounded px-3 py-1 font-medium transition-colors',
            currency === c
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {c === 'INR' ? '₹ INR' : '$ USD'}
        </button>
      ))}
    </div>
  );
}
