'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '../../components/layout/Header';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { toast } from 'sonner';

import {
  useAdminCreateBrandMutation,
  useUpdateBrandMutation,
} from '../../services/api/brands';

// -------------------- Section Wrapper --------------------
const Section = ({ title, children }) => (
  <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-4">
    <h3 className="text-sm font-medium text-zinc-300">{title}</h3>
    {children}
  </div>
);

// -------------------- Preview Panel --------------------
const BrandPreview = ({ form }) => {
  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden sticky top-6">
      {form.banner_url ? (
        <img
          src={form.banner_url}
          alt="banner"
          className="h-28 w-full object-cover"
        />
      ) : (
        <div className="h-28 w-full bg-zinc-900" />
      )}

      <div className="p-4 space-y-3">
        {form.logo_url ? (
          <img
            src={form.logo_url}
            alt="logo"
            className="w-12 h-12 rounded-lg object-cover border border-zinc-800"
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-zinc-900 border border-zinc-800" />
        )}

        <div>
          <h3 className="font-semibold text-white">
            {form.name || 'Brand Name'}
          </h3>
          <p className="text-xs text-zinc-500">
            {form.slug || 'slug'}
          </p>
        </div>

        <p className="text-sm text-zinc-400 line-clamp-3">
          {form.description || 'No description yet...'}
        </p>

        <div className="pt-2 text-xs text-zinc-500 space-y-1">
          {form.website && <p>🌐 {form.website}</p>}
          {form.social_links?.twitter && <p>𝕏 {form.social_links.twitter}</p>}
          {form.social_links?.instagram && (
            <p>📸 {form.social_links.instagram}</p>
          )}
          {form.social_links?.youtube && <p>▶ {form.social_links.youtube}</p>}
        </div>
      </div>
    </div>
  );
};

// -------------------- Main Page --------------------
const emptyForm = {
  name: '',
  slug: '',
  description: '',
  logo_url: '',
  banner_url: '',
  website: '',
  status: 'active',
  social_links: {
    twitter: '',
    instagram: '',
    youtube: '',
  },
};

