import { z } from 'zod';

// ────────────────────────────────────────────────
// Zod schema – matches BrandVerificationRequest backend
// Extracted from the page component so the validation
// rules can be unit tested in isolation.
// ────────────────────────────────────────────────
export const brandRequestSchema = z
  .object({
    companyName: z
      .string()
      .min(2, { message: 'Brand / company name is required (min 2 characters).' }),
    website: z.string().url({ message: 'Please enter a valid URL' }).optional().or(z.literal('')),
    contactEmail: z.string().email({ message: 'Valid email is required.' }),
    contactPhone: z.string().optional(),
    description: z
      .string()
      .min(30, { message: 'Please tell us more about your brand (min 30 characters).' }),
    teamSize: z.string(),
    howHeard: z.string(),
    howHeardOther: z.string().optional(),
    // documents: z.array(z.string()).optional(), // ← add later with file upload
  })
  .superRefine((data, ctx) => {
    // When "Other" is selected, require the free-text detail.
    if (data.howHeard === 'other' && !data.howHeardOther?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['howHeardOther'],
        message: 'Please tell us how you heard about us.',
      });
    }
  });

export type BrandRequestValues = z.infer<typeof brandRequestSchema>;

export const brandRequestDefaultValues: Partial<BrandRequestValues> = {
  teamSize: '1-10',
  howHeard: 'search',
  howHeardOther: '',
};
