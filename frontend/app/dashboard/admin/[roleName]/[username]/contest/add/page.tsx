// app/contest/add/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateContestMutation } from '@/services/api/contestsApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { DashboardShell } from '@/components/dashboard-shell';

export default function AddContestPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [createContest, { isLoading }] = useCreateContestMutation();

  const [form, setForm] = useState({
    title: '',
    description: '',
    rules: '',
    start_date: '',
    submission_end_date: '',
    max_entries_per_user: 3,
    visibility: 'public' as const,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title || !form.description || !form.start_date || !form.submission_end_date) {
      toast({
        title: 'Missing fields',
        description: 'Please fill all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      const payload = {
        ...form,
        prizes: [], // can extend later
        status: 'draft' as const,
      };

      const result = await createContest(payload).unwrap();
      toast({ title: 'Success', description: 'Contest created as draft' });
      router.push(`/contest/${result.id}/monitor`);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.data?.message || 'Failed to create contest',
        variant: 'destructive',
      });
    }
  };

  return (
    <DashboardShell>
      <div className="container mx-auto py-10 px-4 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Create New Contest</CardTitle>
            <CardDescription>
              Set up your brand contest — attract artists and reward creativity.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Contest Title *</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Summer Design Challenge 2026"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the contest goal, theme, who should participate..."
                  rows={5}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rules">Rules & Guidelines</Label>
                <Textarea
                  id="rules"
                  value={form.rules}
                  onChange={(e) => setForm({ ...form, rules: e.target.value })}
                  placeholder="• Original work only\n• Max file size 50MB\n..."
                  rows={6}
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="submission_end_date">Submission Deadline *</Label>
                  <Input
                    id="submission_end_date"
                    type="date"
                    value={form.submission_end_date}
                    onChange={(e) => setForm({ ...form, submission_end_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_entries">Max Entries per User</Label>
                <Input
                  id="max_entries"
                  type="number"
                  min={1}
                  max={10}
                  value={form.max_entries_per_user}
                  onChange={(e) =>
                    setForm({ ...form, max_entries_per_user: Number(e.target.value) })
                  }
                />
              </div>

              <div className="flex justify-end gap-4 pt-6">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Draft Contest
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
