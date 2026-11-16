'use client';

import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

export function NewSubmissionLink() {
  return (
    <Link href="/submissions/new" passHref legacyBehavior replace>
      <Button className="bg-primary hover:bg-primary-hover" asChild>
        <a>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Submission
        </a>
      </Button>
    </Link>
  );
}
