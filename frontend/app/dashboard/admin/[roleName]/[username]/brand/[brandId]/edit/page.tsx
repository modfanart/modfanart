// app/brand/[brandId]/edit/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { useGetBrandQuery, useUpdateBrandMutation } from '@/services/api/brands';

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Save, Building2, Upload, X, Globe, Trash2 } from 'lucide-react';
import { DashboardShell } from '@/components/dashboard-shell';

// ── Validation Schema ────────────────────────────────────────────────
const formSchema = z.object({
  name: z.string().min(3).max(60),
  slug: z
    .string()
    .min(3)
    .max(40)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Only lowercase letters, numbers and hyphens'),
  description: z.string().max(1000).optional(),
  website: z.string().url().or(z.literal('')).optional(),
  // social_links: z.record(z.string().url().or(z.literal(''))).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditBrandPage() {
  const { brandId } = useParams<{ brandId: string }>();
  const router = useRouter();
  const { toast } = useToast();

  const { data: brand, isLoading: isLoadingBrand } = useGetBrandQuery(brandId);
  const [updateBrand, { isLoading: isUpdating }] = useUpdateBrandMutation();

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
  });

  // Fill form when brand data loads
  useEffect(() => {
    if (brand) {
      form.reset({
        name: brand.name || '',
        slug: brand.slug || '',
        description: brand.description || '',
        website: brand.website || '',
      });
      setLogoPreview(brand.logo_url || null);
      setBannerPreview(brand.banner_url || null);
    }
  }, [brand, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      await updateBrand({
        id: brandId,
        data: values,
      }).unwrap();

      toast({
        title: 'Brand updated',
        description: 'Your brand profile has been successfully updated.',
      });

      // Optional: redirect to stats or profile
      // router.push(`/brand/${brandId}/stats`);
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: err?.data?.message || 'Something went wrong. Please try again.',
      });
    }
  };

  // ── File Upload Handlers (placeholder - implement actual upload logic) ──
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLogoPreview(url);
      // TODO: upload file to server → get new URL → call updateBrand({ logo_url: newUrl })
      toast({ title: 'Logo selected', description: 'Upload will be implemented next.' });
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setBannerPreview(url);
      // TODO: same as above for banner
      toast({ title: 'Banner selected', description: 'Upload will be implemented next.' });
    }
  };

  const removeLogo = () => {
    setLogoPreview(null);
    // TODO: call updateBrand({ logo_url: null })
  };

  const removeBanner = () => {
    setBannerPreview(null);
    // TODO: call updateBrand({ banner_url: null })
  };

  if (isLoadingBrand) {
    return (
      <div className="container mx-auto py-10 px-4">
        <Skeleton className="h-64 w-full rounded-xl mb-8" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-96 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="container mx-auto py-20 text-center">
        <Building2 className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold">Brand not found</h2>
        <p className="text-muted-foreground mt-2">
          The brand you're trying to edit doesn't exist or you don't have access.
        </p>
        <Button className="mt-6" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <DashboardShell>
      <div className="container mx-auto py-10 px-4 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Edit Brand</h1>
            <p className="text-muted-foreground mt-1">
              Update your brand profile, visuals, and information
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={isUpdating || !form.formState.isDirty}
            >
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-8">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="visuals">Visuals</TabsTrigger>
            <TabsTrigger value="links">Links & Social</TabsTrigger>
            {/* <TabsTrigger value="managers">Managers</TabsTrigger> */}
            {/* <TabsTrigger value="verification">Verification</TabsTrigger> */}
          </TabsList>

          {/* ── PROFILE TAB ──────────────────────────────────────────────── */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Brand Information</CardTitle>
                <CardDescription>Basic details that appear on your brand page</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <Form {...form}>
                    <form className="space-y-6 md:col-span-2">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Brand Name *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
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
                                <div className="bg-muted px-3 py-2 text-muted-foreground">
                                  brand/
                                </div>
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
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── VISUALS TAB ──────────────────────────────────────────────── */}
          <TabsContent value="visuals">
            <Card>
              <CardHeader>
                <CardTitle>Brand Visuals</CardTitle>
                <CardDescription>
                  Upload logo and banner to make your brand stand out
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Logo Upload */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Logo</h3>
                      <p className="text-sm text-muted-foreground">
                        Recommended: 512×512px, transparent background
                      </p>
                    </div>
                    {logoPreview && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={removeLogo}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    )}
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

                {/* Banner Upload */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Banner / Cover Image</h3>
                      <p className="text-sm text-muted-foreground">
                        Recommended: 1600×400px or wider
                      </p>
                    </div>
                    {bannerPreview && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={removeBanner}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    )}
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
                        <span>No banner uploaded</span>
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

          {/* ── LINKS TAB ────────────────────────────────────────────────── */}
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

                  {/* Add more social fields here when you extend the schema */}
                  <p className="text-sm text-muted-foreground italic pt-4 border-t">
                    More social links (Twitter, Instagram, LinkedIn, etc.) will be added in the next
                    update.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Floating save bar when form is dirty */}
        {form.formState.isDirty && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-background border shadow-lg rounded-full px-6 py-3 flex items-center gap-4 z-50">
            <p className="text-sm font-medium">You have unsaved changes</p>
            <Button size="sm" onClick={form.handleSubmit(onSubmit)} disabled={isUpdating}>
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save All Changes
            </Button>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
