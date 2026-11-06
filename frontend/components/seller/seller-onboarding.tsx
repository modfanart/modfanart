'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { CheckCircle2, Clock, FileText, ShieldX, Trash2, Ban } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { FileUpload } from '@/components/ui/file-upload';
import { toast } from '@/components/ui/use-toast';

import {
  useGetMySellerProfileQuery,
  useSubmitSellerProfileMutation,
  useUploadKycDocumentMutation,
} from '@/services/api/sellerApi';
import type { SellerProfile, SellerProfileStatus } from '@/services/mocks/seller.fixtures';

// Kept in step with typical KYC document limits; adjust alongside the server.
const ACCEPTED_KYC_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_KYC_BYTES = 5 * 1024 * 1024; // 5MB

// Keys mirror SellerProfileStatus (seller_profiles.status CHECK constraint).
const STATUS_META: Record<
  SellerProfileStatus,
  { label: string; color: string; icon: React.ReactNode; blurb: string }
> = {
  pending: {
    label: 'Under review',
    color: 'bg-amber-100 text-amber-800 border-amber-300',
    icon: <Clock className="h-3.5 w-3.5" />,
    blurb: 'Your application is being reviewed. We will email you once a decision is made.',
  },
  approved: {
    label: 'Approved',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    blurb: 'You are approved to sell. Your Products, Orders and Payouts are now active.',
  },
  rejected: {
    label: 'Not approved',
    color: 'bg-red-100 text-red-800 border-red-300',
    icon: <ShieldX className="h-3.5 w-3.5" />,
    blurb: 'This application was not approved. Contact support if you think this is a mistake.',
  },
  suspended: {
    label: 'Suspended',
    color: 'bg-slate-200 text-slate-800 border-slate-300',
    icon: <Ban className="h-3.5 w-3.5" />,
    blurb: 'Your seller account is suspended. Contact support to resolve this.',
  },
};

const schema = z.object({
  display_name: z.string().min(2, { message: 'Minimum 2 characters' }).max(80),
  contact_email: z.string().email({ message: 'Invalid email address' }),
  contact_phone: z.string().max(20).optional().or(z.literal('')),
  description: z.string().max(500).optional().or(z.literal('')),
  payout_type: z.enum(['stripe', 'upi']),
  payout_detail: z.string().min(3, { message: 'Required' }).max(120),
});

type FormValues = z.infer<typeof schema>;

const STEPS = ['Profile', 'Payout', 'Verification', 'Review'] as const;

