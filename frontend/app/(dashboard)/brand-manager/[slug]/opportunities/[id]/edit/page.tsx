'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

import { ArrowLeft, Trophy, Save, Plus, Trash2, Upload, X } from 'lucide-react';

import {
  useGetContestQuery,
  useUpdateContestMutation,
  type UpdateContestRequest,
} from '@/services/api/contestsApi';

import { SingleDatePicker } from '@/components/ui/single-date-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

/* ───────────────── TYPES ───────────────── */

type Visibility = 'public' | 'private' | 'unlisted';
type Status = 'draft' | 'published' | 'live' | 'judging' | 'completed' | 'archived';

type Prize = {
  rank: number;
  type: string; // ✅ flexible now
  amount_usd?: number;
  description?: string;
};
interface FormState {
  title: string;
  slug: string;
  description: string;
  hero_image: string;
  gallery: string[];
  rules: string;
  prizes: Prize[];
  start_date: string;
  submission_end_date: string;
  voting_end_date: string | null;
  judging_end_date: string | null;
  entry_requirements: { instructions?: string } | null;
  judging_criteria: { criteria: string[] } | null;
  categories: string[];
  visibility: Visibility;
  status: Status;
  max_entries_per_user: number;
  winner_announced: boolean;
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

export default function EditContestPage() {
  const router = useRouter();
  const params = useParams();
  const contestId = params['id'] as string;

  const { data: contest, isLoading: isContestLoading, isError } = useGetContestQuery(contestId);
  const [updateContest, { isLoading: isUpdating }] = useUpdateContestMutation();

  /* ───────────────── FORM STATE ───────────────── */

  const [form, setForm] = useState<FormState>({
    title: '',
    slug: '',
    description: '',
    hero_image: '',
    gallery: [],
    rules: '',
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
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  /* ───────────────── LOAD EXISTING DATA ───────────────── */

  useEffect(() => {
    if (contest) {
      setForm({
        title: contest.title || '',
        slug: contest.slug || '',
        description: contest.description || '',
        hero_image: contest.hero_image || '',
        gallery: contest.gallery || [],
        rules: contest.rules || '',
        prizes: (contest.prizes || []).map((p) => ({
          rank: p.rank ?? 1,
          type: p.type || '',
          ...(p.description !== undefined && { description: p.description }),
          ...(p.amount_usd !== undefined && { amount_usd: p.amount_usd }),
        })),
        start_date: contest.start_date || '',
        submission_end_date: contest.submission_end_date || '',
        voting_end_date: contest.voting_end_date || null,
        judging_end_date: contest.judging_end_date || null,
        entry_requirements: contest.entry_requirements || null,
        judging_criteria: contest.judging_criteria || { criteria: [] },
        categories: contest.categories || [],
        visibility: (contest.visibility as Visibility) || 'public',
        status: (contest.status as Status) || 'draft',
        max_entries_per_user: contest.max_entries_per_user || 3,
        winner_announced: contest.winner_announced || false,
      });
    }
  }, [contest]);

  /* ───────────────── AUTO SLUG GENERATION ───────────────── */

  useEffect(() => {
    if (form.title && (!form.slug || form.slug === contest?.slug)) {
      const newSlug = generateSlug(form.title);
      if (newSlug !== form.slug) {
        setForm((prev) => ({ ...prev, slug: newSlug }));
      }
    }
  }, [form.title, contest?.slug]);

  /* ───────────────── FIELD UPDATER ───────────────── */

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  /* ───────────────── IMAGE UPLOAD ───────────────── */

  // Replace this with your actual upload function (Cloudinary, AWS S3, etc.)
  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    // Example: Change '/api/upload' to your real upload endpoint
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      throw new Error('Image upload failed');
    }

    const data = await res.json();
    return data.url; // Backend should return { url: "https://..." }
  };

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingHero(true);
    try {
      const imageUrl = await uploadImage(file);
      updateField('hero_image', imageUrl);
    } catch (err) {
      setFormError('Failed to upload hero image. Please try again.');
    } finally {
      setUploadingHero(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingGallery(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const url = await uploadImage(file);
        uploadedUrls.push(url);
      }
      updateField('gallery', [...form.gallery, ...uploadedUrls]);
    } catch (err) {
      setFormError('Failed to upload one or more gallery images.');
    } finally {
      setUploadingGallery(false);
    }
  };

  const removeGalleryImage = (index: number) => {
    updateField(
      'gallery',
      form.gallery.filter((_, i) => i !== index)
    );
  };

  /* ───────────────── PRIZE MANAGEMENT ───────────────── */

  const addPrize = () => {
    updateField('prizes', [
      ...form.prizes,
      { rank: form.prizes.length + 1, type: 'cash', description: '', amount_usd: 0 },
    ]);
  };

  const removePrize = (index: number) => {
    updateField(
      'prizes',
      form.prizes.filter((_, i) => i !== index)
    );
  };

  const updatePrize = <K extends keyof Prize>(index: number, field: K, value: Prize[K]) => {
    const updatedPrizes = [...form.prizes];

    updatedPrizes[index] = {
      ...updatedPrizes[index],
      [field]: value,
    } as Prize; // ✅ key fix

    updateField('prizes', updatedPrizes);
  };
  /* ───────────────── SUBMIT ───────────────── */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!form.title?.trim() || !form.slug?.trim() || !form.description?.trim()) {
      return setFormError('Title, Slug, and Description are required.');
    }

