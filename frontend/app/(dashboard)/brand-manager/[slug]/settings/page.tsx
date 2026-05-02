'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { Save, Loader2, AlertCircle, Upload, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/store/AuthContext';
import { useUpdateBrandMutation } from '@/services/api/brands';
import { Loader } from 'lucide-react';
type Tab = 'general' | 'media' | 'social' | 'status';

export default function BrandSettingsPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading } = useAuth();
  const brandId = params['slug'] as string;
  const brand = user?.brands?.find((b) => b.id === brandId) ?? null;

  if (loading || !brand) return <Loader />;

  // everything below = safe zone
  const status = brand.status ?? 'pending';
  const [updateBrand, { isLoading: isSaving }] = useUpdateBrandMutation();
  const [activeTab, setActiveTab] = useState<Tab>('general');

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    website: '',
    logo_url: '',
    banner_url: '',
    social_links: {} as Record<string, string>,
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  useEffect(() => {
    if (!brand) return;

    setForm({
      name: brand.name || '',
      slug: brand.slug || brandId,
      description: brand.description || '',
      website: brand.website || '',
      logo_url: brand.logo_url || '',
      banner_url: brand.banner_url || '',
      social_links: brand.social_links || {},
    });

    setLogoPreview(brand.logo_url || null);
    setBannerPreview(brand.banner_url || null);
  }, [brand, brandId]);

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

    if (!file.type.startsWith('image/')) {
      toast({ variant: 'destructive', title: 'Only image files are allowed' });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'logo') {
        setLogoPreview(reader.result as string);
        setLogoFile(file);
      } else {
        setBannerPreview(reader.result as string);
        setBannerFile(file);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (type: 'logo' | 'banner') => {
    if (type === 'logo') {
      setLogoPreview(null);
      setLogoFile(null);
      setForm((prev) => ({ ...prev, logo_url: '' }));
    } else {
      setBannerPreview(null);
      setBannerFile(null);
      setForm((prev) => ({ ...prev, banner_url: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandId) return;

    try {
      await updateBrand({
        id: brandId,
        data: {
          name: form.name,
          slug: form.slug,
          description: form.description,
          website: form.website,
          social_links: form.social_links,
          // logo_url & banner_url will be handled separately if uploading files
        },
      }).unwrap();

      toast({ title: 'Brand updated successfully' });
      router.refresh();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: err?.data?.error || 'Something went wrong',
      });
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'media', label: 'Media', icon: '🖼️' },
    { id: 'social', label: 'Social Links', icon: '🔗' },
    { id: 'status', label: 'Status', icon: '📊' },
  ] as const;

  if (loading || !brand) {
    return (
      <div className="container py-16 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Brand Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your brand profile</p>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b mb-8">
        <div className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 text-sm font-medium transition-colors flex items-center gap-2 border-b-2 -mb-px
                ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* ==================== GENERAL TAB ==================== */}
        {activeTab === 'general' && (
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
              <CardDescription>Basic details about your brand</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Brand Name</Label>
                  <Input name="name" value={form.name} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 border border-r-0 rounded-l-md text-muted-foreground">
                      /brand/
                    </span>
                    <Input name="slug" value={form.slug} onChange={handleInputChange} />
                  </div>
                  <p className="text-xs text-amber-600">Changing slug may break existing links.</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  name="description"
                  rows={5}
                  value={form.description}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label>Website</Label>
                <Input
                  name="website"
                  type="url"
                  value={form.website}
                  onChange={handleInputChange}
                  placeholder="https://"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* ==================== MEDIA TAB ==================== */}
        {activeTab === 'media' && (
          <Card>
            <CardHeader>
              <CardTitle>Brand Media</CardTitle>
              <CardDescription>Logo and banner images</CardDescription>
            </CardHeader>
            <CardContent className="space-y-10">
              {/* Logo */}
              <div className="space-y-4">
                <Label>Brand Logo</Label>
                <div className="flex items-center gap-6">
                  <div className="w-28 h-28 border rounded-2xl overflow-hidden bg-muted relative">
                    {logoPreview ? (
                      <Image src={logoPreview} alt="Logo" fill className="object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        No logo
                      </div>
                    )}
                  </div>
                  <div className="space-x-3">
                    <label htmlFor="logo-upload">
                      <Button type="button" variant="outline" asChild>
                        <span>
                          <Upload className="mr-2 h-4 w-4" /> Upload Logo
                        </span>
                      </Button>
                    </label>
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, 'logo')}
                    />
                    {logoPreview && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => removeImage('logo')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Banner */}
              <div className="space-y-4">
                <Label>Banner Image</Label>
                <div className="border rounded-2xl overflow-hidden h-56 bg-muted relative">
                  {bannerPreview ? (
                    <Image src={bannerPreview} alt="Banner" fill className="object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No banner uploaded
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  <label htmlFor="banner-upload">
                    <Button type="button" variant="outline" asChild>
                      <span>
                        <Upload className="mr-2 h-4 w-4" /> Upload Banner
                      </span>
                    </Button>
                  </label>
                  <input
                    id="banner-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, 'banner')}
                  />
                  {bannerPreview && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => removeImage('banner')}
                    >
                      Remove Banner
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ==================== SOCIAL TAB ==================== */}
        {activeTab === 'social' && (
          <Card>
            <CardHeader>
              <CardTitle>Social Links</CardTitle>
              <CardDescription>Connect your social media profiles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  'twitter',
                  'instagram',
                  'facebook',
                  'youtube',
                  'tiktok',
                  'discord',
                  'linkedin',
                  'threads',
                ].map((platform) => (
                  <div key={platform} className="space-y-2">
                    <Label className="capitalize">{platform}</Label>
                    <Input
                      placeholder={`https://${platform}.com/...`}
                      value={form.social_links[platform] || ''}
                      onChange={(e) => handleSocialChange(platform, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ==================== STATUS TAB ==================== */}
        {activeTab === 'status' && (
          <Card>
            <CardHeader>
              <CardTitle>Status & Verification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-center p-6 border rounded-xl">
                <div>
                  <p className="font-semibold">Current Status</p>
                </div>

                <div
                  className={`px-5 py-2 rounded-full text-sm font-semibold ${
                    status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {status.toUpperCase()}
                </div>
              </div>

              {brand.verification_request_id && (
                <div className="p-6 border border-blue-200 bg-blue-50 rounded-xl">
                  <p className="font-semibold text-blue-700">Verification Requested</p>
                  <p className="text-blue-600 mt-2">
                    Your brand verification is currently under review.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Save Button - Sticky at bottom */}
        <div className="flex justify-end gap-4 pt-8 border-t mt-10">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving} size="lg">
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="mr-2 h-5 w-5" />
                Save All Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
