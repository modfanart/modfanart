import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import SubmissionDetail from './submission-detail';

interface EntryPageProps {
  params: Promise<{ slug: string; id: string; entryId: string }>;
}

export const metadata: Metadata = {
  title: 'Submission Details',
  description: 'Review a full contest submission and everything its submitter provided',
};

export default async function EntryPage({ params }: EntryPageProps) {
  const { slug, id, entryId } = await params;

  if (!slug || !id || !entryId) {
    return notFound();
  }

  return <SubmissionDetail slug={slug} contestId={id} entryId={entryId} />;
}
