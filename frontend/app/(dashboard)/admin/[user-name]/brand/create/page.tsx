'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { useAdminCreateBrandMutation } from '@/services/api/brands';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/store/AuthContext';

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Building2, Upload, Save, Globe, AlertCircle } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(3, 'Brand name must be at least 3 characters').max(60),
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(40)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Only lowercase letters, numbers and hyphens'),
  description: z.string().max(1000).optional(),
  website: z.string().url({ message: 'Please enter a valid URL' }).or(z.literal('')).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateBrandPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  const [createBrand, { isLoading: isCreating }] = useAdminCreateBrandMutation();

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      website: '',
    },
    mode: 'onChange',
  });

  const onSubmit = async (values: FormValues) => {
    if (!currentUser) {
      toast({
        variant: 'destructive',
        title: 'Authentication required',
        description: 'You must be logged in to create a brand.',
      });
      return;
    }

    try {
      const payload = {
        name: values.name,
        slug: values.slug,
        description: values.description?.trim() || null,
        website: values.website?.trim() || null,
        status: 'pending' as const,
        user_id: currentUser.id,
        logo_url: null,        // Will be updated after creation if needed
        banner_url: null,
        social_links: null,
        followers_count: 0,
        verification_request_id: null,
      };

      const created = await createBrand(payload).unwrap();

      toast({
        title: 'Brand created successfully!',
        description: 'Redirecting to full editor where you can upload logo & banner...',
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
    const nameValue = e.target.value;
    form.setValue('name', nameValue, { shouldValidate: true });

    if (!form.getFieldState('slug').isTouched || !form.getValues('slug')) {
      const generatedSlug = nameValue
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      form.setValue('slug', generatedSlug, { shouldValidate: true });
    }
  };

  // File handlers (preview only - actual upload happens in edit page)
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLogoPreview(url);
      toast({ title: 'Logo selected', description: 'It will be uploaded after brand creation.' });
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setBannerPreview(url);
      toast({ title: 'Banner selected', description: 'It will be uploaded after brand creation.' });
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Create New Brand</h1>
          <p className="text-muted-foreground mt-1">
            Set up your brand profile with all the details and visuals
          </p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-8">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="visuals">Visuals</TabsTrigger>
          <TabsTrigger value="links">Links & Social</TabsTrigger>
        </TabsList>

        {/* PROFILE TAB */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Brand Information</CardTitle>
              <CardDescription>Basic details that appear on your brand page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Form {...form}>
                <form className="space-y-6">
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
                        <FormLabel>Slug (URL identifier) *</FormLabel>
                        <FormControl>
                          <div className="flex items-center border rounded-md focus-within:ring-2 focus-within:ring-ring">
                            <div className="bg-muted px-3 py-2 text-muted-foreground">brand/</div>
                            <Input className="border-0 focus-visible:ring-0" {...field} />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Your brand URL will be: brand.yourdomain.com/{field.value || 'slug'}
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
                            className="min-h-[140px]"
                            placeholder="Tell the community about your brand, your vision, what kind of creators and art you support..."
                            {...field}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormDescription>Recommended: 100–300 characters</FormDescription>
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
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* VISUALS TAB */}
        <TabsContent value="visuals">
          <Card>
            <CardHeader>
              <CardTitle>Brand Visuals</CardTitle>
              <CardDescription>
                Upload logo and banner. These will be saved after brand creation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Logo */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Logo</h3>
                    <p className="text-sm text-muted-foreground">
                      Recommended: 512×512px, transparent background
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="h-32 w-32 rounded-full border-2 border-dashed border-muted-foreground/50 flex items-center justify-center overflow-hidden bg-muted">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Building2 className="h-12 w-12 text-muted-foreground/40" />
                    )}
                  </div>

                  <div>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      id="logo-upload"
                      onChange={handleLogoChange}
                    />
                    <Button variant="outline" asChild>
                      <label htmlFor="logo-upload" className="cursor-pointer">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Logo
                      </label>
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">Max 5MB • PNG, JPG, WebP</p>
                  </div>
                </div>
              </div>

              {/* Banner */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Banner / Cover Image</h3>
                    <p className="text-sm text-muted-foreground">
                      Recommended: 1600×400px or wider
                    </p>
                  </div>
                </div>

                <div className="border-2 border-dashed border-muted-foreground/50 rounded-lg overflow-hidden bg-muted aspect-[4/1] max-h-64 relative">
                  {bannerPreview ? (
                    <img
                      src={bannerPreview}
                      alt="Banner preview"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center flex-col gap-2 text-muted-foreground">
                      <Building2 className="h-12 w-12 opacity-40" />
                      <span>No banner uploaded yet</span>
                    </div>
                  )}
                </div>

                <div>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    id="banner-upload"
                    onChange={handleBannerChange}
                  />
                  <Button variant="outline" asChild>
                    <label htmlFor="banner-upload" className="cursor-pointer">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Banner
                    </label>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* LINKS TAB */}
        <TabsContent value="links">
          <Card>
            <CardHeader>
              <CardTitle>Social Links & Website</CardTitle>
              <CardDescription>Help users find you on other platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <Form {...form}>
                      <FormField
                        control={form.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem className="space-y-0">
                            <FormLabel className="sr-only">Website</FormLabel>
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
                    </Form>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground italic pt-4 border-t">
                  More social links (Twitter, Instagram, LinkedIn, etc.) will be available after
                  brand creation in the edit page.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 mt-10">
        <Button variant="outline" onClick={() => router.back()} disabled={isCreating}>
          Cancel
        </Button>
        <Button
          onClick={form.handleSubmit(onSubmit)}
          disabled={isCreating || !form.formState.isValid}
          size="lg"
        >
          {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" />
          Create Brand
        </Button>
      </div>

      {form.formState.isSubmitted && !form.formState.isValid && (
        <div className="flex items-center gap-2 text-sm text-destructive mt-4 justify-center">
          <AlertCircle className="h-4 w-4" />
          Please fix the errors above before creating the brand.
        </div>
      )}
    </div>
  );
}