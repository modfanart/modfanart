'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCreateProductMutation } from '@/services/api/merchApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toaster';
import { ArrowLeft, Loader2 } from 'lucide-react';
import type { FulfillmentType } from '@/services/types/merch';

const BASE_TYPES = [
  'tshirt',
  'hoodie',
  'mug',
  'poster',
  'canvas',
  'sticker',
  'phone_case',
  'tote',
  'other',
];

const FULFILLMENT: FulfillmentType[] = [
  'print_on_demand',
  'in_house_stock',
  'dropship',
];

export default function NewMerchProductPage() {
  const params = useParams();
  const sellerId = params.sellerId as string;
  const router = useRouter();
  const { toast } = useToast();
  const [createProduct, { isLoading }] = useCreateProductMutation();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [baseProductType, setBaseProductType] = useState('tshirt');
  const [fulfillmentType, setFulfillmentType] =
    useState<FulfillmentType>('print_on_demand');
  const [artworkId, setArtworkId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast({ title: 'Title is required', variant: 'destructive' });
      return;
    }
    try {
      const result = await createProduct({
        title: title.trim(),
        description: description.trim() || undefined,
        base_product_type: baseProductType,
        fulfillment_type: fulfillmentType,
        artwork_id: artworkId.trim() || null,
      }).unwrap();
      toast({ title: 'Product created as draft' });
      router.push(
        `/seller/${sellerId}/products/${result.product.id}/edit`
      );
    } catch (err: any) {
      toast({
        title: 'Create failed',
        description: err?.data?.error || 'Try again',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6 p-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/seller/${sellerId}/products`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Link>
      </Button>

      <div>
        <h1 className="text-2xl font-bold">New merch product</h1>
        <p className="text-sm text-muted-foreground">
          Creates a draft. Add variants and submit for review after saving.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border p-6">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Title *</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Cosmic Nebula Tee"
            required
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Description
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Base product type *
          </label>
          <Select value={baseProductType} onValueChange={setBaseProductType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BASE_TYPES.map((t) => (
                <SelectItem key={t} value={t} className="capitalize">
                  {t.replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Fulfillment type *
          </label>
          <Select
            value={fulfillmentType}
            onValueChange={(v) => setFulfillmentType(v as FulfillmentType)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FULFILLMENT.map((t) => (
                <SelectItem key={t} value={t} className="capitalize">
                  {t.replace(/_/g, ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Artwork ID (optional)
          </label>
          <Input
            value={artworkId}
            onChange={(e) => setArtworkId(e.target.value)}
            placeholder="UUID of licensed artwork"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Link a licensed artwork if this merch is based on one.
          </p>
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create draft
        </Button>
      </form>
    </div>
  );
}
