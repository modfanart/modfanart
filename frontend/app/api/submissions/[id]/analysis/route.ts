export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { getSubmissionById } from '@/lib/db/models/submission';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: RouteContext) {
  try {
    const { id: submissionId } = await params;

    if (!submissionId) {
      return NextResponse.json({ error: 'Submission ID is required' }, { status: 400 });
    }

    const submission = await getSubmissionById(submissionId);

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // Return the submission with its analysis data
    return NextResponse.json({
      submission,
      analysis: submission.analysis,
    });
  } catch (error) {
    console.error('Error retrieving submission analysis:', error);

    return NextResponse.json(
      {
        error: 'Failed to retrieve submission analysis',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
