export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { uploadFile, validateFile } from '@/lib/db/storage';
import { logger } from '@/lib/logger';
import { rateLimit } from '@/lib/middleware/rate-limit';
import { getLimits } from '@/lib/edge-config';

// Input validation schema
const UploadRequestSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.string().min(1).max(100),
  folder: z.string().optional(),
});

export async function POST(request: NextRequest) {
  // Create the rate limiter with custom options
  const limiter = rateLimit({
    limit: 20,
    windowMs: 60 * 1000, // 1 minute
  });

  // Apply the middleware
  const rateLimitResult = await limiter(request);

  if (rateLimitResult) {
    // If middleware returns a response, return it early
    return rateLimitResult;
  }
  try {
    // Get system limits from Edge Config
    const limits = await getLimits();

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Extract metadata
    const metadata = {
      filename: (formData.get('filename') as string) || file.name,
      contentType: (formData.get('contentType') as string) || file.type,
      folder: (formData.get('folder') as string) || 'submissions',
    };

    // Validate metadata
    const validationResult = UploadRequestSchema.safeParse(metadata);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid metadata', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Validate file
    const fileValidation = validateFile(buffer, metadata.contentType, limits.maxSubmissionSize);

    if (!fileValidation.valid) {
      return NextResponse.json({ error: fileValidation.error }, { status: 400 });
    }

    // Upload file to Blob Store
    const result = await uploadFile(buffer, {
      filename: metadata.filename,
      contentType: metadata.contentType,
      folder: metadata.folder,
    });

    logger.info('File uploaded successfully', {
      context: 'uploads',
      pathname: result.pathname,
      size: result.size,
    });

    // Return the upload result
    return NextResponse.json({
      success: true,
      file: {
        url: result.url,
        pathname: result.pathname,
        contentType: result.contentType,
        size: result.size,
        uploadedAt: result.uploadedAt,
      },
    });
  } catch (error) {
    logger.error('Error uploading file', error, {
      context: 'uploads',
    });

    return NextResponse.json(
      { error: 'Failed to upload file', message: (error as Error).message },
      { status: 500 }
    );
  }
}
