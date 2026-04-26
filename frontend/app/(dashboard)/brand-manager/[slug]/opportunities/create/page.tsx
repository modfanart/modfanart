'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/store/AuthContext';
import { ArrowLeft, Trophy, Plus, Trash2 } from 'lucide-react';

import { useCreateContestMutation } from '@/services/api/contestsApi';
import { useGetAllBrandsQuery } from '@/services/api/brands';

import { SingleDatePicker } from '@/components/ui/single-date-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

/* ───────────────── TYPES ───────────────── */

type Visibility = 'public' | 'private' | 'unlisted';
type Status = 'draft' | 'published' | 'live' | 'judging' | 'completed' | 'archived';

interface Prize {
  rank: number;
  type: string;
  description?: string;
  amount_usd?: number;
}

export interface CreateContestRequest {
  brand_id: string;
  title: string;
  slug: string;
  description: string;

  hero_image?: string | null;
  gallery?: string[];

  rules?: string | null;
  prizes?: Prize[] | null;

  start_date: string;
  submission_end_date: string;
  voting_end_date?: string | null;
  judging_end_date?: string | null;

  entry_requirements?: { instructions?: string } | null;
  judging_criteria?: { criteria: string[] } | null;
  categories?: string[];

  visibility: Visibility;
  status: Status;
  max_entries_per_user?: number;
  winner_announced?: boolean;
}

/* ───────────────── HELPERS ───────────────── */

const toISODate = (date: Date | string | null | undefined): string | null => {
  if (!date) return null;
  if (typeof date === 'string') return date.split('T')[0]!;
  return date.toISOString().split('T')[0]!;
};

const generateSlug = (title: string): string =>
  title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