const BrandFormPage = ({ initialData = null, onSuccess }) => {
  const isEdit = !!initialData;

  const [form, setForm] = useState(emptyForm);

  const [createBrand, { isLoading: isCreating }] = useAdminCreateBrandMutation();
  const [updateBrand, { isLoading: isUpdating }] = useUpdateBrandMutation();

  // Fill form when editing
  useEffect(() => {
    if (initialData) {
      setForm({
        ...emptyForm,
        ...initialData,
        social_links: {
          twitter: initialData.social_links?.twitter || '',
          instagram: initialData.social_links?.instagram || '',
          youtube: initialData.social_links?.youtube || '',
        },
      });
    }
  }, [initialData]);

  // Auto-generate slug
  useEffect(() => {
    if (form.name && !isEdit) {
      const generatedSlug = form.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setForm((prev) => ({ ...prev, slug: generatedSlug }));
    }
  }, [form.name, isEdit]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSocialChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      social_links: { ...prev.social_links, [key]: value },
    }));
  };

  // ==================== SUBMIT HANDLER WITH BETTER ERROR CATCHING ====================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = { 
        ...form,
        // TODO: Add user_id from your auth context if needed
        // user_id: user?.id 
      };

      if (isEdit) {
        await updateBrand({ 
          id: initialData.id, 
          data: payload 
        }).unwrap();

        toast.success('Brand updated successfully');
      } else {
        await createBrand(payload).unwrap();
        toast.success('Brand created successfully');
      }

      onSuccess?.();
    } catch (err) {
      console.error('Brand API Error:', err);

      let errorMessage = 'Something went wrong';

      // Handle different error formats from RTK Query
      if (err?.data?.message) {
        errorMessage = err.data.message;
      } else if (err?.data?.error) {
        errorMessage = err.data.error;
      } else if (err?.data?.details) {
        errorMessage = Array.isArray(err.data.details) 
          ? err.data.details.join(', ') 
          : err.data.details;
      } else if (err?.status === 400) {
        errorMessage = 'Missing required fields (most likely user_id)';
      } else if (err?.message) {
        errorMessage = err.message;
      }

      toast.error(errorMessage, {
        description: isEdit ? 'Failed to update brand' : 'Failed to create brand',
        duration: 7000,
      });
    }
  };

  const isLoading = isCreating || isUpdating;

  return (
    <div className="min-h-screen">
      <Header
        title={isEdit ? 'Edit Brand' : 'Create Brand'}
        subtitle={
          isEdit 
            ? `Editing ${initialData?.name || ''}` 
            : 'Add a new brand to the platform'
        }
      />

      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* FORM */}
            <div className="lg:col-span-2 space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* BRAND IDENTITY */}
                <Section title="Brand Identity">
                  <div>
                    <label className="text-xs text-zinc-500 block mb-1">
                      Brand Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={form.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className="bg-zinc-900 border-zinc-800"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs text-zinc-500 block mb-1">
                      Slug <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={form.slug}
                      onChange={(e) => handleChange('slug', e.target.value)}
                      className="bg-zinc-900 border-zinc-800"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs text-zinc-500 block mb-1">Description</label>
                    <Textarea
                      value={form.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      className="bg-zinc-900 border-zinc-800"
                      rows={4}
                    />
                  </div>
                </Section>

                {/* MEDIA ASSETS */}
                <Section title="Media Assets">
                  <div>
                    <label className="text-xs text-zinc-500 block mb-1">Logo URL</label>
                    <Input
                      placeholder="https://..."
                      value={form.logo_url}
                      onChange={(e) => handleChange('logo_url', e.target.value)}
                      className="bg-zinc-900 border-zinc-800"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-zinc-500 block mb-1">Banner URL</label>
                    <Input
                      placeholder="https://..."
                      value={form.banner_url}
                      onChange={(e) => handleChange('banner_url', e.target.value)}
                      className="bg-zinc-900 border-zinc-800"
                    />
                  </div>
                </Section>

                {/* WEBSITE & SOCIAL LINKS */}
                <Section title="Website & Social Links">
                  <div>
                    <label className="text-xs text-zinc-500 block mb-1">Website</label>
                    <Input
                      placeholder="https://example.com"
                      value={form.website}
                      onChange={(e) => handleChange('website', e.target.value)}
                      className="bg-zinc-900 border-zinc-800"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-zinc-500 block mb-1">Twitter / X</label>
                    <Input
                      placeholder="https://x.com/..."
                      value={form.social_links.twitter}
                      onChange={(e) => handleSocialChange('twitter', e.target.value)}
                      className="bg-zinc-900 border-zinc-800"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-zinc-500 block mb-1">Instagram</label>
                    <Input
                      placeholder="https://instagram.com/..."
                      value={form.social_links.instagram}
                      onChange={(e) => handleSocialChange('instagram', e.target.value)}
                      className="bg-zinc-900 border-zinc-800"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-zinc-500 block mb-1">YouTube</label>
                    <Input
                      placeholder="https://youtube.com/..."
                      value={form.social_links.youtube}
                      onChange={(e) => handleSocialChange('youtube', e.target.value)}
                      className="bg-zinc-900 border-zinc-800"
                    />
                  </div>
                </Section>

                {/* STATUS */}
                <Section title="Status">
                  <select
                    value={form.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white"
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="suspended">Suspended</option>
                    <option value="deactivated">Deactivated</option>
                  </select>
                </Section>

                {/* SUBMIT BUTTON */}
                <div className="sticky bottom-6 bg-zinc-950 border border-zinc-800 p-4 rounded-xl flex justify-end">
                  <Button type="submit" disabled={isLoading} size="lg">
                    {isLoading
                      ? 'Saving...'
                      : isEdit
                      ? 'Update Brand'
                      : 'Create Brand'}
                  </Button>
                </div>
              </form>
            </div>

            {/* PREVIEW */}
            <div className="lg:col-span-1">
              <BrandPreview form={form} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandFormPage;