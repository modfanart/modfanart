// app/(dashboard)/brand/manage/[id]/details/[subId]/page.tsx

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SubmissionDetailPageContent from './submission-detail-page';

export const metadata: Metadata = {
  title: 'Submission Details',
  description: 'View and manage your fan art submission details',
};

// 1. Define the props with params as Promise
interface SubmissionPageProps {
  params: Promise<{
    id: string;
    subId: string;
  }>;
}

// 2. Make the default export async
export default async function SubmissionPage({ params }: SubmissionPageProps) {
  // 3. Await the promise
  const resolvedParams = await params;

  const { id: brandId, subId } = resolvedParams;

  if (!brandId || !subId) {
    notFound();
  }

  return <SubmissionDetailPageContent brandId={brandId} subId={subId} />;
}
