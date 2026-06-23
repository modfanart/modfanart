import { z } from 'zod';
import { logger } from '../utils/logger';

// User validation schemas
export const UserRoleSchema = z.enum(['artist', 'brand', 'creator', 'admin']);
export const SubscriptionTierSchema = z.enum(['free', 'premium_artist', 'creator', 'enterprise']);
export const SubscriptionStatusSchema = z.enum(['active', 'inactive', 'past_due', 'canceled']);

export const SocialLinksSchema = z
  .object({
    twitter: z.string().url().optional(),
    instagram: z.string().url().optional(),
    facebook: z.string().url().optional(),
    tiktok: z.string().url().optional(),
  })
  .optional();

export const UserSettingsSchema = z
  .object({
    notifications: z.boolean().default(true),
    marketingEmails: z.boolean().default(true),
    twoFactorEnabled: z.boolean().default(false),
  })
  .optional();

export const SubscriptionSchema = z
  .object({
    tier: SubscriptionTierSchema,
    status: SubscriptionStatusSchema,
    renewalDate: z.string().optional(),
    customerId: z.string().optional(),
  })
  .optional();

export const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  role: UserRoleSchema,
  profileImageUrl: z.string().url().optional(),
  bio: z.string().max(500).optional(),
  website: z.string().url().optional(),
  socialLinks: SocialLinksSchema,
  subscription: SubscriptionSchema,
  settings: UserSettingsSchema,
});

export const UpdateUserSchema = CreateUserSchema.partial();

// Submission validation schemas
export const SubmissionStatusSchema = z.enum([
  'pending',
  'review',
  'approved',
  'rejected',
  'licensed',
]);

export const CreateSubmissionSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  category: z.string().min(2).max(50),
  originalIp: z.string().min(2).max(100),
  tags: z.array(z.string().min(1).max(30)).max(10),
  status: SubmissionStatusSchema.default('pending'),
  imageUrl: z.string().url(),
  licenseType: z.string().min(2).max(50),
  userId: z.string().uuid(),
  reviewNotes: z.string().max(1000).optional(),
  reviewedBy: z.string().uuid().optional(),
  reviewedAt: z.date().optional(),
});

export const UpdateSubmissionSchema = CreateSubmissionSchema.partial();

// Product validation schemas
export const ProductStatusSchema = z.enum(['active', 'inactive', 'draft', 'archived']);

export const CreateProductSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  price: z.number().positive(),
  imageUrl: z.string().url(),
  category: z.string().min(2).max(50),
  artist: z.string().min(2).max(100),
  brand: z.string().min(2).max(100),
  status: ProductStatusSchema.default('draft'),
  isNew: z.boolean().default(false),
  isBestseller: z.boolean().default(false),
});

export const UpdateProductSchema = CreateProductSchema.partial();

/**
 * Generic validation helper that safely parses data against a Zod schema.
 * Returns a consistent result object with success flag, validated data (if successful),
 * or ZodError (if validation failed).
 */
/**
 * Generic validation helper that safely parses data against a Zod schema.
 * Returns a consistent result object with success flag, validated data (if successful),
 * or ZodError (if validation failed).
 */
export function validateModel<T>(
  data: unknown,
  schema: z.ZodSchema<T>,
  context: string
): {
  success: boolean;
  data?: T;
  errors?: z.ZodError;
} {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Log Zod validation errors at warn level with structured data
      logger.warn(`Validation error in ${context}`, {
        context: 'model-validation',
        errors: error.flatten(),
      });

      return { success: false, errors: error };
    }

    // Unexpected error (not a ZodError) — use your logger's exact signature
    logger.error(`Unexpected validation error in ${context}`, error as Error);

    // Fallback to empty ZodError for type consistency
    return { success: false, errors: new z.ZodError([]) };
  }
}