function StatusView({ profile }: { profile: SellerProfile }) {
  const meta = STATUS_META[profile.status];
  // Only `payout_ready` is persisted today; contact/documents are forward-compat
  // fields that the current backend does not return, so render them only if present.
  const payoutLabel = profile.payout_ready
    ? 'Ready'
    : profile.payout_method?.type
      ? `${profile.payout_method.type} (pending setup)`
      : 'Not set up';
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Seller application</h1>
        <p className="text-muted-foreground mt-1">Your verification status</p>
      </div>
      <Card className="border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-lg">{profile.display_name}</CardTitle>
            <Badge className={`${meta.color} flex items-center gap-1`}>
              {meta.icon}
              {meta.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p className="text-muted-foreground">{meta.blurb}</p>
          {profile.notes && profile.status !== 'pending' && (
            <p className="rounded-md border bg-muted/40 p-3">{profile.notes}</p>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Payout</p>
              <p className="font-medium capitalize">{payoutLabel}</p>
            </div>
            {profile.contact_email && (
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Contact</p>
                <p className="font-medium">{profile.contact_email}</p>
              </div>
            )}
          </div>
          {profile.documents && (
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                Documents
              </p>
              <p className="font-medium">
                {profile.documents.length} document
                {profile.documents.length === 1 ? '' : 's'} submitted
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function SellerOnboarding() {
  const { data: profile, isLoading } = useGetMySellerProfileQuery();
  const [submitProfile, { isLoading: isSubmitting }] = useSubmitSellerProfileMutation();
  const [uploadKyc, { isLoading: isUploading }] = useUploadKycDocumentMutation();

  const [step, setStep] = useState(0);
  const [documents, setDocuments] = useState<string[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      display_name: '',
      contact_email: '',
      contact_phone: '',
      description: '',
      payout_type: 'upi',
      payout_detail: '',
    },
    mode: 'onChange',
  });

  if (isLoading) {
    return <div className="py-16 text-center text-muted-foreground">Loading…</div>;
  }

  // An existing seller profile short-circuits the wizard, mirroring how the brand
  // settings status tab shows verification state instead of the signup form.
  if (profile) {
    return <StatusView profile={profile} />;
  }

  const fieldsForStep: Record<number, (keyof FormValues)[]> = {
    0: ['display_name', 'contact_email', 'contact_phone', 'description'],
    1: ['payout_type', 'payout_detail'],
  };

  const goNext = async () => {
    const fields = fieldsForStep[step];
    if (fields) {
      const ok = await form.trigger(fields);
      if (!ok) return;
    }
    if (step === 2 && documents.length === 0) {
      toast({
        title: 'Add a document',
        description: 'Upload at least one KYC document to continue.',
        variant: 'destructive',
      });
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleKycFile = async (file: File | null) => {
    if (!file) return;
    if (!ACCEPTED_KYC_TYPES.includes(file.type)) {
      toast({
        title: 'Unsupported file type',
        description: 'Please upload a PDF, JPG or PNG.',
        variant: 'destructive',
      });
      return;
    }
    if (file.size > MAX_KYC_BYTES) {
      toast({
        title: 'File too large',
        description: 'Maximum file size is 5MB.',
        variant: 'destructive',
      });
      return;
    }
    try {
      const { url } = await uploadKyc(file).unwrap();
      setDocuments((docs) => [...docs, url]);
      toast({ title: 'Document uploaded' });
    } catch (err: any) {
      toast({
        title: 'Upload failed',
        description: err?.data?.error || 'Failed to upload document.',
        variant: 'destructive',
      });
    }
  };

  const onSubmit = async (values: FormValues) => {
    if (documents.length === 0) {
      setStep(2);
      return;
    }
    try {
      await submitProfile({
        display_name: values.display_name.trim(),
        contact_email: values.contact_email.trim(),
        contact_phone: values.contact_phone?.trim() || null,
        description: values.description?.trim() || null,
        payout_method: { type: values.payout_type, detail: values.payout_detail.trim() },
        documents,
      }).unwrap();
      toast({ title: 'Application submitted', description: 'We will review it shortly.' });
    } catch (err: any) {
      toast({
        title: 'Submission failed',
        description: err?.data?.error || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const values = form.getValues();

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Become a seller</h1>
        <p className="text-muted-foreground mt-1">
          Step {step + 1} of {STEPS.length} · {STEPS[step]}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* STEP 1 — PROFILE */}
          {step === 0 && (
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="display_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seller display name</FormLabel>
                    <FormControl>
                      <Input placeholder="Shown to buyers on your products" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contact_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contact_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact phone (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="+91…" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>About your shop (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        className="min-h-[100px] resize-none"
                        placeholder="What do you sell?"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* STEP 2 — PAYOUT */}
          {step === 1 && (
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="payout_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payout method</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="upi">UPI</SelectItem>
                        <SelectItem value="stripe">Stripe</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="payout_detail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payout account</FormLabel>
                    <FormControl>
                      <Input placeholder="UPI id or Stripe account" {...field} />
                    </FormControl>
                    <FormDescription>Where we send your earnings.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* STEP 3 — KYC DOCUMENTS */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <p className="font-medium">Identity / KYC documents</p>
                <p className="text-sm text-muted-foreground">
                  Upload a government ID or business proof. PDF, JPG or PNG, up to 5MB each.
                </p>
              </div>
              <FileUpload
                accept={ACCEPTED_KYC_TYPES.join(',')}
                onChange={handleKycFile}
                disabled={isUploading}
              >
                {isUploading ? 'Uploading…' : 'Upload document'}
              </FileUpload>
              {documents.length > 0 && (
                <ul className="space-y-2">
                  {documents.map((url, i) => (
                    <li
                      key={url}
                      className="flex items-center justify-between rounded-md border p-2 text-sm"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <FileText className="h-4 w-4 shrink-0" />
                        <span className="truncate">Document {i + 1}</span>
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setDocuments((docs) => docs.filter((d) => d !== url))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* STEP 4 — REVIEW */}
          {step === 3 && (
            <div className="space-y-3 text-sm">
              <p className="font-medium">Review your application</p>
              <div className="rounded-md border divide-y">
                <div className="flex justify-between p-3">
                  <span className="text-muted-foreground">Display name</span>
                  <span className="font-medium">{values.display_name}</span>
                </div>
                <div className="flex justify-between p-3">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{values.contact_email}</span>
                </div>
                <div className="flex justify-between p-3">
                  <span className="text-muted-foreground">Payout</span>
                  <span className="font-medium capitalize">{values.payout_type}</span>
                </div>
                <div className="flex justify-between p-3">
                  <span className="text-muted-foreground">Documents</span>
                  <span className="font-medium">{documents.length}</span>
                </div>
              </div>
            </div>
          )}

          {/* NAV */}
          <div className="flex justify-between pt-2">
            <Button type="button" variant="outline" onClick={goBack} disabled={step === 0}>
              Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button type="button" onClick={goNext}>
                Continue
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting…' : 'Submit application'}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}

export default SellerOnboarding;
