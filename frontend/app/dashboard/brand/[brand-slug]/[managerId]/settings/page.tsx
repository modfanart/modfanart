// app/dashboard/brand/[brand-slug]/[brand_manager_id]/settings/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Save, Upload, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast'; // assuming you have shadcn toast

import { DashboardShell } from '@/components/dashboard-shell';

import { useAuth } from '@/store/AuthContext';
import { useUpdateBrandMutation, useGetBrandQuery } from '@/services/api/brands';

export default function BrandSettingsPage() {
  const router = useRouter();
  const { user } = useAuth();

  const brandId = user?.brands?.[0]?.id ?? '';
  const brandSlugFromAuth = user?.brands?.[0]?.slug ?? '';

  const { data: brand, isLoading: isFetching } = useGetBrandQuery(brandId, {
    skip: !brandId,
  });

  const [updateBrand, { isLoading: isSaving }] = useUpdateBrandMutation();

  // Form state
  const [form, setForm] = useState({
    name: '',
    description: '',
    website: '',
    logo_url: '',
    banner_url: '',
    social_links: {} as Record<string, string>,
    status: 'active',
  });

  // File previews (for logo/banner upload)
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  // Load existing data
  useEffect(() => {
    if (brand) {
      setForm({
        name: brand.name || '',
        description: brand.description || '',
        website: brand.website || '',
        logo_url: brand.logo_url || '',
        banner_url: brand.banner_url || '',
        social_links: brand.social_links || {},
        status: brand.status || 'active',
      });
      setLogoPreview(brand.logo_url || null);
      setBannerPreview(brand.banner_url || null);
    }
  }, [brand]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSocialChange = (platform: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      social_links: { ...prev.social_links, [platform]: value },
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side preview
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'logo') setLogoPreview(reader.result as string);
      else setBannerPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // In real app: upload file to your storage (S3, Supabase, etc.) and get URL
    // For now we just set preview — you should replace with actual upload logic
    toast({
      title: 'File selected',
      description: `Remember to implement actual upload for ${type}.`,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast({ variant: 'destructive', title: 'Name is required' });
      return;
    }

    try {
      await updateBrand({
        id: brandId,
        data: {
          name: form.name,
          description: form.description,
          website: form.website,
          logo_url: form.logo_url, // in real app: uploaded URL
          banner_url: form.banner_url, // in real app: uploaded URL
          social_links: form.social_links,
          // status: form.status,      // only allow if role permits
        },
      }).unwrap();

      toast({ title: 'Settings saved successfully' });
      router.refresh(); // or redirect
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to save',
        description: err?.data?.error || 'Something went wrong',
      });
    }
  };

  if (isFetching) {
    return (
      <DashboardShell>
        <div className="container py-12 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardShell>
    );
  }

  if (!brand) {
    return (
      <DashboardShell>
        <div className="container py-16 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <h2 className="mt-4 text-2xl font-semibold">Brand not found</h2>
          <Button className="mt-6" asChild>
            <Link href="/dashboard/brand">Back to Brands</Link>
          </Button>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="container py-8 max-w-4xl space-y-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Brand Settings</h1>
          <p className="text-muted-foreground mt-1">
            Update your brand profile, visuals, and links.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Your brand name and description appear on public profile.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Brand Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  placeholder="e.g. My Awesome Brand"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Brand Slug (URL-friendly ID)</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">/brand/</span>
                  <Input value={brandSlugFromAuth} disabled className="bg-muted" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Slug is generated from name and cannot be changed easily.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  placeholder="Tell the world about your brand..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Visuals */}
          <Card>
            <CardHeader>
              <CardTitle>Brand Visuals</CardTitle>
              <CardDescription>
                Upload logo and banner to make your profile stand out.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Logo */}
              <div className="space-y-4">
                <Label>Logo</Label>
                <div className="flex items-start gap-6">
                  <div className="shrink-0">
                    <div className="h-24 w-24 rounded-full border overflow-hidden bg-muted relative">
                      {logoPreview ? (
                        <Image src={logoPreview} alt="Logo preview" fill className="object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                          Logo
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'logo')}
                    />
                    <p className="text-sm text-muted-foreground">
                      Recommended: 512×512 PNG or JPG, transparent background preferred.
                    </p>
                  </div>
                </div>
              </div>

              {/* Banner */}
              <div className="space-y-4">
                <Label>Banner</Label>
                <div className="space-y-2">
                  <div className="h-48 w-full rounded-lg border overflow-hidden bg-muted relative">
                    {bannerPreview ? (
                      <Image
                        src={bannerPreview}
                        alt="Banner preview"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                        Banner (recommended 1200×400)
                      </div>
                    )}
                  </div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'banner')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Links */}
          <Card>
            <CardHeader>
              <CardTitle>Links & Socials</CardTitle>
              <CardDescription>Add your website and social media profiles.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  value={form.website}
                  onChange={handleInputChange}
                  placeholder="https://yourbrand.com"
                />
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {['twitter', 'instagram', 'facebook', 'youtube', 'tiktok', 'discord'].map(
                  (platform) => (
                    <div key={platform} className="space-y-2">
                      <Label htmlFor={platform} className="capitalize">
                        {platform}
                      </Label>
                      <Input
                        id={platform}
                        value={form.social_links[platform] || ''}
                        onChange={(e) => handleSocialChange(platform, e.target.value)}
                        placeholder={`https://${platform}.com/yourhandle`}
                      />
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {/* Status (optional – only show if role allows) */}
          {/* <Card>
            <CardHeader>
              <CardTitle>Brand Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Switch
                  checked={form.status === 'active'}
                  onCheckedChange={checked => setForm(prev => ({ ...prev, status: checked ? 'active' : 'inactive' }))}
                />
                <div>
                  <p className="font-medium">Active</p>
                  <p className="text-sm text-muted-foreground">
                    When inactive, brand profile is hidden from public
                  </p>
                </div>
              </div>
            </CardContent>
          </Card> */}

          {/* Submit */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving || !brandId}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}
