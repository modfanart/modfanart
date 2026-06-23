'use client';

import type React from 'react';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DashboardShell } from '@/components/dashboard-shell';
import { DateRangePicker } from '@/components/ui/date-picker';
import { Trophy, Briefcase } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function CreateOpportunityPage() {
  const router = useRouter();
  const [opportunityType, setOpportunityType] = useState<'contest' | 'rfd'>('contest');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would save the form data to a database
    // For now, we'll just redirect back to the opportunities page
    router.push('/dashboard/opportunities');
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
          <form onSubmit={handleSubmit}>
            <div className="space-y-8">
              <div>
                <h2 className="mb-4 text-xl font-semibold">Opportunity Type</h2>
                <RadioGroup
                  defaultValue="contest"
                  className="grid grid-cols-1 gap-4 md:grid-cols-2"
                  onValueChange={(value) => setOpportunityType(value as 'contest' | 'rfd')}
                >
                  <div>
                    <RadioGroupItem value="contest" id="contest" className="peer sr-only" />
                    <Label
                      htmlFor="contest"
                      className="flex cursor-pointer flex-col gap-2 rounded-lg border border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
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
                      className="flex cursor-pointer flex-col gap-2 rounded-lg border border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
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

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" placeholder="Enter opportunity title" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categories">Categories (comma separated)</Label>
                  <Input id="categories" placeholder="e.g. Gaming, Digital Art, Fantasy" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your opportunity in detail"
                  className="min-h-32"
                  required
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="deadline">Submission Deadline</Label>
                  <DateRangePicker />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">Cover Image URL</Label>
                  <Input id="image" placeholder="https://example.com/image.jpg" required />
                </div>
              </div>

              {opportunityType === 'contest' ? (
                <div className="space-y-2">
                  <Label htmlFor="prize">Prize Details</Label>
                  <Textarea
                    id="prize"
                    placeholder="Describe the prizes for winners"
                    className="min-h-20"
                    required
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="compensation">Compensation Details</Label>
                  <Textarea
                    id="compensation"
                    placeholder="Describe the compensation for selected artists"
                    className="min-h-20"
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="requirements">Submission Requirements</Label>
                <Textarea
                  id="requirements"
                  placeholder="List all requirements for submissions"
                  className="min-h-32"
                  required
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Button variant="outline" type="button" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit">Create Opportunity</Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
