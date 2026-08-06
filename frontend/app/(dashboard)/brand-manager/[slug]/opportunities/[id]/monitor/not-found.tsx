'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/empty-state';

export default function OpportunityNotFound() {
  const params = useParams();
  const brandSlug = params?.['slug'] as string | undefined;
  const opportunitiesBase = brandSlug
    ? `/brand-manager/${brandSlug}/opportunities`
    : '/explore/contests';

  return (
    <EmptyState
      title="Opportunity Not Found"
      description="The opportunity you're looking for doesn't exist or you don't have access to it."
      icon="file-question" // You can replace this with a proper icon component if needed
      actionLabel="Back to Opportunities"
      actionLink={opportunitiesBase}
    />
  );
}