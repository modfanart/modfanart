'use client';

import { useState } from 'react';
import { Plus, Search, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
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
import { useToast } from '@/components/ui/use-toast';
import { StatusBadge } from '@/components/marketplace/status-badge';
import {
  getApiErrorMessage,
  useCreateFeeRuleMutation,
  useCreatePrintProviderMutation,
  useGetAdminPrintProvidersQuery,
  useGetAdminProductsQuery,
  useGetAdminReviewsQuery,
  useGetAdminSellersQuery,
  useGetFeeRulesQuery,
  useRemoveAdminReviewMutation,
  useSetAdminProductStatusMutation,
  useSetAdminSellerStatusMutation,
  useUpdateFeeRuleMutation,
  useUpdatePrintProviderMutation,
  type AdminProduct,
  type AdminSeller,
  type FeeRule,
  type FulfillmentType,
  type IntegrationType,
  type MerchStatus,
  type SellerStatus,
} from '@/services/api/marketplaceApi';
import {
  FULFILLMENT_LABEL,
  MERCH_STATUS,
  PRODUCT_TYPES,
  SELLER_STATUS,
  formatDate,
  formatMoney,
  titleCase,
} from '@/lib/marketplace/format';

const ALL = 'all';
const NONE = 'none';

function useFail() {
  const { toast } = useToast();

  return (err: unknown) =>
    toast({ title: 'Action failed', description: getApiErrorMessage(err), variant: 'destructive' });
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">{children}</p>
  );
}

// ───────────────────────── products ─────────────────────────

const PRODUCT_ACTIONS: Record<string, { label: string; to: MerchStatus; confirm?: string }[]> = {
  published: [
    { label: 'Suspend', to: 'suspended', confirm: 'Pull this listing from the marketplace?' },
    { label: 'Archive', to: 'archived' },
  ],
  suspended: [
    { label: 'Reinstate', to: 'published' },
    { label: 'Archive', to: 'archived' },
  ],
  draft: [{ label: 'Archive', to: 'archived' }],
  rejected: [{ label: 'Archive', to: 'archived' }],
  archived: [{ label: 'Restore to draft', to: 'draft' }],
};

