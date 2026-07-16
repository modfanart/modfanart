/**
 * @jest-environment node
 */
import { brandRequestSchema } from '@/app/(public)/contact/sales/contact-sales-schema';

// A baseline valid submission; individual tests override the how-heard fields.
const baseValid = {
  companyName: 'Acme Studios',
  website: '',
  contactEmail: 'hello@acme.com',
  contactPhone: '',
  description: 'We make officially licensed fan art and want to join the MOD platform.',
  teamSize: '1-10',
  howHeard: 'search',
  howHeardOther: '',
};

describe('brandRequestSchema – "how did you hear about us"', () => {
  it('accepts a valid submission with a standard source and no "other" detail', () => {
    const result = brandRequestSchema.safeParse(baseValid);
    expect(result.success).toBe(true);
  });

  it('accepts the new "discord" source', () => {
    const result = brandRequestSchema.safeParse({ ...baseValid, howHeard: 'discord' });
    expect(result.success).toBe(true);
  });

  it('rejects "other" when the detail is empty', () => {
    const result = brandRequestSchema.safeParse({
      ...baseValid,
      howHeard: 'other',
      howHeardOther: '',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const onOther = result.error.issues.some((i) => i.path[0] === 'howHeardOther');
      expect(onOther).toBe(true);
    }
  });

  it('rejects "other" when the detail is only whitespace', () => {
    const result = brandRequestSchema.safeParse({
      ...baseValid,
      howHeard: 'other',
      howHeardOther: '   ',
    });
    expect(result.success).toBe(false);
  });

  it('accepts "other" when a detail is provided', () => {
    const result = brandRequestSchema.safeParse({
      ...baseValid,
      howHeard: 'other',
      howHeardOther: 'A friend told me',
    });
    expect(result.success).toBe(true);
  });
});
