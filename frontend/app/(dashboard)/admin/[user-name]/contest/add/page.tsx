'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { ArrowLeft, Trophy } from 'lucide-react';

import { useCreateContestMutation } from '@/services/api/contestsApi';
import { useGetAllBrandsQuery } from '@/services/api/brands';

import { SingleDatePicker } from '@/components/ui/single-date-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

/* ───────────────── TYPES ───────────────── */

type Visibility = 'public' | 'private' | 'unlisted';
type Status = 'draft' | 'published' | 'live' | 'judging' | 'completed' | 'archived';

export interface CreateContestRequest {
  brand_id: string;
  title: string;
  slug: string;
  description: string;

  hero_image?: string | null;
  gallery?: string[];

  rules?: string | null;
  prizes?: Array<{
    rank: number;
    type: string;
    description?: string;
    amount_inr?: number;
  }> | null;

  start_date: string;
  submission_end_date: string;
  voting_end_date?: string | null;
  judging_end_date?: string | null;

  entry_requirements?: Record<string, any> | null;
  categories?: string[];

  visibility: Visibility;
  status: Status;

  max_entries_per_user?: number;
}

/* ───────────────── HELPERS ───────────────── */

const toISODate = (date: Date): string => {
  return date.toISOString().split('T')[0] ?? '';
};
const generateSlug = (title: string): string =>
  title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

/* ───────────────── PAGE ───────────────── */

export default function CreateOpportunityPage() {
  const router = useRouter();

  const { data, isLoading: brandsLoading } = useGetAllBrandsQuery({});
  const brands = data?.brands ?? [];

  const [createContest, { isLoading }] = useCreateContestMutation();

  /* ───────────────── FORM STATE ───────────────── */

  const [form, setForm] = useState<CreateContestRequest>({
    brand_id: '',
    title: '',
    slug: '',
    description: '',

    hero_image: '',
    gallery: [],

    rules: null,
    prizes: null,

    start_date: '',
    submission_end_date: '',
    voting_end_date: null,
    judging_end_date: null,

    entry_requirements: null,
    categories: [],

    visibility: 'public',
    status: 'draft',

    max_entries_per_user: 3,
  });

  const [formError, setFormError] = useState<string | null>(null);

  /* ───────────────── HELPERS ───────────────── */

  const updateField = <K extends keyof CreateContestRequest>(
    key: K,
    value: CreateContestRequest[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  /* ───────────────── AUTO BRAND ───────────────── */

  useEffect(() => {
    if (brands.length === 1 && !form.brand_id) {
      const brand = brands[0];
      if (brand) updateField('brand_id', brand.id);
    }
  }, [brands, form.brand_id]);

  /* ───────────────── AUTO SLUG ───────────────── */

  useEffect(() => {
    if (form.title && !form.slug) {
      updateField('slug', generateSlug(form.title));
    }
  }, [form.title, form.slug]);

  /* ───────────────── SUBMIT ───────────────── */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!form.brand_id) return setFormError('Please select a brand');

    if (
      !form.title ||
      !form.slug ||
      !form.description ||
      !form.hero_image ||
      !form.start_date ||
      !form.submission_end_date
    ) {
      return setFormError('Please fill all required fields');
    }

    try {
      await createContest(form).unwrap();
      router.push('/dashboard/opportunities');
    } catch (err: any) {
      setFormError(err?.data?.message || 'Failed to create contest');
    }
  };

  /* ───────────────── UI ───────────────── */

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/opportunities">
          <Button variant="ghost" size="icon">
            <ArrowLeft />
          </Button>
        </Link>

        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Trophy className="h-6 w-6 text-primary" />
          Create Opportunity
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardContent className="space-y-6 pt-6">
            {/* BRAND */}
            <div>
              <Label>Select Brand *</Label>
              <select
                value={form.brand_id}
                onChange={(e) => updateField('brand_id', e.target.value)}
                className="w-full border rounded-md p-2"
              >
                <option value="">{brandsLoading ? 'Loading...' : 'Select a brand'}</option>

                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* BASIC */}
            <Input
              placeholder="Title *"
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
            />

            <Input
              placeholder="Slug *"
              value={form.slug}
              onChange={(e) => updateField('slug', e.target.value)}
            />

            <Textarea
              placeholder="Description *"
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
            />

            {/* MEDIA */}
            <Input
              placeholder="Hero Image URL *"
              value={form.hero_image || ''}
              onChange={(e) => updateField('hero_image', e.target.value)}
            />

            <Input
              placeholder="Gallery URLs (comma separated)"
              onChange={(e) =>
                updateField(
                  'gallery',
                  e.target.value
                    .split(',')
                    .map((g) => g.trim())
                    .filter(Boolean)
                )
              }
            />

            {/* DATES */}
            <SingleDatePicker
              onDateChange={(d) => {
                if (!d) return;
                updateField('start_date', toISODate(d));
              }}
            />

            <SingleDatePicker
              onDateChange={(d) => {
                if (!d) return;
                updateField('submission_end_date', toISODate(d));
              }}
            />

            <SingleDatePicker
              onDateChange={(d) => updateField('voting_end_date', d ? toISODate(d) : null)}
            />

            <SingleDatePicker
              onDateChange={(d) => updateField('judging_end_date', d ? toISODate(d) : null)}
            />

            {/* RULES */}
            <Textarea
              placeholder="Rules"
              onChange={(e) => updateField('rules', e.target.value || null)}
            />

            <Textarea
              placeholder="Entry Requirements"
              onChange={(e) =>
                updateField('entry_requirements', {
                  instructions: e.target.value,
                })
              }
            />

            {/* CATEGORIES */}
            <Input
              placeholder="Categories (comma separated)"
              onChange={(e) =>
                updateField(
                  'categories',
                  e.target.value
                    .split(',')
                    .map((c) => c.trim())
                    .filter(Boolean)
                )
              }
            />

            {/* PRIZE */}
            <Textarea
              placeholder="Prize Details"
              onChange={(e) =>
                updateField(
                  'prizes',
                  e.target.value
                    ? [
                        {
                          rank: 1,
                          type: 'custom',
                          description: e.target.value,
                        },
                      ]
                    : null
                )
              }
            />

            {/* ERROR */}
            {formError && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            {/* ACTIONS */}
            <div className="flex justify-end gap-3">
              <Button type="button" onClick={() => router.back()}>
                Cancel
              </Button>

              <Button type="submit" disabled={isLoading || !form.brand_id}>
                {isLoading ? 'Creating...' : 'Create Contest'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
