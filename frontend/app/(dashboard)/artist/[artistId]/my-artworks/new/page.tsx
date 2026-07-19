// app/contests/submissions/new/page.tsx
// OR wherever your route is: app/submissions/new/page.tsx with contest query param

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2, Upload, AlertCircle, CheckCircle2, X, FileText } from 'lucide-react';
import { useAuth } from '@/store/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// ────────────────────────────────────────────────
// API Hooks
// ────────────────────────────────────────────────
import { useCreateArtworkMutation } from '@/services/api/artworkApi';
import { useGetAllCategoriesQuery } from '@/services/api/categoriesApi';
import { useSearchTagsQuery, useAddTagToArtworkMutation } from '@/services/api/artworkTagsApi';
import {
  useGetContestQuery,
  useSubmitEntryMutation,
  useGetMyContestEntriesQuery,
} from '@/services/api/contestsApi';

const ACTIVE_ENTRY_STATUSES = ['pending', 'approved', 'winner'];
const VALID_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// ────────────────────────────────────────────────
// Zod Schema (title is per-file now, handled outside react-hook-form)
// ────────────────────────────────────────────────
const formSchema = z.object({
  description: z.string().min(10, 'Description must be at least 10 characters').max(500).optional(),
  category: z.string().min(1, 'Please select a category'),
  originalIp: z.string().min(2, 'Fandom / Original IP is required').max(100),
  tagsInput: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type BatchItem = {
  id: string;
  file: File;
  previewUrl: string;
  title: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string | undefined;
};

export default function NewContestSubmissionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const contestId = searchParams.get('contest');
  const { user, loading: authLoading } = useAuth();

  const username = user?.username?.toLowerCase() || 'anonymous';
  const artistBase = `/artist/${username}`;

  const [items, setItems] = useState<BatchItem[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isBatchSubmitting, setIsBatchSubmitting] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagSearch, setTagSearch] = useState('');
  const [openTagPopover, setOpenTagPopover] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── API Mutations & Queries ───
  const [createArtwork] = useCreateArtworkMutation();
  const [addTagToArtwork] = useAddTagToArtworkMutation();
  const [submitContestEntry] = useSubmitEntryMutation();

  const {
    data: contest,
    isLoading: contestLoading,
    error: contestError,
  } = useGetContestQuery(contestId!, {
    skip: !contestId,
  });

  const { data: myEntriesData } = useGetMyContestEntriesQuery(
    { contestId: contestId! },
    { skip: !contestId }
  );

  const usedCount = (myEntriesData?.entries ?? []).filter((entry: any) =>
    ACTIVE_ENTRY_STATUSES.includes(entry.entry_status)
  ).length;
  const maxEntries = contest?.max_entries_per_user ?? 1;
  const remaining = Math.max(0, maxEntries - usedCount - items.length);

  const { data: categoriesResponse, isLoading: categoriesLoading } = useGetAllCategoriesQuery();
  const categories = categoriesResponse?.categories || [];

  const { data: tagSuggestions = [] } = useSearchTagsQuery(
    { query: tagSearch, limit: 8, approvedOnly: true },
    { skip: tagSearch.length < 2 }
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      category: '',
      originalIp: '',
      tagsInput: '',
    },
  });

  // ─── File Handling ───
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    e.target.value = '';
    if (!selected.length) return;

    const problems: string[] = [];
    const accepted: File[] = [];

    for (const f of selected) {
      if (!VALID_FILE_TYPES.includes(f.type)) {
        problems.push(`${f.name}: unsupported file type`);
        continue;
      }
      if (f.size > MAX_FILE_SIZE) {
        problems.push(`${f.name}: exceeds 5MB`);
        continue;
      }
      accepted.push(f);
    }

    let toAdd = accepted;
    if (accepted.length > remaining) {
      toAdd = accepted.slice(0, remaining);
      problems.push(
        `${accepted.length - toAdd.length} file(s) skipped — only ${remaining} entr${remaining === 1 ? 'y' : 'ies'} left for this contest`
      );
    }

    setFileError(problems.length ? problems.join('; ') : null);

    const newItems: BatchItem[] = toAdd.map((f) => ({
      id: crypto.randomUUID(),
      file: f,
      previewUrl: URL.createObjectURL(f),
      title: f.name.replace(/\.[^/.]+$/, ''),
      status: 'pending',
    }));

    setItems((prev) => [...prev, ...newItems]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((it) => it.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((it) => it.id !== id);
    });
  };

  const updateItemTitle = (id: string, title: string) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, title } : it)));
  };

  const handleAddTag = (tagName: string) => {
    if (!selectedTags.includes(tagName) && tagName.trim()) {
      setSelectedTags((prev) => [...prev, tagName.trim()]);
    }
    setTagSearch('');
    setOpenTagPopover(false);
  };

  const removeTag = (tagToRemove: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  // ─── Batch Submission ───
  const runBatch = async (targets: BatchItem[], values: FormValues) => {
    setIsBatchSubmitting(true);
    setProgress({ done: 0, total: targets.length });
    let failedCount = 0;

    for (const target of targets) {
      setItems((prev) =>
        prev.map((it): BatchItem => (it.id === target.id ? { ...it, status: 'uploading', error: undefined } : it))
      );

      try {
        const formData = new FormData();
        formData.append('file', target.file);
        formData.append('title', target.title.trim() || target.file.name);
        formData.append('description', values.description?.trim() || '');
        formData.append('category_ids', JSON.stringify([values.category]));

        const artworkResult = (await createArtwork(formData).unwrap()) as any;
        const artwork = artworkResult.artwork;
        if (!artwork?.id) {
          throw new Error('Artwork created successfully but no ID was returned');
        }

        if (selectedTags.length > 0) {
          for (const tagName of selectedTags) {
            await addTagToArtwork({ artworkId: artwork.id, name: tagName }).unwrap();
          }
        }

        const payload: { contestId: string; artworkId: string; submissionNotes?: string | null } = {
          contestId: contestId!,
          artworkId: artwork.id,
        };
        if (values.originalIp?.trim()) {
          payload.submissionNotes = `Fandom / Original IP: ${values.originalIp.trim()}`;
        }

        await submitContestEntry(payload).unwrap();

        setItems((prev) => prev.map((it) => (it.id === target.id ? { ...it, status: 'success' } : it)));
      } catch (err: any) {
        failedCount += 1;
        setItems((prev) =>
          prev.map((it) =>
            it.id === target.id
              ? {
                  ...it,
                  status: 'error',
                  error: err?.data?.error || err?.data?.message || 'Failed to submit entry',
                }
              : it
          )
        );
      }

      setProgress((p) => ({ ...p, done: p.done + 1 }));
    }

    setIsBatchSubmitting(false);
    return { failedCount };
  };

  const onSubmit = async (values: FormValues) => {
    if (items.length === 0) {
      setFileError('Please add at least one image');
      return;
    }

    if (!contestId) {
      setFileError('Missing contest information. Please start submission from a contest page.');
      return;
    }

    const targets = items.filter((it) => it.status !== 'success');
    const { failedCount } = await runBatch(targets, values);

    if (failedCount === 0) {
      setTimeout(() => {
        router.push(`/${artistBase}/my-artworks`);
      }, 1800);
    } else {
      form.setError('root', {
        message: `${failedCount} ${failedCount === 1 ? 'entry' : 'entries'} failed to submit. Fix and resubmit to retry just those.`,
      });
    }
  };

  const failedItems = items.filter((it) => it.status === 'error');
  const capReached = remaining <= 0 && items.length === 0;

  if (!contestId) {
    return (
      <div className="container py-12 max-w-3xl mx-auto text-center">
        <Alert variant="destructive">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Missing Contest</AlertTitle>
          <AlertDescription>
            This page must be accessed from a contest. Please go back to a contest page and click
            "Submit Entry".
          </AlertDescription>
        </Alert>
        <Button className="mt-6" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  if (contestLoading || contestError) {
    return (
      <div className="container py-12 max-w-3xl mx-auto">
        {contestLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <Alert variant="destructive">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle>Contest not found</AlertTitle>
            <AlertDescription>
              The contest you're trying to submit to could not be loaded.
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Submit Entry</h1>
      <p className="text-xl font-semibold text-primary mb-6">{contest?.title}</p>

      {contest && (
        <div className="mb-8 space-y-2 text-sm text-muted-foreground">
          <p>Submissions close: {new Date(contest.submission_end_date).toLocaleDateString()}</p>
          <p>
            You've used {usedCount} of {maxEntries} entries in this contest
          </p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Upload Your Fan Art</CardTitle>
          <CardDescription>
            All entries are reviewed for compliance with contest rules and IP guidelines. Select
            multiple images to submit several entries at once.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* ─── Image Upload ─── */}
              <div className="space-y-3">
                <FormLabel>
                  Artwork Files <span className="text-red-500">*</span> (max 5MB each)
                </FormLabel>

                {capReached ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Entry limit reached</AlertTitle>
                    <AlertDescription>
                      You've already used all {maxEntries} entries allowed for this contest.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    {items.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {items.map((item) => (
                          <div key={item.id} className="relative border rounded-lg overflow-hidden">
                            <div className="aspect-square relative bg-muted">
                              {item.file.type === 'application/pdf' ? (
                                <div className="flex flex-col items-center justify-center gap-2 w-full h-full text-muted-foreground">
                                  <FileText className="h-10 w-10" />
                                  <span className="text-xs">PDF</span>
                                </div>
                              ) : (
                                <img
                                  src={item.previewUrl}
                                  alt={item.title}
                                  className="object-cover w-full h-full"
                                />
                              )}
                              {item.status === 'uploading' && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                                </div>
                              )}
                              {item.status === 'success' && (
                                <div className="absolute top-1 right-1 bg-white rounded-full">
                                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                                </div>
                              )}
                              {!isBatchSubmitting && item.status !== 'success' && (
                                <button
                                  type="button"
                                  onClick={() => removeItem(item.id)}
                                  className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 rounded-full p-1"
                                >
                                  <X className="h-3 w-3 text-white" />
                                </button>
                              )}
                            </div>
                            <Input
                              value={item.title}
                              onChange={(e) => updateItemTitle(item.id, e.target.value)}
                              disabled={item.status === 'success' || isBatchSubmitting}
                              placeholder="Title"
                              className="border-0 rounded-none text-xs h-8 focus-visible:ring-0"
                            />
                            {item.status === 'error' && (
                              <p className="text-[11px] text-red-600 px-2 pb-1">{item.error}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {remaining > 0 && !isBatchSubmitting && (
                      <div
                        className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition border-gray-300 hover:border-primary/70 hover:bg-gray-50/70"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
                          multiple
                          className="hidden"
                          onChange={handleFileChange}
                        />
                        <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                        <p className="text-sm font-medium mt-2">
                          {items.length === 0
                            ? 'Click or drag & drop your artwork (select multiple files)'
                            : `Add more (${remaining} left)`}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          JPEG, PNG, GIF, WEBP, or PDF • max 5MB each
                        </p>
                      </div>
                    )}
                  </>
                )}
                {fileError && <p className="text-sm text-red-600 font-medium">{fileError}</p>}
              </div>

              <Separator />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Medium: digital • Time taken: 20 hours • Tools: Procreate, iPad Pro..."
                        className="min-h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Applied to every entry in this batch.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categoriesLoading ? (
                          <div className="py-2 px-4 text-sm text-muted-foreground">
                            Loading categories...
                          </div>
                        ) : (
                          categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Fandom / Original IP */}
              <FormField
                control={form.control}
                name="originalIp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fandom / Original IP *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Marvel, Spider-Verse, Original Character, etc."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Used to help moderators and viewers understand the context
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tags */}
              <div className="space-y-2">
                <FormLabel>Tags (optional)</FormLabel>
                <Popover open={openTagPopover} onOpenChange={setOpenTagPopover}>
                  <PopoverTrigger asChild>
                    <div className="border rounded-md p-2 min-h-[42px] flex flex-wrap gap-2 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                      {selectedTags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                          {tag}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeTag(tag);
                            }}
                            className="rounded-full hover:bg-muted p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}

                      <Input
                        placeholder="Search or add tags..."
                        value={tagSearch}
                        onChange={(e) => {
                          setTagSearch(e.target.value);
                          setOpenTagPopover(true);
                        }}
                        onFocus={() => setOpenTagPopover(true)}
                        className="border-0 shadow-none focus-visible:ring-0 p-0 h-8 flex-1 min-w-[180px]"
                      />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[var(--radix-popover-trigger-width)] p-0"
                    align="start"
                  >
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Search tags..."
                        value={tagSearch}
                        onValueChange={setTagSearch}
                      />
                      <CommandEmpty>No matching tags found.</CommandEmpty>
                      <CommandGroup>
                        {tagSuggestions.map((tag) => (
                          <CommandItem key={tag.id} onSelect={() => handleAddTag(tag.name)}>
                            {tag.name}
                          </CommandItem>
                        ))}
                        {tagSearch.trim() &&
                          !tagSuggestions.some(
                            (t) => t.name.toLowerCase() === tagSearch.trim().toLowerCase()
                          ) && (
                            <CommandItem
                              onSelect={() => handleAddTag(tagSearch.trim())}
                              className="text-primary font-medium"
                            >
                              + Create new tag: "{tagSearch.trim()}"
                            </CommandItem>
                          )}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-muted-foreground">
                  Select from suggestions or type a new tag and press enter
                </p>
              </div>

              {/* Root form error */}
              {form.formState.errors.root && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Some entries failed</AlertTitle>
                  <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isBatchSubmitting || items.length === 0 || form.formState.isSubmitting}
              >
                {isBatchSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting {progress.done} of {progress.total}…
                  </>
                ) : failedItems.length > 0 ? (
                  `Retry ${failedItems.length} Failed`
                ) : (
                  `Submit ${items.length || ''} ${items.length === 1 ? 'Entry' : 'Entries'}`.trim()
                )}
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="text-xs text-muted-foreground flex flex-col items-start gap-1">
          <p>
            By submitting, you confirm this is your original work and complies with the contest
            rules and our IP guidelines.
          </p>
          <p>Entries are moderated — approval may take 1–3 days.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
