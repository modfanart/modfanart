'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
// RTK Query imports
// ────────────────────────────────────────────────
import { useCreateArtworkMutation } from '@/app/api/artworkApi';
import { useGetAllCategoriesQuery } from '@/app/api/categoriesApi';
import { useSearchTagsQuery, useAddTagToArtworkMutation } from '@/app/api/artworkTagsApi';

// ────────────────────────────────────────────────
// Zod Schema — adjusted slightly to match backend
// ────────────────────────────────────────────────
const formSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(500).optional(),
  category: z.string().min(1, 'Please select a category'),
  originalIp: z.string().min(2).max(100),
  tagsInput: z.string().optional(), // temporary — we handle tags separately
});

type FormValues = z.infer<typeof formSchema>;

export default function NewSubmissionPage() {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const [selectedTags, setSelectedTags] = useState<string[]>([]); // tag names or IDs
  const [tagSearch, setTagSearch] = useState('');
  const [openTagPopover, setOpenTagPopover] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [createArtwork, { isLoading: isSubmitting, error: submitError, isSuccess, data }] =
    useCreateArtworkMutation();

  const [addTagToArtwork] = useAddTagToArtworkMutation();

  // In NewSubmissionPage.tsx
  const { data: categoriesResponse, isLoading: categoriesLoading } = useGetAllCategoriesQuery();

  // This line now types correctly
  const categories = categoriesResponse?.categories || [];
  console.log('Fetched categories:', categories);
  // Tag suggestions
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

  // File handling
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    setFileError(null);

    if (!selected) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(selected.type)) {
      setFileError('Only JPEG, PNG, GIF, WEBP allowed');
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

  const onSubmit = async (values: FormValues) => {
    if (!file) {
      setFileError('Please upload an image');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', values.title.trim());
      formData.append('description', values.description?.trim() || '');
      formData.append('category_ids', JSON.stringify([values.category]));

      const result = await createArtwork(formData).unwrap();

      const createdArtwork = result.data;

      // ─── Guard: if no artwork returned (shouldn't happen on success) ───
      if (!createdArtwork?.id) {
        throw new Error('Artwork created but no ID returned');
      }

      // Now TypeScript knows createdArtwork is Artwork & has .id
      if (selectedTags.length > 0) {
        for (const tagName of selectedTags) {
          await addTagToArtwork({
            artworkId: createdArtwork.id,
            name: tagName,
          }).unwrap();
        }
      }

      // Safe to access .id
      setTimeout(() => {
        router.push(`/submissions/${createdArtwork.id}`);
      }, 1800);
    } catch (err: any) {
      console.error('Submission failed:', err);
      // You can set a submitError state here if you want to show it in UI
    }
  };

  return (
    <div className="container py-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Submit New Fan Art</h1>

      {isSuccess ? (
        <Alert className="mb-8 border-green-200 bg-green-50">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <AlertTitle>Submitted successfully!</AlertTitle>
          <AlertDescription>
            Your artwork is now in review. Redirecting to details page...
          </AlertDescription>
        </Alert>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Upload Your Artwork</CardTitle>
            <CardDescription>
              All submissions are reviewed for content and IP compliance.
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
                        <div className="relative mx-auto w-full max-w-sm aspect-video sm:aspect-square rounded-lg overflow-hidden border shadow-sm">
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
                      <div className="space-y-3 py-6">
                        <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Click or drag & drop</p>
                          <p className="text-xs text-muted-foreground mt-1">
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
                        <Input placeholder="Dragon Ball Z – Goku Ultra Instinct" {...field} />
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
                          placeholder="Medium: digital • Time taken: 14 hours • Tools: Clip Studio Paint ..."
                          className="min-h-28"
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
                            <SelectValue placeholder="Choose category..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categoriesLoading ? (
                            <div className="py-2 px-4 text-sm text-muted-foreground">
                              Loading...
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

                {/* Original IP / Fandom */}
                <FormField
                  control={form.control}
                  name="originalIp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fandom / Original IP *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Dragon Ball, Genshin Impact, Marvel, Original Character..."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Helps with filtering and tagging</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Tags with autocomplete */}
                <div className="space-y-2">
                  <FormLabel>Tags</FormLabel>
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
                          placeholder="Type to search or add tags..."
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
                        <CommandEmpty>No tags found.</CommandEmpty>
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
                    Press enter or select from suggestions (comma separated also works)
                  </p>
                </div>

                {/* ─── Submission feedback ─── */}
                {submitError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Submission failed</AlertTitle>
                    <AlertDescription>
                      {(submitError as any)?.data?.message ||
                        'Something went wrong. Please try again.'}
                    </AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={isSubmitting || !file}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Artwork'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>

          <CardFooter className="text-xs text-muted-foreground flex flex-col items-start gap-1">
            <p>
              By submitting, you confirm this is your original fan art and agree to our IP & Content
              Guidelines.
            </p>
            <p>Submissions are moderated — approval may take 1–3 days.</p>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
