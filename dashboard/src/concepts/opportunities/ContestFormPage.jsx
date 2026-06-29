'use client';

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash } from '@phosphor-icons/react';
import { Save } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Switch } from '../../components/ui/switch';

import {
  useGetContestQuery,
  useCreateContestMutation,
  useUpdateContestMutation,
} from '../../services/api/contestsApi';

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'live', label: 'Live' },
  { value: 'judging', label: 'Judging' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
];

const visibilityOptions = [
  { value: 'public', label: 'Public' },
  { value: 'private', label: 'Private' },
  { value: 'unlisted', label: 'Unlisted' },
];



export const ContestFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditing = Boolean(id);

  const [createContest] = useCreateContestMutation();
  const [updateContest] = useUpdateContestMutation();

  const { data: contestData, isLoading } = useGetContestQuery(id, {
    skip: !isEditing,
  });

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
    max_entries_per_user: 1,
    winner_announced: false,
  });

  const [prizes, setPrizes] = useState([
    { rank: 1, amount_inr: 0, type: 'cash', description: '' },
  ]);

  const [entryRequirements, setEntryRequirements] = useState('');
  const [judgingCriteria, setJudgingCriteria] = useState('');

  // Load existing data when editing
  useEffect(() => {
    if (isEditing && contestData?.contest) {
      const c = contestData.contest;
      setForm({
        title: c.title || '',
        slug: c.slug || '',
        description: c.description || '',
        rules: c.rules || '',
        start_date: c.start_date ? c.start_date.split('T')[0] : '',
        submission_end_date: c.submission_end_date ? c.submission_end_date.split('T')[0] : '',
        voting_end_date: c.voting_end_date ? c.voting_end_date.split('T')[0] : '',
        judging_end_date: c.judging_end_date ? c.judging_end_date.split('T')[0] : '',
        status: c.status,
        visibility: c.visibility,
        max_entries_per_user: c.max_entries_per_user || 1,
        winner_announced: c.winner_announced || false,
      });

      if (c.prizes && Array.isArray(c.prizes)) {
        setPrizes(c.prizes);
      }

      if (c.entry_requirements) {
        setEntryRequirements(JSON.stringify(c.entry_requirements, null, 2));
      }
      if (c.judging_criteria) {
        setJudgingCriteria(JSON.stringify(c.judging_criteria, null, 2));
      }
    }
  }, [contestData, isEditing]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked) => {
    setForm((prev) => ({ ...prev, winner_announced: checked }));
  };

  const addPrize = () => {
    const newRank = Math.max(0, ...prizes.map(p => p.rank)) + 1;
    setPrizes([...prizes, { rank: newRank, amount_inr: 0, type: 'cash', description: '' }]);
  };

  const removePrize = (index) => {
    if (prizes.length === 1) return;
    setPrizes(prizes.filter((_, i) => i !== index));
  };

  const updatePrize = (index, field, value) => {
    const updated = [...prizes];
    updated[index] = { ...updated[index], [field]: value };
    setPrizes(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      start_date: form.start_date ? `${form.start_date}T00:00:00Z` : null,
      submission_end_date: form.submission_end_date ? `${form.submission_end_date}T23:59:59Z` : null,
      voting_end_date: form.voting_end_date ? `${form.voting_end_date}T23:59:59Z` : null,
      judging_end_date: form.judging_end_date ? `${form.judging_end_date}T23:59:59Z` : null,
      prizes,
      entry_requirements: entryRequirements ? JSON.parse(entryRequirements) : null,
      judging_criteria: judgingCriteria ? JSON.parse(judgingCriteria) : null,
    };

    try {
      if (isEditing && id) {
        await updateContest({ id, ...payload }).unwrap();
      } else {
        await createContest(payload).unwrap();
      }
      navigate('/opportunities');
    } catch (err) {
      console.error('Failed to save contest:', err);
      alert('Failed to save contest. Please check your inputs.');
    }
  };

  if (isEditing && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      <Header
        title={isEditing ? "Edit Contest" : "Create New Contest"}
        subtitle={isEditing ? "Update opportunity details" : "Launch a new creative opportunity"}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/opportunities')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2" /> Back to Opportunities
        </Button>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Contest Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={form.title}
                    onChange={handleInputChange}
                    required
                    placeholder="Summer Creative Challenge 2026"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug (URL-friendly)</Label>
                  <Input
                    id="slug"
                    name="slug"
                    value={form.slug}
                    onChange={handleInputChange}
                    placeholder="summer-creative-challenge-2026"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  rows={5}
                  placeholder="Describe what this contest is about..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => handleSelectChange('status', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Visibility</Label>
                  <Select
                    value={form.visibility}
                    onValueChange={(v) => handleSelectChange('visibility', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {visibilityOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dates */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  name="start_date"
                  type="date"
                  value={form.start_date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="submission_end_date">Submission Deadline</Label>
                <Input
                  id="submission_end_date"
                  name="submission_end_date"
                  type="date"
                  value={form.submission_end_date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="voting_end_date">Voting End Date (optional)</Label>
                <Input
                  id="voting_end_date"
                  name="voting_end_date"
                  type="date"
                  value={form.voting_end_date}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="judging_end_date">Judging End Date (optional)</Label>
                <Input
                  id="judging_end_date"
                  name="judging_end_date"
                  type="date"
                  value={form.judging_end_date}
                  onChange={handleInputChange}
                />
              </div>
            </CardContent>
          </Card>

          {/* Prizes */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Prizes</CardTitle>
              <Button type="button" onClick={addPrize} variant="outline" size="sm">
                <Plus className="mr-2" /> Add Prize
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {prizes.map((prize, index) => (
                <div key={index} className="flex gap-3 items-end border border-zinc-700 p-4 rounded-lg">
                  <div className="flex-1">
                    <Label>Rank #{prize.rank}</Label>
                    <Input
                      type="number"
                      value={prize.rank}
                      onChange={(e) => updatePrize(index, 'rank', parseInt(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex-1">
                    <Label>Type</Label>
                    <Select
                      value={prize.type}
                      onValueChange={(v) => updatePrize(index, 'type', v)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="trophy">Trophy / Recognition</SelectItem>
                        <SelectItem value="feature">Feature / Exposure</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Label>Amount (INR)</Label>
                    <Input
                      type="number"
                      value={prize.amount_inr || ''}
                      onChange={(e) => updatePrize(index, 'amount_inr', parseFloat(e.target.value) || undefined)}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex-1">
                    <Label>Description</Label>
                    <Input
                      value={prize.description || ''}
                      onChange={(e) => updatePrize(index, 'description', e.target.value)}
                      className="mt-1"
                      placeholder="1st Place Winner"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removePrize(index)}
                    className="text-red-400"
                  >
                    <Trash />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Rules & Requirements */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle>Rules & Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="rules">Official Rules</Label>
                <Textarea
                  id="rules"
                  name="rules"
                  value={form.rules}
                  onChange={handleInputChange}
                  rows={6}
                  placeholder="Detailed rules, eligibility, terms..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Entry Requirements (JSON)</Label>
                  <Textarea
                    value={entryRequirements}
                    onChange={(e) => setEntryRequirements(e.target.value)}
                    rows={6}
                    placeholder='{"maxFileSize": 10, "allowedFormats": ["jpg", "png"]}'
                  />
                </div>

                <div className="space-y-2">
                  <Label>Judging Criteria (JSON)</Label>
                  <Textarea
                    value={judgingCriteria}
                    onChange={(e) => setJudgingCriteria(e.target.value)}
                    rows={6}
                    placeholder='{"creativity": 0.4, "technical_skill": 0.3, ...}'
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Max Entries Per User</Label>
                  <Input
                    type="number"
                    min={1}
                    value={form.max_entries_per_user}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        max_entries_per_user: parseInt(e.target.value) || 1,
                      }))
                    }
                    className="w-32 mt-1"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Label className="cursor-pointer">Winner Announced</Label>
                  <Switch
                    checked={form.winner_announced}
                    onCheckedChange={handleSwitchChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/opportunities')}
            >
              Cancel
            </Button>
            <Button type="submit" size="lg">
              <Save className="mr-2" />
              {isEditing ? 'Update Contest' : 'Create Contest'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContestFormPage;