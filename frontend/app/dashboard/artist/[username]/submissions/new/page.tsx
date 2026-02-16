// app/contests/submissions/new/page.tsx
// OR wherever your route is: app/submissions/new/page.tsx with contest query param

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2, Upload, AlertCircle, CheckCircle2, X } from 'lucide-react';

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
import { useGetContestQuery, useSubmitEntryMutation } from '@/services/api/contestsApi';

// ────────────────────────────────────────────────
// Zod Schema
// ────────────────────────────────────────────────
const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500).optional(),
  category: z.string().min(1, 'Please select a category'),
  originalIp: z.string().min(2, 'Fandom / Original IP is required').max(100),
  tagsInput: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewContestSubmissionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const contestId = searchParams.get('contest');

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagSearch, setTagSearch] = useState('');
  const [openTagPopover, setOpenTagPopover] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── API Mutations & Queries ───
  const [createArtwork, { isLoading: isCreatingArtwork }] = useCreateArtworkMutation();
  const [addTagToArtwork] = useAddTagToArtworkMutation();
  const [submitContestEntry, { isLoading: isSubmittingEntry }] = useSubmitEntryMutation();

  const {
    data: contest,
    isLoading: contestLoading,
    error: contestError,
  } = useGetContestQuery(contestId!, {
    skip: !contestId,
  });

  const { data: categoriesResponse, isLoading: categoriesLoading } = useGetAllCategoriesQuery();
  const categories = categoriesResponse?.categories || [];

  const { data: tagSuggestions = [] } = useSearchTagsQuery(
    { query: tagSearch, limit: 8, approvedOnly: true },
    { skip: tagSearch.length < 2 }
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      originalIp: '',
      tagsInput: '',
    },
  });

  // ─── File Handling ───
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    setFileError(null);

    if (!selected) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(selected.type)) {
      setFileError('Only JPEG, PNG, GIF, WEBP files are allowed');
      return;
    }

    if (selected.size > 5 * 1024 * 1024) {
      setFileError('File size must be ≤ 5MB');
      return;
    }

    setFile(selected);
    const url = URL.createObjectURL(selected);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
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

  // ─── Form Submission ───
  const onSubmit = async (values: FormValues) => {
    if (!file) {
      setFileError('Please upload an image');
      return;
    }

    if (!contestId) {
      setFileError('Missing contest information. Please start submission from a contest page.');
      return;
    }

    try {
      // 1. Create Artwork
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', values.title.trim());
      formData.append('description', values.description?.trim() || '');
      formData.append('category_ids', JSON.stringify([values.category]));
      // Optional: store original IP / fandom in artwork metadata if your backend supports it
      // formData.append('original_ip', values.originalIp);

      const artworkResult = (await createArtwork(formData).unwrap()) as any;
      const artwork = artworkResult.artwork;
      console.log('[DEBUG] Full artworkResult:', artworkResult);
      console.log('[DEBUG] artworkResult keys:', Object.keys(artworkResult || {}));
      console.log('[DEBUG] artworkResult.data:', artworkResult?.data);
      if (!artwork?.id) {
        console.error('[ERROR] No id found in artwork response', {
          fullResponse: artworkResult,
          extracted: artwork,
        });
        throw new Error('Artwork created successfully but no ID was returned');
      }

      console.log('[SUCCESS] Artwork ID:', artwork.id);

      if (!artwork?.id) {
        throw new Error('Artwork created successfully but no ID was returned');
      }

      // 2. Add Tags
      if (selectedTags.length > 0) {
        for (const tagName of selectedTags) {
          await addTagToArtwork({
            artworkId: artwork.id,
            name: tagName,
          }).unwrap();
        }
      }

      // 3. Submit to Contest
      await submitContestEntry({
        contestId,
        artworkId: artwork.id,
        submissionNotes: values.originalIp
          ? `Fandom / Original IP: ${values.originalIp.trim()}`
          : undefined,
      }).unwrap();

      // Success feedback + redirect
      // You can add a toast / full-page success here if preferred
      setTimeout(() => {
        router.push(`/opportunities/${contestId}`);
        // Alternative: router.push(`/contests/${contestId}/entries/${newEntryId}`) if your API returns entry
      }, 1800);
    } catch (err: any) {
      console.error('Contest submission failed:', err);
      // You can set a form-level error state here
      form.setError('root', {
        message: err?.data?.message || 'Failed to submit entry. Please try again.',
      });
    }
  };

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
          {contest.max_entries_per_user > 1 && (
            <p>You may submit up to {contest.max_entries_per_user} entries in this contest</p>
          )}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Upload Your Fan Art</CardTitle>
          <CardDescription>
            All entries are reviewed for compliance with contest rules and IP guidelines.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* ─── Image Upload ─── */}
              <div className="space-y-3">
                <FormLabel>
                  Artwork Image <span className="text-red-500">*</span> (max 5MB)
                </FormLabel>
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition
                    ${fileError ? 'border-red-400 bg-red-50/60' : 'border-gray-300 hover:border-primary/70 hover:bg-gray-50/70'}`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  {previewUrl ? (
                    <div className="space-y-4">
                      <div className="relative mx-auto w-full max-w-md aspect-video sm:aspect-square rounded-lg overflow-hidden border shadow-sm">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                      >
                        Change image
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3 py-10">
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                      <div>
                        <p className="text-base font-medium">Click or drag & drop your artwork</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          JPEG, PNG, GIF, WEBP • max 5MB
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                {fileError && <p className="text-sm text-red-600 font-medium">{fileError}</p>}
              </div>

              <Separator />

              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Spider-Man: Across the Multiverse – Final Battle"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                  <AlertTitle>Submission failed</AlertTitle>
                  <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={
                  isCreatingArtwork || isSubmittingEntry || !file || form.formState.isSubmitting
                }
              >
                {isCreatingArtwork || isSubmittingEntry ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting Entry...
                  </>
                ) : (
                  'Submit to Contest'
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
