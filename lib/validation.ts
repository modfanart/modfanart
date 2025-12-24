import { z } from 'zod';
import { NextResponse } from 'next/server';
import { logger } from './logger';

/**
 * Validates request data against a Zod schema and returns appropriate response if invalid
 * @param schema Zod schema to validate against
 * @param data Data to validate
 * @param context Context for logging
 * @returns Object with success flag and validated data or error response
 */
export function validateRequest<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown,
  context = 'validation'
): { success: true; data: z.infer<T> } | { success: false; response: NextResponse } {
  const result = schema.safeParse(data);

  if (!result.success) {
    const issues = result.error.issues; // ← Correct way to access errors
    const errorMessages = issues.map((issue) => issue.message).join(', ');

    logger.warn(`Validation failed: ${errorMessages}`, {
      context,
      data: { issues },
    });

    return {
      success: false,
      response: NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: issues.map((issue) => ({
            path: issue.path,
            message: issue.message,
          })),
        },
        { status: 400 }
      ),
    };
  }

  return { success: true, data: result.data };
}

/**
 * Common validation schemas
 */
export const schemas = {
  id: z.string().min(1, 'ID is required'),
  email: z.string().email('Invalid email address'),
  url: z.string().url('Invalid URL'),
  nonEmptyString: z.string().min(1, 'Value cannot be empty'),
  positiveNumber: z.number().positive('Value must be positive'),
  uuid: z.string().uuid('Invalid UUID format'),
  date: z.string().datetime('Invalid date format'),
};
