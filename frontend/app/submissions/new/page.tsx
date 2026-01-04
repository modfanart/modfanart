'use client';

import type React from 'react';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';

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

// Define the form schema with Zod
const formSchema = z.object({
  title: z
    .string()
    .min(3, {
      message: 'Title must be at least 3 characters.',
    })
    .max(100, {
      message: 'Title must not exceed 100 characters.',
    }),
  description: z
    .string()
    .min(10, {
      message: 'Description must be at least 10 characters.',
    })
    .max(500, {
      message: 'Description must not exceed 500 characters.',
    }),
  category: z.string().refine((val) => val.length > 0, {
    message: 'Please select a category.',
  }),
  originalIp: z
    .string()
    .min(2, {
      message: 'Original IP must be at least 2 characters.',
    })
    .max(100, {
      message: 'Original IP must not exceed 100 characters.',
    }),
  tags: z.string().optional(),
});

// Define the categories
const categories = [
  { value: 'anime', label: 'Anime & Manga' },
  { value: 'gaming', label: 'Video Games' },
  { value: 'movies', label: 'Movies & TV' },
  { value: 'comics', label: 'Comics & Graphic Novels' },
  { value: 'books', label: 'Books & Literature' },
  { value: 'other', label: 'Other' },
];

export default function NewSubmissionPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      originalIp: '',
      tags: '',
    },
  });

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setFileError(null);

    if (!selectedFile) {
      setFile(null);
      setPreviewUrl(null);
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(selectedFile.type)) {
      setFileError('Please upload a valid image file (JPEG, PNG, GIF, or WEBP).');
      setFile(null);
      setPreviewUrl(null);
      return;
    }

    // Validate file size (5MB max)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setFileError('File size must not exceed 5MB.');
      setFile(null);
      setPreviewUrl(null);
      return;
    }

    setFile(selectedFile);

    // Create preview URL
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    // Clean up the preview URL when component unmounts
    return () => URL.revokeObjectURL(objectUrl);
  };

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Validate file
    if (!file) {
      setFileError('Please upload an image file.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', values.title);
      formData.append('description', values.description);
      formData.append('category', values.category);
      formData.append('originalIp', values.originalIp);

      // Process tags if provided
      if (values.tags) {
        const tagsArray = values.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0);

        formData.append('tags', JSON.stringify(tagsArray));
      }

      // Submit the form
      const response = await fetch('/api/submissions/create', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit artwork');
      }

      const data = await response.json();

      // Show success message
      setSubmitSuccess(true);

      // Redirect to submission details after a delay
      setTimeout(() => {
        router.push(`/submissions/${data.id}`);
      }, 2000);
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle file button click
  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Parse tags for display
  const renderTagBadges = () => {
    const tagsValue = form.watch('tags');
    if (!tagsValue) return null;

    const tagsArray = tagsValue
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    if (tagsArray.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {tagsArray.map((tag, index) => (
          <Badge key={index} variant="secondary">
            {tag}
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <div className="container py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Submit New Artwork</h1>

      {submitSuccess ? (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle>Success!</AlertTitle>
          <AlertDescription>
            Your artwork has been submitted successfully and is now being processed. You will be
            redirected to the submission details page shortly.
          </AlertDescription>
        </Alert>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Submit Your Fan Art</CardTitle>
            <CardDescription>
              Share your fan art with the community. All submissions will be reviewed for compliance
              with IP guidelines before being approved.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Image Upload */}
                <div className="space-y-2">
                  <FormLabel>Artwork Image</FormLabel>
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      fileError
                        ? 'border-red-400 bg-red-50'
                        : 'border-gray-300 hover:border-primary hover:bg-gray-50'
                    }`}
                    onClick={handleFileButtonClick}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={handleFileChange}
                    />

                    {previewUrl ? (
                      <div className="space-y-4">
                        <div className="relative w-full max-w-xs mx-auto aspect-square overflow-hidden rounded-md">
                          <img
                            src={previewUrl || '/placeholder.svg'}
                            alt="Preview"
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="flex justify-center">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFileButtonClick();
                            }}
                          >
                            Change Image
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                          <Upload className="h-6 w-6 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Click to upload or drag and drop</p>
                          <p className="text-xs text-gray-500">JPEG, PNG, GIF or WEBP (max. 5MB)</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {fileError && <p className="text-sm font-medium text-red-500">{fileError}</p>}
                </div>

                <Separator />

                {/* Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter a title for your artwork" {...field} />
                      </FormControl>
                      <FormDescription>A descriptive title for your fan art.</FormDescription>
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
                          placeholder="Describe your artwork..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Provide details about your artwork, inspiration, and techniques used.
                      </FormDescription>
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
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select the category that best fits your artwork.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Original IP */}
                <FormField
                  control={form.control}
                  name="originalIp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Original IP</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Naruto, Star Wars, Marvel" {...field} />
                      </FormControl>
                      <FormDescription>
                        The original intellectual property your fan art is based on.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Tags */}
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., digital art, character design, fanart"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Add tags separated by commas to help others find your artwork.
                      </FormDescription>
                      {renderTagBadges()}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Error message */}
                {submitError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{submitError}</AlertDescription>
                  </Alert>
                )}

                {/* Submit button */}
                <Button type="submit" className="w-full" disabled={isSubmitting}>
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

          <CardFooter className="flex flex-col space-y-4 text-sm text-gray-500">
            <p>
              By submitting your artwork, you agree to our Terms of Service and acknowledge that
              your submission will be reviewed for compliance with IP guidelines.
            </p>
            <p>
              If approved, your artwork may be licensed according to our platform's licensing terms.
            </p>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
