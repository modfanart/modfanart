'use client';

import { Search, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { FulfillmentType, MerchFilters } from '@/services/api/marketplaceApi';
import { FULFILLMENT_LABEL, PRODUCT_TYPES, titleCase } from '@/lib/marketplace/format';

const ALL = 'all';

export function MarketplaceFilters({
  value,
  onChange,
}: {
  value: MerchFilters;
  onChange: (next: MerchFilters) => void;
}) {
  const set = (patch: Partial<MerchFilters>) => onChange({ ...value, ...patch });
  const dirty = Boolean(value.search || value.type || value.fulfillment_type);

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
      <div className="relative flex-1">
        <Label htmlFor="mp-search" className="sr-only">
          Search products
        </Label>
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="mp-search"
          placeholder="Search merch — tees, mugs, posters…"
          className="h-11 pl-10"
          value={value.search ?? ''}
          onChange={(e) => set({ search: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:flex">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Type</Label>
          <Select
            value={value.type ?? ALL}
            onValueChange={(v) => set({ type: v === ALL ? undefined : v })}
          >
            <SelectTrigger className="h-11 w-full lg:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All types</SelectItem>
              {PRODUCT_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {titleCase(t)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Fulfilment</Label>
          <Select
            value={value.fulfillment_type ?? ALL}
            onValueChange={(v) =>
              set({ fulfillment_type: v === ALL ? undefined : (v as FulfillmentType) })
            }
          >
            <SelectTrigger className="h-11 w-full lg:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Any</SelectItem>
              {(Object.keys(FULFILLMENT_LABEL) as FulfillmentType[]).map((t) => (
                <SelectItem key={t} value={t}>
                  {FULFILLMENT_LABEL[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Sort</Label>
          <Select
            value={value.sort ?? 'newest'}
            onValueChange={(v) => set({ sort: v as MerchFilters['sort'] })}
          >
            <SelectTrigger className="h-11 w-full lg:w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="title">Title A–Z</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {dirty && (
          <Button
            variant="ghost"
            className="h-11 self-end"
            onClick={() => onChange({ sort: value.sort })}
          >
            <X className="mr-1 h-4 w-4" /> Clear
          </Button>
        )}
      </div>
    </div>
  );
}
