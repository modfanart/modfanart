'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TermsConsent } from '@/components/auth/terms-consent';
import { acceptTermsSchema } from '@/lib/auth/schemas';
import { useSubmitBrandVerificationRequestMutation } from '@/services/api/brands';

const brandRequestSchema = z.object({
  companyName: z.string().min(2, 'Brand / company name is required.'),
  website: z.string().url({ message: 'Please enter a valid URL' }).optional().or(z.literal('')),
  contactEmail: z.string().email('Valid email is required.'),
  contactPhone: z.string().optional(),
  description: z.string().min(30, 'Please describe your brand (min 30 characters).'),
  teamSize: z.string(),
  howHeard: z.string(),
  acceptTerms: acceptTermsSchema,
});

type BrandRequestValues = z.infer<typeof brandRequestSchema>;

/**
 * The brand verification request a signed-in brand account files. Moved out of the signup
 * page: it now needs a confirmed email (server-enforced), so it lives on /brand-manager,
 * where the account can come back to it later.
 */
export function BrandVerificationForm({
  defaultCompanyName = '',
  defaultContactEmail = '',
  onSubmitted,
}: {
  defaultCompanyName?: string;
  defaultContactEmail?: string;
  onSubmitted: () => void;
}) {
  const [submitBrandRequest, { isLoading, error }] = useSubmitBrandVerificationRequestMutation();

  const form = useForm<BrandRequestValues>({
    resolver: zodResolver(brandRequestSchema),
    defaultValues: {
      companyName: defaultCompanyName,
      website: '',
      contactEmail: defaultContactEmail,
      contactPhone: '',
      description: '',
      teamSize: '1-10',
      howHeard: 'search',
      acceptTerms: false,
    },
  });

  const onSubmit = async (values: BrandRequestValues) => {
    try {
      await submitBrandRequest({
        company_name: values.companyName,
        website: values.website || null,
        contact_email: values.contactEmail,
        contact_phone: values.contactPhone || null,
        description: values.description,
        team_size: values.teamSize,
        how_heard: values.howHeard,
        accepted_terms: true,
      }).unwrap();
      onSubmitted();
    } catch {
      // Rendered below from the mutation's error state.
    }
  };

  const serverError =
    (error as any)?.data?.error ||
    (error as any)?.data?.message ||
    (error ? 'We could not submit your request. Please try again.' : null);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brand / Company Name *</FormLabel>
                <FormControl><Input autoComplete="organization" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website (optional)</FormLabel>
                <FormControl><Input placeholder="https://yourbrand.com" autoComplete="url" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="contactEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Email *</FormLabel>
                <FormControl><Input type="email" autoComplete="email" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contactPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Phone (optional)</FormLabel>
                <FormControl><Input placeholder="+1 555 010 0100" autoComplete="tel" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="teamSize"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Approximate Team Size</FormLabel>
              <select
                {...field}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="1-10">1–10 people</option>
                <option value="11-50">11–50 people</option>
                <option value="51-200">51–200 people</option>
                <option value="201-500">201–500 people</option>
                <option value="501+">501+ people</option>
                <option value="agency">Creative Agency / Studio</option>
              </select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>About Your Brand & Goals *</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  className="min-h-32"
                  placeholder="Tell us about your brand, what you do, and what you hope to achieve with fan creations..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="howHeard"
          render={({ field }) => (
            <FormItem>
              <FormLabel>How did you hear about us?</FormLabel>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="grid grid-cols-2 sm:grid-cols-3 gap-4"
              >
                {['search', 'social', 'referral', 'event', 'article', 'other'].map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`how-heard-${option}`} />
                    <label htmlFor={`how-heard-${option}`} className="capitalize cursor-pointer text-sm">
                      {option}
                    </label>
                  </div>
                ))}
              </RadioGroup>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="acceptTerms"
          render={({ field }) => (
            <FormItem>
              <TermsConsent id="brand-terms" checked={field.value} onCheckedChange={field.onChange}>
                I confirm I am authorized to represent this brand, and I agree to the
              </TermsConsent>
              <FormMessage />
            </FormItem>
          )}
        />

        {serverError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-violet-600 hover:bg-violet-700 h-12 text-lg font-medium"
        >
          {isLoading ? 'Submitting Request...' : 'Submit Brand Verification Request'}
        </Button>
      </form>
    </Form>
  );
}
