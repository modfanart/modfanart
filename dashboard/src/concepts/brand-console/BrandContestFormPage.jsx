import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from '@phosphor-icons/react';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { useGetMyBrandsQuery } from '../../services/api/brandApi';
import {
  useCreateContestMutation,
  useGetContestQuery,
  useUpdateContestMutation,
} from '../../services/api/contestsApi';
import { toast } from 'sonner';

/**
 * Create / edit contest scoped to a brand (brand_id always set from the URL).
 */
export default function BrandContestFormPage() {
  const { brandId, contestId } = useParams();
  const isEditing = Boolean(contestId);
  const navigate = useNavigate();

  const { data: myBrandsData } = useGetMyBrandsQuery();
  const myBrands = Array.isArray(myBrandsData) ? myBrandsData : myBrandsData?.brands || [];
  const brand = myBrands.find((b) => b.id === brandId);

  const [createContest, { isLoading: creating }] = useCreateContestMutation();
  const [updateContest, { isLoading: updating }] = useUpdateContestMutation();
  const { data: contestData, isLoading: loadingContest } = useGetContestQuery(contestId, {
    skip: !isEditing,
  });

  const contest = contestData?.contest || contestData;

  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    rules: '',
    start_date: '',
    submission_end_date: '',
    voting_end_date: '',
    judging_end_date: '',
    status: 'draft',
    visibility: 'public',
    max_entries_per_user: 3,
  });

  useEffect(() => {
    if (isEditing && contest?.id) {
      setForm({
        title: contest.title || '',
        slug: contest.slug || '',
        description: contest.description || '',
        rules: contest.rules || '',
        start_date: contest.start_date ? String(contest.start_date).split('T')[0] : '',
        submission_end_date: contest.submission_end_date
          ? String(contest.submission_end_date).split('T')[0]
          : '',
        voting_end_date: contest.voting_end_date
          ? String(contest.voting_end_date).split('T')[0]
          : '',
        judging_end_date: contest.judging_end_date
          ? String(contest.judging_end_date).split('T')[0]
          : '',
        status: contest.status || 'draft',
        visibility: contest.visibility || 'public',
        max_entries_per_user: contest.max_entries_per_user || 3,
      });
    }
  }, [isEditing, contest]);

  const setField = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!form.description.trim()) {
      toast.error('Description is required');
      return;
    }
    if (!form.start_date || !form.submission_end_date) {
      toast.error('Start date and submission end date are required');
      return;
    }

    const payload = {
      ...form,
      brand_id: brandId,
      start_date: form.start_date ? `${form.start_date}T00:00:00Z` : null,
      submission_end_date: form.submission_end_date
        ? `${form.submission_end_date}T23:59:59Z`
        : null,
      voting_end_date: form.voting_end_date ? `${form.voting_end_date}T23:59:59Z` : null,
      judging_end_date: form.judging_end_date ? `${form.judging_end_date}T23:59:59Z` : null,
      max_entries_per_user: Number(form.max_entries_per_user) || 1,
    };

    try {
      if (isEditing) {
        // brand_id is not updatable on the backend
        const { brand_id: _b, ...patch } = payload;
        await updateContest({ id: contestId, ...patch }).unwrap();
        toast.success('Contest updated');
        navigate(`/brand-console/${brandId}/contests/${contestId}`);
      } else {
        const result = await createContest(payload).unwrap();
        toast.success('Contest created');
        const newId = result?.contest?.id || result?.id;
        if (newId) {
          navigate(`/brand-console/${brandId}/contests/${newId}`);
        } else {
          navigate(`/brand-console/${brandId}/contests`);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.error || 'Failed to save contest');
    }
  };

  if (isEditing && loadingContest) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-fuchsia-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" data-testid="brand-contest-form">
      <Header
        title={isEditing ? 'Edit contest' : 'New contest'}
        subtitle={brand?.name ? `Brand: ${brand.name}` : 'Brand console'}
      />

      <div className="p-4 sm:p-6 max-w-2xl mx-auto">
        <Button
          variant="ghost"
          size="sm"
          className="text-zinc-400 hover:text-white mb-6"
          onClick={() =>
            navigate(
              isEditing
                ? `/brand-console/${brandId}/contests/${contestId}`
                : `/brand-console/${brandId}/contests`
            )
          }
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6">
          <div>
            <label className="text-sm text-zinc-400">Title *</label>
            <Input
              className="mt-1 bg-zinc-950 border-zinc-800"
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm text-zinc-400">Slug</label>
            <Input
              className="mt-1 bg-zinc-950 border-zinc-800 font-mono text-sm"
              value={form.slug}
              onChange={(e) => setField('slug', e.target.value)}
              placeholder="optional-url-slug"
            />
          </div>

          <div>
            <label className="text-sm text-zinc-400">Description *</label>
            <Textarea
              className="mt-1 bg-zinc-950 border-zinc-800 min-h-[100px]"
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-zinc-400">Rules</label>
            <Textarea
              className="mt-1 bg-zinc-950 border-zinc-800 min-h-[80px]"
              value={form.rules}
              onChange={(e) => setField('rules', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-zinc-400">Status</label>
              <Select value={form.status} onValueChange={(v) => setField('status', v)}>
                <SelectTrigger className="mt-1 bg-zinc-950 border-zinc-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['draft', 'live', 'judging', 'completed'].map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-zinc-400">Visibility</label>
              <Select value={form.visibility} onValueChange={(v) => setField('visibility', v)}>
                <SelectTrigger className="mt-1 bg-zinc-950 border-zinc-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['public', 'unlisted', 'private'].map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-zinc-400">Start date *</label>
              <Input
                type="date"
                className="mt-1 bg-zinc-950 border-zinc-800"
                value={form.start_date}
                onChange={(e) => setField('start_date', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-zinc-400">Submission end *</label>
              <Input
                type="date"
                className="mt-1 bg-zinc-950 border-zinc-800"
                value={form.submission_end_date}
                onChange={(e) => setField('submission_end_date', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-zinc-400">Voting end</label>
              <Input
                type="date"
                className="mt-1 bg-zinc-950 border-zinc-800"
                value={form.voting_end_date}
                onChange={(e) => setField('voting_end_date', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-zinc-400">Judging end</label>
              <Input
                type="date"
                className="mt-1 bg-zinc-950 border-zinc-800"
                value={form.judging_end_date}
                onChange={(e) => setField('judging_end_date', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-zinc-400">Max entries per user</label>
            <Input
              type="number"
              min={1}
              className="mt-1 bg-zinc-950 border-zinc-800 w-32"
              value={form.max_entries_per_user}
              onChange={(e) => setField('max_entries_per_user', e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white"
              disabled={creating || updating}
            >
              {creating || updating
                ? 'Saving…'
                : isEditing
                  ? 'Save changes'
                  : 'Create contest'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-zinc-700"
              onClick={() => navigate(`/brand-console/${brandId}/contests`)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