export function AdminProducts() {
  const { toast } = useToast();
  const fail = useFail();
  const [status, setStatus] = useState<MerchStatus | typeof ALL>(ALL);
  const [search, setSearch] = useState('');
  const [term, setTerm] = useState('');

  const { data, isLoading } = useGetAdminProductsQuery({
    ...(status === ALL ? {} : { status }),
    ...(term ? { search: term } : {}),
    limit: 100,
  });
  const [setProductStatus, { isLoading: busy }] = useSetAdminProductStatusMutation();

  const act = (p: AdminProduct, to: MerchStatus, confirm?: string) => {
    if (confirm && !window.confirm(confirm)) return;

    setProductStatus({ id: p.id, status: to })
      .unwrap()
      .then(() => toast({ title: `Product ${MERCH_STATUS[to].label.toLowerCase()}` }))
      .catch(fail);
  };

  const count = (s: string) => data?.counts.find((c) => c.status === s)?.count ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setTerm(search.trim());
          }}
        >
          <Input
            aria-label="Search products"
            placeholder="Search title, seller or brand"
            className="w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button type="submit" variant="outline" size="icon" aria-label="Search">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
          <SelectTrigger className="w-52" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All statuses</SelectItem>
            {(Object.keys(MERCH_STATUS) as MerchStatus[]).map((s) => (
              <SelectItem key={s} value={s}>
                {MERCH_STATUS[s].label} ({count(s)})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : !data?.products.length ? (
        <Empty>No products match.</Empty>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Seller</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Price (USD)</TableHead>
                <TableHead>Sold</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <span className="font-medium">{p.title}</span>
                    <br />
                    <span className="text-xs text-muted-foreground">
                      {p.artwork_title ? `Artwork: ${p.artwork_title}` : 'Standalone'}
                      {p.license_id && ' · licensed'}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">
                    {p.brand_name ?? p.seller_username ?? '—'}
                    {p.brand_name && (
                      <>
                        <br />
                        <span className="text-xs text-muted-foreground">by {p.seller_username}</span>
                      </>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {titleCase(p.base_product_type)}
                    <br />
                    {FULFILLMENT_LABEL[p.fulfillment_type]}
                  </TableCell>
                  <TableCell>
                    {p.min_price_usd_cents == null
                      ? '—'
                      : p.max_price_usd_cents === p.min_price_usd_cents
                        ? formatMoney(p.min_price_usd_cents)
                        : `${formatMoney(p.min_price_usd_cents)} – ${formatMoney(p.max_price_usd_cents)}`}
                  </TableCell>
                  <TableCell>{p.units_sold}</TableCell>
                  <TableCell>
                    <StatusBadge map={MERCH_STATUS} status={p.status} />
                  </TableCell>
                  <TableCell>{formatDate(p.updated_at)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap justify-end gap-1">
                      {(PRODUCT_ACTIONS[p.status] ?? []).map((a) => (
                        <Button
                          key={a.to}
                          size="sm"
                          variant={a.to === 'published' ? 'default' : 'outline'}
                          disabled={busy}
                          onClick={() => act(p, a.to, a.confirm)}
                        >
                          {a.label}
                        </Button>
                      ))}
                      {p.status === 'pending_review' && (
                        <span className="text-xs text-muted-foreground">Decide in Moderation</span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

// ───────────────────────── sellers ─────────────────────────

export function AdminSellers() {
  const { toast } = useToast();
  const fail = useFail();
  const [status, setStatus] = useState<SellerStatus | typeof ALL>(ALL);
  const [search, setSearch] = useState('');
  const [term, setTerm] = useState('');

  const { data: sellers, isLoading } = useGetAdminSellersQuery({
    ...(status === ALL ? {} : { status }),
    ...(term ? { search: term } : {}),
  });
  const [setSellerStatus, { isLoading: busy }] = useSetAdminSellerStatusMutation();

  const act = (s: AdminSeller, next: Exclude<SellerStatus, 'pending'>) => {
    let notes: string | undefined;

    if (next === 'suspended') {
      if (
        !window.confirm(
          `Suspend ${s.display_name}? Their live listings come off the marketplace until they are approved again.`
        )
      )
        return;
      notes = window.prompt('Note for the seller (optional):') ?? undefined;
    } else if (next === 'rejected') {
      notes = window.prompt('Reason for rejecting (shown to the seller):') ?? undefined;
    }

    setSellerStatus({ id: s.id, status: next, ...(notes ? { notes } : {}) })
      .unwrap()
      .then(() => toast({ title: `Seller ${next}` }))
      .catch(fail);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setTerm(search.trim());
          }}
        >
          <Input
            aria-label="Search sellers"
            placeholder="Search name, username or email"
            className="w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button type="submit" variant="outline" size="icon" aria-label="Search">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
          <SelectTrigger className="w-48" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All sellers</SelectItem>
            {(Object.keys(SELLER_STATUS) as SellerStatus[]).map((s) => (
              <SelectItem key={s} value={s}>
                {SELLER_STATUS[s].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : !sellers?.length ? (
        <Empty>No sellers here.</Empty>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Seller</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Gross sales</TableHead>
                <TableHead>Stripe</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sellers.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <span className="font-medium">{s.display_name}</span>
                    <br />
                    <span className="text-xs text-muted-foreground">
                      {s.username} · {s.email}
                    </span>
                    {s.notes && <p className="mt-1 max-w-xs text-xs text-muted-foreground">Note: {s.notes}</p>}
                  </TableCell>
                  <TableCell>
                    <StatusBadge map={SELLER_STATUS} status={s.status} />
                  </TableCell>
                  <TableCell className="text-sm">
                    {s.products_live} live / {s.products_total} total
                  </TableCell>
                  <TableCell>{formatMoney(s.gross_cents)}</TableCell>
                  <TableCell>
                    {s.stripe_connected ? (
                      <Badge variant="secondary">Connected</Badge>
                    ) : (
                      <span className="text-sm text-destructive">Not connected</span>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(s.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      {s.status !== 'approved' && (
                        <Button size="sm" disabled={busy} onClick={() => act(s, 'approved')}>
                          {s.status === 'suspended' ? 'Reinstate' : 'Approve'}
                        </Button>
                      )}
                      {s.status === 'pending' && (
                        <Button size="sm" variant="outline" disabled={busy} onClick={() => act(s, 'rejected')}>
                          Reject
                        </Button>
                      )}
                      {s.status === 'approved' && (
                        <Button size="sm" variant="outline" disabled={busy} onClick={() => act(s, 'suspended')}>
                          Suspend
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

// ───────────────────────── settings ─────────────────────────

export function AdminSettings() {
  return (
    <div className="space-y-8">
      <FeeRules />
      <PrintProviders />
    </div>
  );
}

const bpsToPercent = (bps: number) => (bps / 100).toFixed(2).replace(/\.?0+$/, '');
const percentToBps = (v: string) => Math.round(parseFloat(v) * 100);

function scopeLabel(r: Pick<FeeRule, 'fulfillment_type' | 'base_product_type'>) {
  if (!r.fulfillment_type) return 'Digital licences (default)';

  return `${FULFILLMENT_LABEL[r.fulfillment_type]} · ${r.base_product_type ? titleCase(r.base_product_type) : 'All product types'}`;
}

function FeeRules() {
  const { toast } = useToast();
  const fail = useFail();
  const { data: rules, isLoading } = useGetFeeRulesQuery();
  const [create, { isLoading: creating }] = useCreateFeeRuleMutation();
  const [update] = useUpdateFeeRuleMutation();

  const [fulfillment, setFulfillment] = useState<string>(NONE);
  const [productType, setProductType] = useState<string>(NONE);
  const [percent, setPercent] = useState('');

  const valid = percent !== '' && !Number.isNaN(parseFloat(percent)) && parseFloat(percent) >= 0 && parseFloat(percent) <= 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Platform fees</CardTitle>
        <CardDescription>
          The percentage MOD keeps from each sale. The most specific active rule wins: product type, then
          fulfilment type, then the default. A change applies to payouts created from now on, not to ones
          already generated.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : (
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applies to</TableHead>
                  <TableHead>Fee %</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules?.map((r) => (
                  <FeeRuleRow key={r.id} rule={r} onSave={(bps) =>
                    update({ id: r.id, fee_bps: bps }).unwrap().then(() => toast({ title: 'Fee updated' })).catch(fail)
                  } onToggle={(active) => update({ id: r.id, is_active: active }).unwrap().catch(fail)} />
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <form
          className="grid gap-3 rounded-md border bg-muted/30 p-4 sm:grid-cols-4"
          onSubmit={(e) => {
            e.preventDefault();
            create({
              fulfillment_type: fulfillment === NONE ? null : (fulfillment as FulfillmentType),
              base_product_type: fulfillment === NONE || productType === NONE ? null : productType,
              fee_bps: percentToBps(percent),
            })
              .unwrap()
              .then(() => {
                setPercent('');
                toast({ title: 'Fee rule added' });
              })
              .catch(fail);
          }}
        >
          <div>
            <Label>Fulfilment</Label>
            <Select value={fulfillment} onValueChange={(v) => { setFulfillment(v); if (v === NONE) setProductType(NONE); }}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>Digital licences</SelectItem>
                {(Object.keys(FULFILLMENT_LABEL) as FulfillmentType[]).map((t) => (
                  <SelectItem key={t} value={t}>
                    {FULFILLMENT_LABEL[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Product type</Label>
            <Select value={productType} onValueChange={setProductType} disabled={fulfillment === NONE}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>All types</SelectItem>
                {PRODUCT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {titleCase(t)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="fee-pct">Fee %</Label>
            <Input id="fee-pct" type="number" min="0" max="100" step="0.01" className="mt-1" value={percent} onChange={(e) => setPercent(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={!valid || creating}>
              <Plus className="mr-2 h-4 w-4" /> Add rule
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function FeeRuleRow({
  rule,
  onSave,
  onToggle,
}: {
  rule: FeeRule;
  onSave: (bps: number) => void;
  onToggle: (active: boolean) => void;
}) {
  const [pct, setPct] = useState(bpsToPercent(rule.fee_bps));
  const isDefault = !rule.fulfillment_type && !rule.base_product_type;
  const dirty = pct !== bpsToPercent(rule.fee_bps) && pct !== '' && !Number.isNaN(parseFloat(pct));

  return (
    <TableRow className={rule.is_active ? '' : 'opacity-60'}>
      <TableCell className="font-medium">{scopeLabel(rule)}</TableCell>
      <TableCell>
        <Input aria-label="Fee percent" type="number" min="0" max="100" step="0.01" className="h-8 w-24" value={pct} onChange={(e) => setPct(e.target.value)} />
      </TableCell>
      <TableCell>
        <Switch aria-label="Active" checked={rule.is_active} disabled={isDefault} onCheckedChange={onToggle} />
      </TableCell>
      <TableCell className="text-right">
        <Button size="sm" variant="outline" disabled={!dirty} onClick={() => onSave(percentToBps(pct))}>
          Save
        </Button>
      </TableCell>
    </TableRow>
  );
}

const INTEGRATIONS: IntegrationType[] = ['manual', 'printful', 'printify'];

function PrintProviders() {
  const { toast } = useToast();
  const fail = useFail();
  const { data: providers, isLoading } = useGetAdminPrintProvidersQuery();
  const [create, { isLoading: creating }] = useCreatePrintProviderMutation();
  const [update] = useUpdatePrintProviderMutation();

  const [name, setName] = useState('');
  const [integration, setIntegration] = useState<IntegrationType>('manual');
  const [config, setConfig] = useState('');

  const parseConfig = (): Record<string, unknown> | undefined | 'invalid' => {
    if (!config.trim()) return undefined;

    try {
      const v = JSON.parse(config);

      return v && typeof v === 'object' && !Array.isArray(v) ? v : 'invalid';
    } catch {
      return 'invalid';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Print providers</CardTitle>
        <CardDescription>
          Who prints and ships print-on-demand products. Providers are switched off rather than deleted, because
          existing products reference them. Credentials are write-only and are never shown again.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : !providers?.length ? (
          <Empty>No print providers yet.</Empty>
        ) : (
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Integration</TableHead>
                  <TableHead>Credentials</TableHead>
                  <TableHead>Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {providers.map((p) => (
                  <TableRow key={p.id} className={p.is_active ? '' : 'opacity-60'}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{titleCase(p.integration_type)}</TableCell>
                    <TableCell>{p.has_api_config ? 'Set' : 'Not set'}</TableCell>
                    <TableCell>
                      <Switch
                        aria-label={`${p.name} active`}
                        checked={p.is_active}
                        onCheckedChange={(v) => update({ id: p.id, is_active: v }).unwrap().catch(fail)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <form
          className="grid gap-3 rounded-md border bg-muted/30 p-4 sm:grid-cols-3"
          onSubmit={(e) => {
            e.preventDefault();
            const cfg = parseConfig();

            if (cfg === 'invalid') {
              toast({ title: 'Credentials must be a JSON object', variant: 'destructive' });
              return;
            }

            create({ name: name.trim(), integration_type: integration, ...(cfg ? { api_config: cfg } : {}) })
              .unwrap()
              .then(() => {
                setName('');
                setConfig('');
                toast({ title: 'Print provider added' });
              })
              .catch(fail);
          }}
        >
          <div>
            <Label htmlFor="pp-name">Name</Label>
            <Input id="pp-name" required className="mt-1" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>Integration</Label>
            <Select value={integration} onValueChange={(v) => setIntegration(v as IntegrationType)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INTEGRATIONS.map((i) => (
                  <SelectItem key={i} value={i}>
                    {titleCase(i)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="pp-cfg">Credentials (JSON, optional)</Label>
            <Input id="pp-cfg" className="mt-1 font-mono text-xs" placeholder='{"api_key":"…"}' value={config} onChange={(e) => setConfig(e.target.value)} />
          </div>
          <div className="sm:col-span-3">
            <Button type="submit" disabled={!name.trim() || creating}>
              <Plus className="mr-2 h-4 w-4" /> Add provider
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ───────────────────────── reviews ─────────────────────────

export function AdminReviews() {
  const { toast } = useToast();
  const fail = useFail();
  const [rating, setRating] = useState<string>(ALL);
  const { data: reviews, isLoading } = useGetAdminReviewsQuery(
    rating === ALL ? undefined : { rating: Number(rating) }
  );
  const [remove] = useRemoveAdminReviewMutation();

  return (
    <div className="space-y-4">
      <Select value={rating} onValueChange={setRating}>
        <SelectTrigger className="w-44" aria-label="Filter by rating">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All ratings</SelectItem>
          {[5, 4, 3, 2, 1].map((r) => (
            <SelectItem key={r} value={String(r)}>
              {r} star{r === 1 ? '' : 's'}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : !reviews?.length ? (
        <Empty>No reviews.</Empty>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Reviewer</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Review</TableHead>
                <TableHead>Posted</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.product_title ?? r.target_type}</TableCell>
                  <TableCell>{r.reviewer_username ?? '—'}</TableCell>
                  <TableCell>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</TableCell>
                  <TableCell className="max-w-sm text-sm">{r.body || <span className="text-muted-foreground">No text</span>}</TableCell>
                  <TableCell>{formatDate(r.created_at)}</TableCell>
                  <TableCell>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive"
                      aria-label="Remove review"
                      onClick={() => {
                        if (!window.confirm('Remove this review?')) return;
                        remove(r.id).unwrap().then(() => toast({ title: 'Review removed' })).catch(fail);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
