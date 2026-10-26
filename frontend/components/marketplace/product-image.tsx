'use client';

import { useState } from 'react';
import { ImageOff } from 'lucide-react';

import { cn } from '@/lib/utils';

// Plain <img> on purpose: merch images come from seller-supplied URLs on
// arbitrary hosts, which next/image rejects unless every host is allow-listed.
export function ProductImage({
  src,
  alt,
  className,
}: {
  src?: string | null;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={cn('flex h-full w-full items-center justify-center bg-muted text-muted-foreground', className)}
        role="img"
        aria-label={alt}
      >
        <ImageOff className="h-8 w-8 opacity-50" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn('h-full w-full object-cover', className)}
    />
  );
}
