'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

import { Save, Loader2, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';

import { DashboardShell } from '@/components/dashboard-shell';

import { useAuth } from '@/store/AuthContext';
import { useUpdateBrandMutation } from '@/services/api/brands';

export default function BrandSettingsPage() {
  const router = useRouter();
  const params = useParams();

  const { user, loading } = useAuth();

  const brandSlug = params['brand-slug'] as string;

  const brand = user?.brands?.find((b) => b.slug === brandSlug) ?? null;

  const brandId = brand?.id;

  const [updateBrand, { isLoading: isSaving }] = useUpdateBrandMutation();

  const [form, setForm] = useState({
    name: '',
    description: '',
    website: '',
    logo_url: '',
    banner_url: '',
    social_links: {} as Record<string, string>,
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!brand) return;

    setForm({
      name: brand.name || '',
      description: brand.description || '',
      website: brand.website || '',
      logo_url: brand.logo_url || '',
      banner_url: brand.banner_url || '',
      social_links: brand.social_links || {},
    });

    setLogoPreview(brand.logo_url || null);
    setBannerPreview(brand.banner_url || null);
  }, [brand]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSocialChange = (platform: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [platform]: value,
      },
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      if (type === 'logo') setLogoPreview(reader.result as string);
      else setBannerPreview(reader.result as string);
    };

    reader.readAsDataURL(file);

    toast({
      title: 'File selected',
      description: `Upload logic required for ${type}`,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!brandId) {
      toast({
        variant: 'destructive',
        title: 'Brand not found',
      });
      return;
    }

    try {
      await updateBrand({
        id: brandId,
        data: {
          name: form.name,
          description: form.description,
          website: form.website,
          logo_url: form.logo_url,
          banner_url: form.banner_url,
          social_links: form.social_links,
        },
      }).unwrap();

      toast({
        title: 'Brand updated',
      });

      router.refresh();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: err?.data?.error || 'Server error',
      });
    }
  };

  if (loading) {
    return (
      <div className="container py-16 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="container py-16 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
        <h2 className="mt-4 text-2xl font-semibold">Brand not found</h2>

        <Button className="mt-6" asChild>
          <Link href="/dashboard/brand">Back</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-4xl space-y-10">
      <div>
        <h1 className="text-3xl font-bold">Brand Settings</h1>
        <p className="text-muted-foreground mt-1">Update brand profile and links</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Name and description shown publicly</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Brand Name</Label>
              <Input name="name" value={form.name} onChange={handleInputChange} required />
            </div>

            <div className="space-y-2">
              <Label>Slug</Label>

              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">/brand/</span>

                <Input value={brandSlug} disabled />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>

              <Textarea
                name="description"
                rows={4}
                value={form.description}
                onChange={handleInputChange}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Links</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Website</Label>

              <Input name="website" value={form.website} onChange={handleInputChange} />
            </div>

            <Separator />

            <div className="grid md:grid-cols-2 gap-6">
              {['twitter', 'instagram', 'facebook', 'youtube', 'tiktok', 'discord'].map(
                (platform) => (
                  <div key={platform} className="space-y-2">
                    <Label className="capitalize">{platform}</Label>

                    <Input
                      value={form.social_links[platform] || ''}
                      onChange={(e) => handleSocialChange(platform, e.target.value)}
                    />
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 pt-6 border-t">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>

          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving
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
  );
}
