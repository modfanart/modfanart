import { z } from 'zod';
import { passwordPolicyError } from './password-policy';
import { usernameError } from './username';

/** A new password that satisfies PASSWORD_RULES (AUTH-05). */
export const newPasswordSchema = z.string().superRefine((value, ctx) => {
  const error = passwordPolicyError(value);
  if (error) ctx.addIssue({ code: 'custom', message: error });
});

export const usernameSchema = z.string().superRefine((value, ctx) => {
  const error = usernameError(value);
  if (error) ctx.addIssue({ code: 'custom', message: error });
});

/** The required "I agree to the Terms of Service and Privacy Policy" checkbox (AUTH-04). */
export const acceptTermsSchema = z.boolean().refine((value) => value === true, {
  message: 'Please accept the Terms of Service and Privacy Policy to continue.',
});