export default function CreateOpportunityPage() {
  const router = useRouter();

  const { user, loading: authLoading } = useAuth();
  const userBrands = user?.brands ?? [];
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
    prizes: [],

    start_date: '',
    submission_end_date: '',
    voting_end_date: null,
    judging_end_date: null,

    entry_requirements: null,
    judging_criteria: { criteria: [] },
    categories: [],

    visibility: 'public',
    status: 'draft',
    max_entries_per_user: 3,
    winner_announced: false,
  });

  const [formError, setFormError] = useState<string | null>(null);

  /* ───────────────── UPDATE HELPERS ───────────────── */

  const updateField = <K extends keyof CreateContestRequest>(
    key: K,
    value: CreateContestRequest[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  /* Prize Management */
  const addPrize = () => {
    updateField('prizes', [
      ...(form.prizes || []),
      { rank: (form.prizes?.length || 0) + 1, type: 'cash', description: '', amount_usd: 0 },
    ]);
  };

  const removePrize = (index: number) => {
    updateField(
      'prizes',
      (form.prizes || []).filter((_, i) => i !== index)
    );
  };

  const updatePrize = <K extends keyof Prize>(index: number, field: K, value: Prize[K]) => {
    const updated = [...(form.prizes || [])];

    updated[index] = {
      ...updated[index],
      [field]: value,
    } as Prize; // ✅ fix

    updateField('prizes', updated);
  };
  /* ───────────────── AUTO FILL ───────────────── */

  useEffect(() => {
    if (userBrands.length > 0 && !form.brand_id) {
      const firstBrand = userBrands[0];
      if (!firstBrand) return;

      updateField('brand_id', firstBrand.id);
    }
  }, [userBrands, form.brand_id]);
  useEffect(() => {
    if (form.title && !form.slug) {
      updateField('slug', generateSlug(form.title));
    }
  }, [form.title]);

  /* ───────────────── SUBMIT ───────────────── */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!form.brand_id) return setFormError('Please select a brand');
    if (!form.title?.trim() || !form.slug?.trim() || !form.description?.trim()) {
      return setFormError('Title, Slug, and Description are required');
    }
    if (!form.start_date || !form.submission_end_date) {
      return setFormError('Start Date and Submission End Date are required');
    }

    try {
      const payload: CreateContestRequest = {
        ...form,
        hero_image: form.hero_image?.trim() || null,
        gallery: form.gallery?.length ? form.gallery : [],
        rules: form.rules?.trim() || null,
        prizes: form.prizes && form.prizes.length > 0 ? form.prizes : null,

        entry_requirements: form.entry_requirements ?? null,
        judging_criteria: form.judging_criteria ?? null,
        categories: form.categories ?? [],

        max_entries_per_user: form.max_entries_per_user ?? 3,
        winner_announced: form.winner_announced ?? false,
      };

      await createContest(payload).unwrap();
      router.push('/dashboard/opportunities');
    } catch (err: any) {
      setFormError(err?.data?.message || err?.data?.error || 'Failed to create opportunity');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
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
          <CardContent className="space-y-8 pt-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label>Contest Title *</Label>
                <Input
                  placeholder="Summer Merch Design Contest 2026"
                  value={form.title}
                  onChange={(e) => updateField('title', e.target.value)}
                />
              </div>

              <div>
                <Label>Slug *</Label>
                <Input
                  placeholder="summer-merch-design-2026"
                  value={form.slug}
                  onChange={(e) => updateField('slug', e.target.value)}
                />
              </div>

              <div>
                <Label>Description *</Label>
                <Textarea
                  rows={5}
                  placeholder="Create original artwork for our official summer merchandise collection..."
                  value={form.description}
                  onChange={(e) => updateField('description', e.target.value)}
                />
              </div>
            </div>

            {/* Media */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label>Hero Image URL *</Label>
                <Input
                  placeholder="https://images.unsplash.com/photo-1557683316-973673baf926"
                  value={form.hero_image || ''}
                  onChange={(e) => updateField('hero_image', e.target.value)}
                />
              </div>

              <div>
                <Label>Gallery Images (comma separated URLs)</Label>
                <Input
                  placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
                  value={form.gallery?.join(', ') || ''}
                  onChange={(e) =>
                    updateField(
                      'gallery',
                      e.target.value
                        .split(',')
                        .map((url) => url.trim())
                        .filter(Boolean)
                    )
                  }
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Start Date *</Label>
                <SingleDatePicker
                  onDateChange={(d) => updateField('start_date', d ? toISODate(d)! : '')}
                />
              </div>
              <div>
                <Label>Submission End Date *</Label>
                <SingleDatePicker
                  onDateChange={(d) => updateField('submission_end_date', d ? toISODate(d)! : '')}
                />
              </div>
              <div>
                <Label>Voting End Date (Optional)</Label>
                <SingleDatePicker
                  onDateChange={(d) => updateField('voting_end_date', d ? toISODate(d) : null)}
                />
              </div>
              <div>
                <Label>Judging End Date (Optional)</Label>
                <SingleDatePicker
                  onDateChange={(d) => updateField('judging_end_date', d ? toISODate(d) : null)}
                />
              </div>
            </div>

            {/* Rules & Requirements */}
            <div className="grid grid-cols-1 gap-6">
              <div>
                <Label>Rules & Guidelines</Label>
                <Textarea
                  rows={5}
                  placeholder="All submissions must be 100% original. No AI-generated content allowed. Maximum 3 entries per artist."
                  value={form.rules || ''}
                  onChange={(e) => updateField('rules', e.target.value || null)}
                />
              </div>

              <div>
                <Label>Entry Requirements / Instructions</Label>
                <Textarea
                  rows={4}
                  placeholder="Submit high-resolution files (PNG/JPG). Include concept explanation."
                  value={form.entry_requirements?.instructions || ''}
                  onChange={(e) =>
                    updateField(
                      'entry_requirements',
                      e.target.value ? { instructions: e.target.value } : null
                    )
                  }
                />
              </div>
            </div>

            {/* Judging Criteria */}
            <div>
              <Label>Judging Criteria (comma separated)</Label>
              <Input
                placeholder="Creativity, Technical Quality, Brand Fit, Print Readiness"
                value={form.judging_criteria?.criteria?.join(', ') || ''}
                onChange={(e) =>
                  updateField('judging_criteria', {
                    criteria: e.target.value
                      .split(',')
                      .map((c) => c.trim())
                      .filter(Boolean),
                  })
                }
              />
            </div>

            {/* Categories */}
            <div>
              <Label>Categories (comma separated)</Label>
              <Input
                placeholder="Merch Design, Illustration, Graphic Design"
                value={form.categories?.join(', ') || ''}
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
            </div>

            {/* Prizes - Structured */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Prizes</Label>
                <Button type="button" variant="outline" size="sm" onClick={addPrize}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Prize
                </Button>
              </div>

              <div className="space-y-4">
                {(form.prizes || []).map((prize, index) => (
                  <Card key={index}>
                    <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-12 gap-3">
                      <div className="md:col-span-2">
                        <Label>Rank</Label>
                        <Input
                          type="number"
                          value={prize.rank}
                          onChange={(e) => updatePrize(index, 'rank', parseInt(e.target.value))}
                        />
                      </div>
                      <div className="md:col-span-3">
                        <Label>Type</Label>
                        <Select
                          value={prize.type}
                          onValueChange={(val) => updatePrize(index, 'type', val)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="product">Product</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-4">
                        <Label>Amount (USD)</Label>
                        <Input
                          type="number"
                          value={prize.amount_usd || ''}
                          onChange={(e) =>
                            updatePrize(
                              index,
                              'amount_usd',
                              parseFloat(e.target.value) || undefined
                            )
                          }
                        />
                      </div>
                      <div className="md:col-span-3 flex items-end">
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => removePrize(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="md:col-span-12">
                        <Label>Description</Label>
                        <Input
                          value={prize.description || ''}
                          onChange={(e) => updatePrize(index, 'description', e.target.value)}
                          placeholder="Grand Prize - Cash + Official Merch Licensing"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Visibility</Label>
                <Select
                  value={form.visibility}
                  onValueChange={(v: Visibility) => updateField('visibility', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="unlisted">Unlisted</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v: Status) => updateField('status', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="live">Live</SelectItem>
                    <SelectItem value="judging">Judging</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Max Entries per User</Label>
                <Input
                  type="number"
                  value={form.max_entries_per_user}
                  onChange={(e) =>
                    updateField('max_entries_per_user', parseInt(e.target.value) || 3)
                  }
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={form.winner_announced || false}
                onCheckedChange={(checked) => updateField('winner_announced', checked)}
              />
              <Label>Winner Already Announced</Label>
            </div>

            {/* Error */}
            {formError && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3 pt-6">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || !form.brand_id}>
                {isLoading ? 'Creating Opportunity...' : 'Create Opportunity'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
