// app/brand/create/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { useAdminCreateBrandMutation } from '@/services/api/brands'; // ← adjust if your mutation name is adminCreateBrand
import { useToast } from '@/components/ui/use-toast';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Building2, AlertCircle } from 'lucide-react';
import { DashboardShell } from '@/components/dashboard-shell';
import { useAuth } from '@/store/AuthContext';
// ── Validation Schema ────────────────────────────────────────────────
const formSchema = z.object({
  name: z.string().min(3, 'Brand name must be at least 3 characters').max(60),
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(40)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Only lowercase letters, numbers and hyphens'),
  description: z.string().max(500).optional(),
  website: z.string().url({ message: 'Please enter a valid URL' }).or(z.literal('')).optional(),
  // You can add more fields later (social links, industry, etc.)
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateBrandPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [createBrand, { isLoading }] = useAdminCreateBrandMutation(); // or useAdminCreateBrandMutation
  const { user: currentUser } = useAuth(); // ← get logged-in admin

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      website: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!currentUser) {
      toast({
        variant: 'destructive',
        title: 'Not authenticated',
        description: 'You must be logged in as an admin to create a brand.',
      });
      return;
    }

    try {
      const payload = {
        name: values.name,
        slug: values.slug,
        description: values.description || null,
        website: values.website || null,
        status: 'pending',
        user_id: currentUser.id, // ← required and must match DB column
        logo_url: null,
        banner_url: null,
        social_links: null,
        followers_count: 0, // optional, default to 0
        verification_request_id: null, // optional
      };

      const created = await createBrand(payload).unwrap();

      toast({
        title: 'Brand created!',
        description: `${created.name} has been successfully created.`,
      });

      router.push(`/brand/${created.id}/edit`);
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to create brand',
        description: err?.data?.message || 'Something went wrong. Please try again.',
      });
    }
  };

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    if (!form.getFieldState('slug').isTouched) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      form.setValue('slug', slug, { shouldValidate: true });
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-3xl">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl">Create Your Brand</CardTitle>
              <CardDescription>
                Set up your brand profile to showcase artworks, run contests, and connect with
                creators.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. NeonVibe Studio"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          handleNameChange(e);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      This is how your brand will appear across the platform.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand Slug (URL-friendly) *</FormLabel>
                    <FormControl>
                      <div className="flex items-center border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-ring">
                        <div className="bg-muted px-3 py-2 text-muted-foreground">brand/</div>
                        <Input
                          className="border-0 focus-visible:ring-0"
                          placeholder="neonvibe-studio"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Used in your brand URL: brand.yourdomain.com/{field.value || 'slug'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell creators and users about your brand, what kind of art you love, your vision..."
                        className="min-h-[120px]"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormDescription>Max 500 characters</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Official Website</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://www.yourbrand.com"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* You can add more fields here later:
                  - Industry / Category picker
                  - Social links (Twitter, Instagram, etc.)
                  - Logo & Banner upload (better done after creation)
              */}

              <div className="flex items-center gap-4 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading}
                >
                  Cancel
                </Button>

                <Button type="submit" disabled={isLoading || !form.formState.isValid}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Brand
                </Button>
              </div>

              {form.formState.isSubmitted && !form.formState.isValid && (
                <div className="flex items-center gap-2 text-sm text-destructive mt-2">
                  <AlertCircle className="h-4 w-4" />
                  Please fix the errors above before submitting.
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
