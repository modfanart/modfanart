'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Save, Send, Trash2 } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { StatusBadge } from '@/components/marketplace/status-badge';
import { useGetMyArtworksQuery } from '@/services/api/artworkApi';
import {
  getApiErrorMessage,
  useAddMerchVariantMutation,
  useCreateMerchProductMutation,
  useDeleteMerchVariantMutation,
  useGetMerchProductQuery,
  useGetPrintProvidersQuery,
  useSubmitMerchForReviewMutation,
  useUpdateMerchProductMutation,
  useUpdateMerchVariantMutation,
  type FulfillmentType,
  type MerchVariant,
} from '@/services/api/marketplaceApi';
import { FULFILLMENT_LABEL, MERCH_STATUS, PRODUCT_TYPES, titleCase } from '@/lib/marketplace/format';
import type { SellerContext } from './seller-shell';

const NONE = 'none';
const toCents = (v: string) => Math.round(parseFloat(v) * 100);
const toMajor = (cents: number) => (cents / 100).toFixed(2);

// ─────────────────────────── create ───────────────────────────

export function ProductCreateForm({ ctx }: { ctx: SellerContext }) {
  const router = useRouter();
  const { toast } = useToast();
  const storeBase = `${ctx.basePath}/store`;

  const { data: providers } = useGetPrintProvidersQuery();
  const { data: artworkRes } = useGetMyArtworksQuery({ status: 'published', limit: 100 });
  const [create, { isLoading }] = useCreateMerchProductMutation();

  const [form, setForm] = useState({
    title: '',
    description: '',
    base_product_type: 'tshirt',
    fulfillment_type: 'print_on_demand' as FulfillmentType,
    print_provider_id: NONE,
    artwork_id: NONE,
  });
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const artworks = artworkRes?.artworks ?? [];
  const isPod = form.fulfillment_type === 'print_on_demand';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const product = await create({
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        base_product_type: form.base_product_type,
        fulfillment_type: form.fulfillment_type,
        print_provider_id: isPod && form.print_provider_id !== NONE ? form.print_provider_id : null,
        artwork_id: form.artwork_id !== NONE ? form.artwork_id : null,
        brand_id: ctx.brandId,
      }).unwrap();

      toast({ title: 'Draft created', description: 'Now add at least one variant.' });
      router.push(`${storeBase}/products/${product.id}`);
    } catch (err) {
      toast({
        title: "Couldn't create product",
        description: getApiErrorMessage(err),
        variant: 'destructive',
      });
    }
  };

  return (
    <form onSubmit={submit} className="max-w-2xl space-y-6">
      <Button variant="ghost" size="sm" asChild type="button">
        <Link href={`${storeBase}/products`}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Products
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>New product</CardTitle>
          <CardDescription>
            Start with the basics — you&apos;ll add sizes, colours and prices next.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <Label htmlFor="p-title">Title</Label>
            <Input id="p-title" required className="mt-1" value={form.title} onChange={(e) => set('title', e.target.value)} />
          </div>

          <div>
            <Label htmlFor="p-desc">Description</Label>
            <Textarea id="p-desc" rows={4} className="mt-1" value={form.description} onChange={(e) => set('description', e.target.value)} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Product type</Label>
              <Select value={form.base_product_type} onValueChange={(v) => set('base_product_type', v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {titleCase(t)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Fulfilment</Label>
              <Select
                value={form.fulfillment_type}
                onValueChange={(v) => set('fulfillment_type', v as FulfillmentType)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(FULFILLMENT_LABEL) as FulfillmentType[]).map((t) => (
                    <SelectItem key={t} value={t}>
                      {FULFILLMENT_LABEL[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isPod && (
            <div>
              <Label>Print provider</Label>
              <Select value={form.print_provider_id} onValueChange={(v) => set('print_provider_id', v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose a provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Choose a provider…</SelectItem>
                  {providers?.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-1 text-xs text-muted-foreground">Required for print-on-demand products.</p>
            </div>
          )}

          <div>
            <Label>Artwork to print (optional)</Label>
            <Select value={form.artwork_id} onValueChange={(v) => set('artwork_id', v)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>Standalone product</SelectItem>
                {artworks.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="mt-1 text-xs text-muted-foreground">
              Your own published artworks need no extra licence. Its thumbnail becomes the product image.
            </p>
          </div>

          <Button type="submit" disabled={isLoading || !form.title.trim() || (isPod && form.print_provider_id === NONE)}>
            {isLoading ? 'Creating…' : 'Create draft'}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}

// ─────────────────────────── edit ───────────────────────────

export function ProductEditor({ id, ctx }: { id: string; ctx: SellerContext }) {
  const { toast } = useToast();
  const storeBase = `${ctx.basePath}/store`;

  const { data: product, isLoading, isError } = useGetMerchProductQuery(id);
  const [update, { isLoading: saving }] = useUpdateMerchProductMutation();
  const [submitReview, { isLoading: submitting }] = useSubmitMerchForReviewMutation();

  const [draft, setDraft] = useState<{ title: string; description: string } | null>(null);

  const fail = (err: unknown) =>
    toast({ title: 'Action failed', description: getApiErrorMessage(err), variant: 'destructive' });

  if (isLoading) return <p className="text-muted-foreground">Loading product…</p>;
  if (isError || !product) return <p className="text-destructive">Product not found.</p>;

  const values = draft ?? { title: product.title, description: product.description ?? '' };
  const variants = product.variants ?? [];
  const canSubmit = ['draft', 'rejected'].includes(product.status);

  return (
    <div className="max-w-4xl space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href={`${storeBase}/products`}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Products
        </Link>
      </Button>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold">{product.title}</h2>
          <StatusBadge map={MERCH_STATUS} status={product.status} />
        </div>
        {canSubmit && (
          <Button
            disabled={submitting || variants.length === 0}
            onClick={() =>
              submitReview(product.id)
                .unwrap()
                .then(() => toast({ title: 'Submitted for review' }))
                .catch(fail)
            }
          >
            <Send className="mr-2 h-4 w-4" /> Submit for review
          </Button>
        )}
      </div>

      {product.status === 'pending_review' && (
        <Alert>
          <AlertTitle>In review</AlertTitle>
          <AlertDescription>
            Our team is checking this listing. It goes live on the marketplace once approved.
          </AlertDescription>
        </Alert>
      )}
      {product.status === 'rejected' && (
        <Alert variant="destructive">
          <AlertTitle>Rejected</AlertTitle>
          <AlertDescription>
            Update the listing and submit it for review again.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
          <CardDescription>
            {titleCase(product.base_product_type)} · {FULFILLMENT_LABEL[product.fulfillment_type]}
            {product.artwork_title && ` · Printing “${product.artwork_title}”`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="e-title">Title</Label>
            <Input
              id="e-title"
              className="mt-1"
              value={values.title}
              onChange={(e) => setDraft({ ...values, title: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="e-desc">Description</Label>
            <Textarea
              id="e-desc"
              rows={4}
              className="mt-1"
              value={values.description}
              onChange={(e) => setDraft({ ...values, description: e.target.value })}
            />
          </div>
          <Button
            disabled={!draft || saving || !values.title.trim()}
            onClick={() =>
              update({ id: product.id, title: values.title.trim(), description: values.description })
                .unwrap()
                .then(() => {
                  setDraft(null);
                  toast({ title: 'Saved' });
                })
                .catch(fail)
            }
          >
            <Save className="mr-2 h-4 w-4" /> Save details
          </Button>
        </CardContent>
      </Card>

      <VariantsCard
        productId={product.id}
        fulfillmentType={product.fulfillment_type}
        variants={variants}
      />
    </div>
  );
}

// ─────────────────────────── variants ───────────────────────────

function VariantsCard({
  productId,
  fulfillmentType,
  variants,
}: {
  productId: string;
  fulfillmentType: FulfillmentType;
  variants: MerchVariant[];
}) {
  const { toast } = useToast();
  const [add, { isLoading: adding }] = useAddMerchVariantMutation();
  const tracksStock = fulfillmentType === 'in_house_stock';

  const blank = {
    sku: '',
    size: '',
    color: '',
    material: '',
    price_inr: '',
    price_usd: '',
    stock_qty: '',
    print_file_url: '',
  };
  const [form, setForm] = useState(blank);
  const set = (k: keyof typeof blank, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const fail = (err: unknown) =>
    toast({ title: 'Action failed', description: getApiErrorMessage(err), variant: 'destructive' });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await add({
        productId,
        sku: form.sku.trim(),
        size: form.size.trim() || null,
        color: form.color.trim() || null,
        material: form.material.trim() || null,
        price_inr_cents: toCents(form.price_inr),
        price_usd_cents: toCents(form.price_usd),
        stock_qty: tracksStock && form.stock_qty !== '' ? parseInt(form.stock_qty, 10) : null,
        print_file_url: form.print_file_url.trim() || null,
      }).unwrap();
      setForm(blank);
      toast({ title: 'Variant added' });
    } catch (err) {
      fail(err);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Variants &amp; pricing</CardTitle>
        <CardDescription>
          Each size/colour combination is a variant with its own SKU and price in both currencies.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {variants.length > 0 && (
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Options</TableHead>
                  <TableHead>₹ INR</TableHead>
                  <TableHead>$ USD</TableHead>
                  {tracksStock && <TableHead>Stock</TableHead>}
                  <TableHead>Active</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {variants.map((v) => (
                  <VariantRow key={v.id} variant={v} productId={productId} tracksStock={tracksStock} />
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <form onSubmit={submit} className="space-y-4 rounded-md border bg-muted/30 p-4">
          <h3 className="text-sm font-medium">Add a variant</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <Label htmlFor="v-sku">SKU</Label>
              <Input id="v-sku" required className="mt-1" value={form.sku} onChange={(e) => set('sku', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="v-size">Size</Label>
              <Input id="v-size" className="mt-1" value={form.size} onChange={(e) => set('size', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="v-color">Colour</Label>
              <Input id="v-color" className="mt-1" value={form.color} onChange={(e) => set('color', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="v-material">Material</Label>
              <Input id="v-material" className="mt-1" value={form.material} onChange={(e) => set('material', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="v-inr">Price ₹ INR</Label>
              <Input id="v-inr" required type="number" min="0" step="0.01" className="mt-1" value={form.price_inr} onChange={(e) => set('price_inr', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="v-usd">Price $ USD</Label>
              <Input id="v-usd" required type="number" min="0" step="0.01" className="mt-1" value={form.price_usd} onChange={(e) => set('price_usd', e.target.value)} />
            </div>
            {tracksStock && (
              <div>
                <Label htmlFor="v-stock">Stock</Label>
                <Input id="v-stock" type="number" min="0" step="1" className="mt-1" value={form.stock_qty} onChange={(e) => set('stock_qty', e.target.value)} />
              </div>
            )}
            <div className="sm:col-span-2">
              <Label htmlFor="v-file">Image / print file URL</Label>
              <Input id="v-file" type="url" className="mt-1" placeholder="https://…" value={form.print_file_url} onChange={(e) => set('print_file_url', e.target.value)} />
            </div>
          </div>
          <Button type="submit" disabled={adding || !form.sku.trim() || form.price_inr === '' || form.price_usd === ''}>
            <Plus className="mr-2 h-4 w-4" /> {adding ? 'Adding…' : 'Add variant'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function VariantRow({
  variant,
  productId,
  tracksStock,
}: {
  variant: MerchVariant;
  productId: string;
  tracksStock: boolean;
}) {
  const { toast } = useToast();
  const [update, { isLoading }] = useUpdateMerchVariantMutation();
  const [remove] = useDeleteMerchVariantMutation();

  const [inr, setInr] = useState(toMajor(variant.price_inr_cents));
  const [usd, setUsd] = useState(toMajor(variant.price_usd_cents));
  const [stock, setStock] = useState(variant.stock_qty == null ? '' : String(variant.stock_qty));

  const dirty =
    inr !== toMajor(variant.price_inr_cents) ||
    usd !== toMajor(variant.price_usd_cents) ||
    stock !== (variant.stock_qty == null ? '' : String(variant.stock_qty));

  const fail = (err: unknown) =>
    toast({ title: 'Action failed', description: getApiErrorMessage(err), variant: 'destructive' });

  return (
    <TableRow>
      <TableCell className="font-mono text-xs">{variant.sku}</TableCell>
      <TableCell className="text-sm">
        {[variant.size, variant.color, variant.material].filter(Boolean).join(' · ') || '—'}
      </TableCell>
      <TableCell>
        <Input aria-label="Price INR" type="number" min="0" step="0.01" className="h-8 w-24" value={inr} onChange={(e) => setInr(e.target.value)} />
      </TableCell>
      <TableCell>
        <Input aria-label="Price USD" type="number" min="0" step="0.01" className="h-8 w-24" value={usd} onChange={(e) => setUsd(e.target.value)} />
      </TableCell>
      {tracksStock && (
        <TableCell>
          <Input aria-label="Stock" type="number" min="0" step="1" className="h-8 w-20" value={stock} onChange={(e) => setStock(e.target.value)} />
        </TableCell>
      )}
      <TableCell>
        <Switch
          aria-label="Active"
          checked={variant.is_active}
          onCheckedChange={(checked) =>
            update({ productId, variantId: variant.id, is_active: checked }).unwrap().catch(fail)
          }
        />
      </TableCell>
      <TableCell>
        <div className="flex justify-end gap-1">
          <Button
            size="sm"
            variant="outline"
            disabled={!dirty || isLoading}
            onClick={() =>
              update({
                productId,
                variantId: variant.id,
                price_inr_cents: toCents(inr),
                price_usd_cents: toCents(usd),
                ...(tracksStock ? { stock_qty: stock === '' ? null : parseInt(stock, 10) } : {}),
              })
                .unwrap()
                .then(() => toast({ title: 'Variant updated' }))
                .catch(fail)
            }
          >
            Save
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="text-destructive"
            aria-label={`Delete ${variant.sku}`}
            onClick={() => {
              if (!window.confirm(`Delete variant ${variant.sku}?`)) return;
              remove({ productId, variantId: variant.id }).unwrap().catch(fail);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