    try {
      const payload: UpdateContestRequest = {
        id: contestId,
        title: form.title.trim(),
        slug: form.slug.trim(),
        description: form.description.trim(),
        hero_image: form.hero_image || null,
        gallery: form.gallery.length > 0 ? form.gallery : [],
        rules: form.rules?.trim() || null,
        prizes: form.prizes.length > 0 ? form.prizes : null,

        start_date: form.start_date ? toISODate(form.start_date)! : '',
        submission_end_date: form.submission_end_date ? toISODate(form.submission_end_date)! : '',

        voting_end_date: toISODate(form.voting_end_date),
        judging_end_date: toISODate(form.judging_end_date),

        entry_requirements: form.entry_requirements,
        judging_criteria: form.judging_criteria,
        categories: form.categories,
        visibility: form.visibility,
        status: form.status,
        max_entries_per_user: form.max_entries_per_user,
        winner_announced: form.winner_announced,
      };

      await updateContest(payload).unwrap();
      router.push('/dashboard/opportunities');
    } catch (err: any) {
      setFormError(
        err?.data?.message || err?.data?.error || 'Failed to update contest. Please try again.'
      );
    }
  };

  /* ───────────────── LOADING & ERROR STATES ───────────────── */

  if (isContestLoading) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <Skeleton className="h-12 w-3/4 mb-8" />
        <div className="space-y-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !contest) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Contest not found or failed to load.</AlertDescription>
        </Alert>
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/opportunities">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <Trophy className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold tracking-tight">Edit Opportunity</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Contest Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="Summer Merch Design Contest 2026"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">
                  Slug <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="slug"
                  value={form.slug}
                  onChange={(e) => updateField('slug', e.target.value)}
                  placeholder="summer-merch-design-2026"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                rows={5}
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Create original artwork for our official summer merchandise..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Media - Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Media</CardTitle>
          </CardHeader>
          <CardContent className="space-y-10">
            {/* Hero Image */}
            <div className="space-y-4">
              <Label>Hero Image</Label>
              <div className="flex flex-wrap items-start gap-6">
                <label className="cursor-pointer">
                  <div className="border-2 border-dashed border-muted-foreground/30 hover:border-primary rounded-xl p-10 text-center transition-colors w-80">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="font-medium">Upload Hero Image</p>
                    <p className="text-sm text-muted-foreground mt-1">PNG, JPG, WebP • Max 5MB</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleHeroUpload}
                    disabled={uploadingHero}
                  />
                </label>

                {form.hero_image && (
                  <div className="relative w-80 h-48 rounded-xl overflow-hidden border shadow-sm">
                    <img
                      src={form.hero_image}
                      alt="Hero preview"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-3 right-3"
                      onClick={() => updateField('hero_image', '')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              {uploadingHero && <p className="text-sm text-blue-600">Uploading hero image...</p>}
            </div>

            {/* Gallery */}
            <div className="space-y-4">
              <Label>Gallery Images</Label>
              <label className="cursor-pointer block">
                <div className="border-2 border-dashed border-muted-foreground/30 hover:border-primary rounded-xl p-10 text-center transition-colors">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="font-medium">Upload Gallery Images</p>
                  <p className="text-sm text-muted-foreground">Select multiple images</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleGalleryUpload}
                  disabled={uploadingGallery}
                />
              </label>

              {form.gallery.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">
                  {form.gallery.map((url, index) => (
                    <div
                      key={index}
                      className="relative group rounded-xl overflow-hidden border shadow-sm aspect-square"
                    >
                      <img
                        src={url}
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-all"
                        onClick={() => removeGalleryImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {uploadingGallery && (
                <p className="text-sm text-blue-600">Uploading gallery images...</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dates */}
        <Card>
          <CardHeader>
            <CardTitle>Important Dates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>
                  Start Date <span className="text-destructive">*</span>
                </Label>
                <SingleDatePicker
                  date={form.start_date ? new Date(form.start_date) : undefined}
                  onDateChange={(d) => updateField('start_date', toISODate(d) || '')}
                />
              </div>
              <div className="space-y-2">
                <Label>
                  Submission End Date <span className="text-destructive">*</span>
                </Label>
                <SingleDatePicker
                  date={form.submission_end_date ? new Date(form.submission_end_date) : undefined}
                  onDateChange={(d) => updateField('submission_end_date', toISODate(d) || '')}
                />
              </div>
              <div className="space-y-2">
                <Label>Voting End Date (Optional)</Label>
                <SingleDatePicker
                  date={form.voting_end_date ? new Date(form.voting_end_date) : undefined}
                  onDateChange={(d) => updateField('voting_end_date', toISODate(d))}
                />
              </div>
              <div className="space-y-2">
                <Label>Judging End Date (Optional)</Label>
                <SingleDatePicker
                  date={form.judging_end_date ? new Date(form.judging_end_date) : undefined}
                  onDateChange={(d) => updateField('judging_end_date', toISODate(d))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rules & Requirements */}
        <Card>
          <CardHeader>
            <CardTitle>Rules & Requirements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Rules & Guidelines</Label>
              <Textarea
                rows={6}
                value={form.rules}
                onChange={(e) => updateField('rules', e.target.value)}
                placeholder="All submissions must be 100% original..."
              />
            </div>

            <div className="space-y-2">
              <Label>Entry Requirements / Instructions</Label>
              <Textarea
                rows={4}
                value={form.entry_requirements?.instructions || ''}
                onChange={(e) =>
                  updateField(
                    'entry_requirements',
                    e.target.value ? { instructions: e.target.value } : null
                  )
                }
                placeholder="Submit high-resolution files (PNG/JPG)..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Judging Criteria & Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Judging Criteria</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={form.judging_criteria?.criteria?.join(', ') || ''}
                onChange={(e) =>
                  updateField('judging_criteria', {
                    criteria: e.target.value
                      .split(',')
                      .map((c) => c.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="Creativity, Technical Quality, Brand Fit, Print Readiness"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={form.categories.join(', ')}
                onChange={(e) =>
                  updateField(
                    'categories',
                    e.target.value
                      .split(',')
                      .map((c) => c.trim())
                      .filter(Boolean)
                  )
                }
                placeholder="Merch Design, Illustration, Graphic Design"
              />
            </CardContent>
          </Card>
        </div>

        {/* Prizes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Prizes</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addPrize}>
              <Plus className="h-4 w-4 mr-2" />
              Add Prize
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {form.prizes.length === 0 && (
              <p className="text-muted-foreground text-sm py-4">No prizes added yet.</p>
            )}

            {form.prizes.map((prize, index) => (
              <Card key={index} className="border border-border">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-2">
                      <Label>Rank</Label>
                      <Input
                        type="number"
                        value={prize.rank}
                        onChange={(e) => updatePrize(index, 'rank', parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div className="md:col-span-3">
                      <Label>Type</Label>
                      <Input
                        value={prize.type}
                        onChange={(e) => updatePrize(index, 'type', e.target.value)}
                        placeholder="Cash, Gift Card, NFT, Internship, etc."
                      />
                    </div>
                    <div className="md:col-span-4">
                      <Label>Amount (USD)</Label>
                      <Input
                        type="number"
                        value={prize.amount_usd ?? ''}
                        onChange={(e) =>
                          updatePrize(
                            index,
                            'amount_usd',
                            e.target.value ? parseFloat(e.target.value) : undefined
                          )
                        }
                        placeholder="5000"
                      />
                    </div>
                    <div className="md:col-span-3 flex items-end justify-end">
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
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  min={1}
                  value={form.max_entries_per_user}
                  onChange={(e) =>
                    updateField('max_entries_per_user', parseInt(e.target.value) || 1)
                  }
                />
              </div>
            </div>

            <Separator />

            <div className="flex items-center gap-3">
              <Switch
                checked={form.winner_announced}
                onCheckedChange={(checked) => updateField('winner_announced', checked)}
              />
              <Label className="cursor-pointer">Winner Already Announced</Label>
            </div>
          </CardContent>
        </Card>

        {formError && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end gap-4 pt-6">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isUpdating} size="lg">
            <Save className="mr-2 h-5 w-5" />
            {isUpdating ? 'Saving Changes...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
