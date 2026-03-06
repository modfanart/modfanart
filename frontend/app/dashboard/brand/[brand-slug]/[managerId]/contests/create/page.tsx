'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trophy, Briefcase, Calendar } from 'lucide-react';

import { useAuth } from '@/store/AuthContext';
import { SingleDatePicker } from '@/components/ui/single-date-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DashboardShell } from '@/components/dashboard-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import { useCreateContestMutation } from '@/services/api/contestsApi';

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

export default function CreateOpportunityPage() {
  const router = useRouter();
  const { user } = useAuth();

  const brands = user?.brands ?? [];

  const [brandId, setBrandId] = useState<string | null>(null);

  const [opportunityType, setOpportunityType] = useState<'contest' | 'rfd'>('contest');

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');

  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>();

  const [prizeDetails, setPrizeDetails] = useState('');
  const [requirements, setRequirements] = useState('');

  const [formError, setFormError] = useState<string | null>(null);

  const [createContest, { isLoading: isCreating, error: createError }] = useCreateContestMutation();

  useEffect(() => {
    if (brands.length && !brandId) {
      setBrandId(brands[0].id);
    }
  }, [brands]);

  useEffect(() => {
    if (title && !slug) {
      setSlug(generateSlug(title));
    }
  }, [title]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (opportunityType !== 'contest') {
      alert('RFD / Licensing opportunities coming soon');
      return;
    }

    if (!brandId) {
      setFormError('Please select a brand');
      return;
    }

    if (
      !title.trim() ||
      !slug.trim() ||
      !description.trim() ||
      !coverImage.trim() ||
      !startDate ||
      !endDate
    ) {
      setFormError('Please fill all required fields (title, slug, description, image, dates)');
      return;
    }

    const payload = {
      brand_id: brandId,
      title: title.trim(),
      slug: slug.trim(),
      description: description.trim(),
      hero_image: coverImage.trim(),

      start_date: toISODate(startDate)!,
      submission_end_date: toISODate(endDate)!,

      prizes: prizeDetails.trim()
        ? [
            {
              rank: 1,
              type: 'cash',
              amount_inr: 0,
              description: prizeDetails.trim(),
            },
          ]
        : null,

      entry_requirements: requirements.trim() ? { instructions: requirements.trim() } : null,

      categoryIds: [],
      visibility: 'public' as const,
      status: 'draft' as const,
      max_entries_per_user: 3,
    };

    try {
      await createContest(payload).unwrap();

      router.push('/dashboard/opportunities?success=true');
    } catch (err: any) {
      console.error(err);

      setFormError(err?.data?.message || 'Failed to create contest. Please try again.');
    }
  };

  return (
    <DashboardShell>
      <div className="mb-8 flex items-center gap-4">
        <Link href="/dashboard/opportunities">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Opportunity</h1>
          <p className="text-muted-foreground mt-1">Launch a fan art contest for your brand.</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-8 pb-10">
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Opportunity Type */}
            <div>
              <h2 className="mb-5 text-2xl font-semibold">Opportunity Type</h2>

              <RadioGroup
                value={opportunityType}
                onValueChange={(v) => setOpportunityType(v as 'contest' | 'rfd')}
                className="grid gap-6 md:grid-cols-2"
              >
                <div>
                  <RadioGroupItem value="contest" id="contest" className="peer sr-only" />

                  <Label
                    htmlFor="contest"
                    className="flex cursor-pointer flex-col gap-3 rounded-xl border p-6"
                  >
                    <div className="flex justify-between">
                      <h3 className="text-lg font-semibold">Fan Art Contest</h3>
                      <Trophy className="h-6 w-6 text-primary" />
                    </div>

                    <p className="text-sm text-muted-foreground">Run a competition with prizes.</p>
                  </Label>
                </div>

                <div>
                  <RadioGroupItem value="rfd" id="rfd" className="peer sr-only" />

                  <Label
                    htmlFor="rfd"
                    className="flex cursor-pointer flex-col gap-3 rounded-xl border p-6 opacity-60"
                  >
                    <div className="flex justify-between">
                      <h3 className="text-lg font-semibold">Licensing Request</h3>
                      <Briefcase className="h-6 w-6" />
                    </div>

                    <p className="text-sm text-muted-foreground">Coming soon.</p>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Brand selector */}
            <div className="space-y-2">
              <Label>Select Brand *</Label>

              <select
                value={brandId ?? ''}
                onChange={(e) => setBrandId(e.target.value)}
                className="w-full border rounded-md p-2"
                required
              >
                <option value="">Select brand</option>

                {brands.map((brand: any) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Title + Slug */}
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Contest Title *</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Slug *</Label>
                <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description *</Label>

              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            {/* Dates */}
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <Label>Start Date</Label>
                <SingleDatePicker date={startDate} onDateChange={setStartDate} />
              </div>

              <div>
                <Label>Submission Deadline</Label>
                <SingleDatePicker date={endDate} onDateChange={setEndDate} />
              </div>
            </div>

            {/* Cover Image */}
            <div className="space-y-2">
              <Label>Hero Image *</Label>

              <Input value={coverImage} onChange={(e) => setCoverImage(e.target.value)} />
            </div>

            {/* Prize */}
            <div className="space-y-2">
              <Label>Prize Description</Label>

              <Textarea value={prizeDetails} onChange={(e) => setPrizeDetails(e.target.value)} />
            </div>

            {/* Requirements */}
            <div className="space-y-2">
              <Label>Entry Requirements</Label>

              <Textarea value={requirements} onChange={(e) => setRequirements(e.target.value)} />
            </div>

            {(formError || createError) && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>

                <AlertDescription>
                  {formError || (createError as any)?.data?.message || 'Something went wrong'}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end gap-4 pt-8">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>

              <Button type="submit" disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create Contest'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
