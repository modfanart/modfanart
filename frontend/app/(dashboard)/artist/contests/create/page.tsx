'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trophy, Briefcase } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DashboardShell } from '@/components/dashboard-shell';
import { DateRangePicker } from '@/components/ui/date-picker';
import { Card, CardContent } from '@/components/ui/card';

// ── Import types ─────────────────────────────────────────────────────
import type { ContestDetail } from '@/services/api/contestsApi';
import { useCreateContestMutation } from '@/services/api/contestsApi';

// Helper: Date → YYYY-MM-DD string (now safely typed for non-null input)
function toISODate(date: Date): string {
  return date.toISOString().split('T')[0]!; // ← add !
}

export default function CreateOpportunityPage() {
  const router = useRouter();
  const [opportunityType, setOpportunityType] = useState<'contest' | 'rfd'>('contest');

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);
  const [prizeDetails, setPrizeDetails] = useState('');
  const [compensationDetails, setCompensationDetails] = useState('');
  const [requirements, setRequirements] = useState('');

  const [createContest, { isLoading: isCreating, error: createError }] = useCreateContestMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (opportunityType !== 'contest') {
      alert('RFD / Licensing opportunities are not yet supported — coming soon!');
      return;
    }

    // Validation
    if (!title.trim() || !description.trim() || !coverImage.trim() || !deadline) {
      alert('Please fill in all required fields.');
      return;
    }

    // TypeScript now knows deadline is defined here
    const submissionEndDate = toISODate(deadline!); // ← ! is safe because of the check above

    const payload: Partial<ContestDetail> = {
      title: title.trim(),
      description: description.trim(),
      hero_image: coverImage.trim(),
      submission_end_date: submissionEndDate,
      prizes: prizeDetails.trim()
        ? [
            {
              rank: 1,
              type: 'cash',
              amount_inr: 0, // TODO: parse real amount if needed
              description: prizeDetails.trim(),
            },
          ]
        : null,
      entry_requirements: requirements.trim() ? { instructions: requirements.trim() } : null,
      categories: categories
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean),
      visibility: 'public',
      status: 'draft',
      max_entries_per_user: 3,
    };

    try {
      await createContest(payload).unwrap();
      router.push('/dashboard/opportunities?success=true');
    } catch (err: any) {
      console.error('Failed to create contest:', err);
      alert(err?.data?.message || 'Failed to create opportunity. Please try again.');
    }
  };

  return (
    <DashboardShell>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/dashboard/opportunities">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create New Opportunity</h1>
          <p className="text-muted-foreground">
            Set up a new fan art contest or licensing request for designs.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Opportunity Type */}
            <div>
              <h2 className="mb-4 text-xl font-semibold">Opportunity Type</h2>
              <RadioGroup
                value={opportunityType}
                onValueChange={(v) => setOpportunityType(v as 'contest' | 'rfd')}
                className="grid grid-cols-1 gap-4 md:grid-cols-2"
              >
                <div>
                  <RadioGroupItem value="contest" id="contest" className="peer sr-only" />
                  <Label
                    htmlFor="contest"
                    className="flex cursor-pointer flex-col gap-2 rounded-lg border border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">Fan Art Contest</div>
                      <Trophy className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Create a competition with prizes for the best fan art submissions.
                    </div>
                  </Label>
                </div>

                <div>
                  <RadioGroupItem value="rfd" id="rfd" className="peer sr-only" />
                  <Label
                    htmlFor="rfd"
                    className="flex cursor-pointer flex-col gap-2 rounded-lg border border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">Licensing RFD</div>
                      <Briefcase className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Request fan art designs for commercial licensing opportunities.
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Common fields */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Summer Anime Character Design Contest"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categories">Categories (comma separated)</Label>
                <Input
                  id="categories"
                  value={categories}
                  onChange={(e) => setCategories(e.target.value)}
                  placeholder="Gaming, Anime, Pixel Art, Fantasy"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the opportunity in detail..."
                className="min-h-32"
                required
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Submission Deadline *</Label>
                <DateRangePicker
                  {...(deadline ? { date: { from: deadline, to: deadline } } : {})}
                  onDateChange={(range) => setDeadline(range?.from ?? undefined)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Cover Image URL *</Label>
                <Input
                  id="image"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  required
                />
              </div>
            </div>

            {/* Type-specific */}
            {opportunityType === 'contest' ? (
              <div className="space-y-2">
                <Label htmlFor="prize">Prize Details *</Label>
                <Textarea
                  id="prize"
                  value={prizeDetails}
                  onChange={(e) => setPrizeDetails(e.target.value)}
                  placeholder="1st: $500 + featured spot\n2nd: $250\n3rd: $100 + shoutout..."
                  className="min-h-20"
                  required
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="compensation">Compensation Details *</Label>
                <Textarea
                  id="compensation"
                  value={compensationDetails}
                  onChange={(e) => setCompensationDetails(e.target.value)}
                  placeholder="Fixed $800 per selected design\n+ 10% royalty on merch sales..."
                  className="min-h-20"
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="requirements">Submission Requirements *</Label>
              <Textarea
                id="requirements"
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="• Original artwork only\n• PNG/JPEG, min 2000px wide\n• No AI-generated content\n..."
                className="min-h-32"
                required
              />
            </div>

            {/* API error feedback */}
            {createError && (
              <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive">
                {(createError as any)?.data?.message ||
                  'Failed to create opportunity. Please try again.'}
              </div>
            )}

            <div className="flex justify-end gap-4 pt-6">
              <Button
                variant="outline"
                type="button"
                onClick={() => router.back()}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create Opportunity'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
