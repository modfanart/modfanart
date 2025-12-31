import { type NextRequest, NextResponse } from 'next/server';
import {
  getSubmissionsByUserId,
  getSubmissionsByStatus,
  createSubmission,
} from '@/lib/db/models/submission';
import { getUserById } from '@/lib/db/models/user';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    if (userId) {
      // Verify user exists
      const user = await getUserById(userId);
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const submissions = await getSubmissionsByUserId(userId);
      return NextResponse.json({ submissions });
    }

    if (status) {
      const submissions = await getSubmissionsByStatus(status as any);
      return NextResponse.json({ submissions });
    }

    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch submissions',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, category, originalIp, tags, imageUrl, licenseType, userId } = body;

    // Validate required fields
    if (
      !title ||
      !description ||
      !category ||
      !originalIp ||
      !imageUrl ||
      !licenseType ||
      !userId
    ) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify user exists
    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const submission = await createSubmission({
      title,
      description,
      category,
      originalIp,
      tags: Array.isArray(tags) ? tags : tags.split(',').map((tag: string) => tag.trim()),
      status: 'pending',
      imageUrl,
      licenseType,
      userId,
    });

    return NextResponse.json({ success: true, submission });
  } catch (error) {
    console.error('Error creating submission:', error);
    return NextResponse.json(
      {
        error: 'Failed to create submission',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
