import { PlusCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

import type React from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionLink?: string;
  icon?: React.ReactNode;
  showImage?: boolean;
}

// The action is opt-in: pass actionLink to get a button. It used to default to
// "Create New" -> /submissions/new, so every empty state that did not ask for a
// button got one anyway, pointing at the artist artwork-submission form. On the
// contest manage page that put a "Create New" button under "No judges assigned
// yet", which 404s on any build without that route.
export function EmptyState({
  title,
  description,
  actionLabel = 'Create New',
  actionLink,
  icon,
  showImage = true,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {showImage && (
        <div className="mb-6 relative w-40 h-40">
          <Image
            src="/placeholder.svg?height=160&width=160&text=No+Content"
            alt="No content"
            fill
            className="opacity-50"
          />
        </div>
      )}

      {icon && <div className="mb-6 text-muted-foreground">{icon}</div>}

      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md mb-6">{description}</p>

      {actionLink && (
        <Link href={actionLink}>
          <Button className="bg-[#9747ff] hover:bg-[#8035e0]">
            <PlusCircle className="mr-2 h-4 w-4" />
            {actionLabel}
          </Button>
        </Link>
      )}
    </div>
  );
}
