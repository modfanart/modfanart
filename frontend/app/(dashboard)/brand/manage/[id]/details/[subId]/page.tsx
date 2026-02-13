import type { Metadata } from 'next';
import SubmissionDetailPageContent from './submission-detail-page';
import { notFound, redirect } from 'next/navigation';

interface SubmissionPageProps {
  params: {
    id: string
    subId: string
  }
}

export const metadata: Metadata = {
  title: 'Submission Details',
  description: 'View and manage your fan art submission details',
};

export default function SubmissionPage({ params }: SubmissionPageProps) {
  const { id: brandId, subId } = params

  if (!brandId || !subId) {
    notFound()
  }

  return (
    <SubmissionDetailPageContent
      brandId={brandId}
      subId={subId}
    />
  )
}
