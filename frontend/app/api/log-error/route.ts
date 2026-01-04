export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
import { type NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    // Parse the error data from the request
    const errorData = await request.json();

    // Log the error with our logger
    logger.error('Client-side error', new Error(errorData.message), {
      context: 'client-error',
      data: {
        ...errorData,
        // Don't log potentially sensitive stack traces to console in production
        stack: process.env.NODE_ENV === 'production' ? undefined : errorData.stack,
      },
    });

    // In a real application, you might want to store this in a database
    // or send it to an error tracking service like Sentry

    return NextResponse.json({ success: true });
  } catch (error) {
    // If we can't log the error, log that error
    console.error('Failed to log client error:', error);

    return NextResponse.json({ success: false, message: 'Failed to log error' }, { status: 500 });
  }
}
