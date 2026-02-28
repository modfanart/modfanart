// app/submissions/new/page.tsx    (or app/artworks/new/page.tsx)

'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2, Upload, AlertCircle, X, Plus } from 'lucide-react';
import Image from 'next/image';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
import { useGetAllCategoriesQuery } from '@/services/api/categoriesApi'; // assuming you have this
import { useSearchTagsQuery, useAddTagToArtworkMutation } from '@/services/api/artworkTagsApi';
import { useGetContestQuery, useSubmitEntryMutation } from '@/services/api/contestsApi';
import { DashboardShell } from '@/components/dashboard-shell';

// ────────────────────────────────────────────────
// Zod Schema
// ────────────────────────────────────────────────
const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000)
    .optional(),
  category: z.string().min(1, 'Please select a category'),
  tagsInput: z.string().optional(),
  // originalIp / fandom can be moved here if needed for standalone too
});

type FormValues = z.infer<typeof formSchema>;

export default function NewArtworkPage() {
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

  // ─── API ───
  const [createArtwork, { isLoading: isCreating }] = useCreateArtworkMutation();
  const [addTagToArtwork] = useAddTagToArtworkMutation();
  const [submitContestEntry, { isLoading: isSubmittingEntry }] = useSubmitEntryMutation();

  const { data: contest, isLoading: contestLoading } = useGetContestQuery(contestId!, {
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
      tagsInput: '',
    },
  });

  // ─── File Preview & Validation ───
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    setFileError(null);

    if (!selected) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(selected.type)) {
      setFileError('Only JPEG, PNG, GIF, WEBP files are allowed');
      return;
    }

    if (selected.size > 10 * 1024 * 1024) {
      // 10MB max – adjust as needed
      setFileError('File size must be ≤ 10MB');
      return;
    }

    setFile(selected);
    const url = URL.createObjectURL(selected);
    setPreviewUrl(url);

    // Cleanup on unmount or new file
    return () => URL.revokeObjectURL(url);
  };

  const handleAddTag = (tagName: string) => {
    const trimmed = tagName.trim();
    if (trimmed && !selectedTags.includes(trimmed)) {
      setSelectedTags((prev) => [...prev, trimmed]);
    }
    setTagSearch('');
    setOpenTagPopover(false);
  };

  const removeTag = (tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
  };

  // ─── Submit ───
  const onSubmit = async (values: FormValues) => {
    if (!file) {
      setFileError('Please upload an image');
      form.setFocus('title'); // optional UX
      return;
    }

    try {
      // 1. Prepare FormData for artwork creation
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', values.title.trim());
      formData.append('description', values.description?.trim() || '');
      formData.append('category_ids', JSON.stringify([values.category]));

      // 2. Create Artwork
      const artworkRes = await createArtwork(formData).unwrap();
      const artworkId = artworkRes?.data?.id;

      if (!artworkId) {
        throw new Error('Artwork created but no ID returned');
      }

      // 3. Add tags
      if (selectedTags.length > 0) {
        for (const tagName of selectedTags) {
          await addTagToArtwork({ artworkId, name: tagName }).unwrap();
        }
      }

      // 4. If contestId present → auto-submit to contest
      let entrySuccess = false;
      if (contestId) {
        await submitContestEntry({
          contestId,
          artworkId,
          submissionNotes: values.description ? `Notes: ${values.description.trim()}` : undefined,
        }).unwrap();
        entrySuccess = true;
      }

      // Success → redirect
      const redirectTo = contestId ? `/contests/${contestId}` : `/artworks/${artworkId}`;

      router.push(redirectTo);

      // Optional: toast.success(entrySuccess ? "Entry submitted!" : "Artwork created!")
    } catch (err: any) {
      console.error('Submission failed:', err);
      form.setError('root', {
        message: err?.data?.message || 'Failed to create artwork. Please try again.',
      });
    }
  };

  // ─── Loading / Error States ───
  if (contestId && (contestLoading || !contest)) {
    return (
      <div className="container py-12 max-w-3xl mx-auto text-center">
        {contestLoading ? (
          <Loader2 className="h-10 w-10 animate-spin mx-auto" />
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
    <DashboardShell>
      <div className="container py-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">
          {contestId ? 'Submit Contest Entry' : 'Create New Artwork'}
        </h1>

        {contestId && contest && (
          <div className="mb-6">
            <p className="text-xl font-semibold text-primary">{contest.title}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Submissions close: {new Date(contest.submission_end_date).toLocaleDateString()}
            </p>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Upload Your Artwork</CardTitle>
            <CardDescription>
              {contestId
                ? 'Your entry will be submitted to the contest after upload.'
                : 'Create a new standalone artwork. You can submit it to contests later.'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* ─── Image Upload Section ─── */}
                <div className="space-y-4">
                  <FormLabel>
                    Artwork File <span className="text-red-500">*</span> (JPEG, PNG, GIF, WEBP • max
                    10MB)
                  </FormLabel>

                  <div
                    className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors
                    ${fileError ? 'border-red-400 bg-red-50/50' : 'border-border hover:border-primary/60 hover:bg-muted/50'}`}
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
                      <div className="space-y-6">
                        <div className="relative mx-auto max-w-md aspect-video sm:aspect-square rounded-lg overflow-hidden border shadow-sm">
                          <Image src={previewUrl} alt="Preview" fill className="object-contain" />
                        </div>
                        <div className="flex justify-center gap-4">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              fileInputRef.current?.click();
                            }}
                          >
                            Change Image
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive/90"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFile(null);
                              setPreviewUrl(null);
                              if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="py-12 space-y-4">
                        <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                        <div>
                          <p className="text-base font-medium">Click or drag & drop your artwork</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Supported: JPEG, PNG, GIF, WEBP • Maximum 10MB
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {fileError && <p className="text-sm text-destructive font-medium">{fileError}</p>}
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
                        <Input placeholder="e.g. Cyberpunk Samurai – Neon Nights" {...field} />
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
                          placeholder="Medium, tools used, inspiration, story behind the piece..."
                          className="min-h-32 resize-y"
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
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categoriesLoading ? (
                            <div className="py-4 px-6 text-sm text-muted-foreground">
                              Loading categories...
                            </div>
                          ) : categories.length === 0 ? (
                            <div className="py-4 px-6 text-sm text-muted-foreground">
                              No categories available
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

                {/* Tags */}
                <div className="space-y-3">
                  <FormLabel>Tags (optional – improve discoverability)</FormLabel>
                  <Popover open={openTagPopover} onOpenChange={setOpenTagPopover}>
                    <PopoverTrigger asChild>
                      <div className="border rounded-md p-3 min-h-[42px] flex flex-wrap gap-2 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                        {selectedTags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                            {tag}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeTag(tag);
                              }}
                              className="rounded hover:bg-muted p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}

                        <Input
                          placeholder="Search or add tags (e.g. cyberpunk, fanart, digital)"
                          value={tagSearch}
                          onChange={(e) => {
                            setTagSearch(e.target.value);
                            if (e.target.value.length >= 2) setOpenTagPopover(true);
                          }}
                          onFocus={() => setOpenTagPopover(true)}
                          className="border-0 shadow-none focus-visible:ring-0 p-0 h-8 flex-1 min-w-[200px]"
                        />
                      </div>
                    </PopoverTrigger>

                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                      <Command shouldFilter={false}>
                        <CommandInput
                          placeholder="Search existing tags..."
                          value={tagSearch}
                          onValueChange={setTagSearch}
                        />
                        <CommandEmpty>
                          {tagSearch.trim() ? (
                            <Button
                              variant="ghost"
                              className="w-full justify-start text-primary"
                              onClick={() => handleAddTag(tagSearch.trim())}
                            >
                              + Create new tag: "{tagSearch.trim()}"
                            </Button>
                          ) : (
                            'No tags found'
                          )}
                        </CommandEmpty>
                        <CommandGroup>
                          {tagSuggestions.map((tag) => (
                            <CommandItem
                              key={tag.id}
                              onSelect={() => handleAddTag(tag.name)}
                              className="cursor-pointer"
                            >
                              {tag.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <p className="text-xs text-muted-foreground">
                    Add up to 10 tags. Search existing or type a new one.
                  </p>
                </div>

                {/* Global form error */}
                {form.formState.errors.root && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
                  </Alert>
                )}

                {/* Submit */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={
                      isCreating ||
                      isSubmittingEntry ||
                      !file ||
                      form.formState.isSubmitting ||
                      categoriesLoading
                    }
                  >
                    {isCreating || isSubmittingEntry ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {contestId ? 'Submitting Entry...' : 'Creating Artwork...'}
                      </>
                    ) : contestId ? (
                      'Submit to Contest'
                    ) : (
                      'Create Artwork'
                    )}
                  </Button>

                  <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>

          <CardFooter className="text-xs text-muted-foreground flex flex-col items-start gap-2">
            <p>
              By uploading, you confirm this is your original work and complies with our content
              guidelines.
            </p>
            <p>Files are moderated — approval may take up to 72 hours.</p>
          </CardFooter>
        </Card>
      </div>
    </DashboardShell>
  );
}
