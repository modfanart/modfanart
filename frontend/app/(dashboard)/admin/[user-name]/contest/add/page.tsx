'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Trophy,
  Image as ImageIcon,
  FileText,
  Calendar,
  Sparkles,
  Users,
  ShieldCheck,
} from 'lucide-react';

import { useAuth } from '@/store/AuthContext';
import { useCreateContestMutation } from '@/services/api/contestsApi';

import { SingleDatePicker } from '@/components/ui/single-date-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

/* ───────────────── HELPERS ───────────────── */

function toISODate(date: Date | undefined): string | undefined {
  return date ? date.toISOString().split('T')[0] : undefined;
}

function generateSlug(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/* ───────────────── PAGE ───────────────── */

export default function CreateOpportunityPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [brandId, setBrandId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');

  const [heroImage, setHeroImage] = useState('');
  const [gallery, setGallery] = useState(''); // comma separated URLs

  const [rules, setRules] = useState('');
  const [requirements, setRequirements] = useState('');

  const [categories, setCategories] = useState('');

  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [submissionEnd, setSubmissionEnd] = useState<Date | undefined>();
  const [votingEnd, setVotingEnd] = useState<Date | undefined>();
  const [judgingEnd, setJudgingEnd] = useState<Date | undefined>();

  const [prizeDetails, setPrizeDetails] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const [createContest, { isLoading }] = useCreateContestMutation();

  /* ───────────────── AUTH BRAND AUTO SET ───────────────── */

  useEffect(() => {
    const managedBrand = user?.brands?.[0];
    if (managedBrand && !brandId) {
      setBrandId(managedBrand.id);
    }
  }, [user, brandId]);

  /* ───────────────── AUTO SLUG ───────────────── */

  useEffect(() => {
    if (title && !slug) setSlug(generateSlug(title));
  }, [title]);

  /* ───────────────── SUBMIT ───────────────── */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!brandId) {
      setFormError('No brand found for your account');
      return;
    }

    if (!title || !slug || !description || !heroImage || !submissionEnd) {
      setFormError('Please fill required fields');
      return;
    }

    try {
      await createContest({
        brand_id: brandId,

        title: title.trim(),
        slug: slug.trim(),
        description: description.trim(),

        hero_image: heroImage.trim(),
        gallery: gallery ? gallery.split(',').map((g) => g.trim()) : [],

        rules: rules || null,
        entry_requirements: requirements ? { instructions: requirements } : null,

        categories: categories ? categories.split(',').map((c) => c.trim()) : [],

        start_date: toISODate(startDate)!,
        submission_end_date: toISODate(submissionEnd)!,
        voting_end_date: toISODate(votingEnd) || null,
        judging_end_date: toISODate(judgingEnd) || null,

        prizes: prizeDetails
          ? [
              {
                rank: 1,
                type: 'custom',
                description: prizeDetails,
              },
            ]
          : null,

        visibility: 'public',
        status: 'draft',
        max_entries_per_user: 3,
      }).unwrap();

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

        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            Create Opportunity
          </h1>
          <p className="text-muted-foreground">Launch a contest with full control</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardContent className="space-y-6 pt-6">
            {/* BASIC INFO */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> Basic Info
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Title *</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>

                <div>
                  <Label>Slug *</Label>
                  <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
                </div>
              </div>

              <div>
                <Label>Description *</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
            </div>

            {/* MEDIA */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <ImageIcon className="h-4 w-4" /> Media
              </h2>

              <div>
                <Label>Hero Image *</Label>
                <Input value={heroImage} onChange={(e) => setHeroImage(e.target.value)} />
              </div>

              <div>
                <Label>Gallery (comma separated URLs)</Label>
                <Input value={gallery} onChange={(e) => setGallery(e.target.value)} />
              </div>
            </div>

            {/* DATES */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Timeline
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                <SingleDatePicker date={startDate} onDateChange={setStartDate} />
                <SingleDatePicker date={submissionEnd} onDateChange={setSubmissionEnd} />
                <SingleDatePicker date={votingEnd} onDateChange={setVotingEnd} />
                <SingleDatePicker date={judgingEnd} onDateChange={setJudgingEnd} />
              </div>
            </div>

            {/* RULES + REQUIREMENTS */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /> Rules & Requirements
              </h2>

              <Textarea
                placeholder="Rules"
                value={rules}
                onChange={(e) => setRules(e.target.value)}
              />

              <Textarea
                placeholder="Entry requirements"
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
              />
            </div>

            {/* PRIZES */}
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-4 w-4" /> Prize
              </h2>

              <Textarea
                placeholder="Prize details"
                value={prizeDetails}
                onChange={(e) => setPrizeDetails(e.target.value)}
              />
            </div>

            {/* ERROR */}
            {formError && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            {/* ACTIONS */}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>

              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Contest'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
