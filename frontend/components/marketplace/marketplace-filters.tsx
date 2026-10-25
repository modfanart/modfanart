'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface MarketplaceFiltersProps {
  baseType: string;
  onBaseTypeChange: (v: string) => void;
  sortBy: 'newest' | 'price_asc' | 'price_desc';
  onSortByChange: (v: 'newest' | 'price_asc' | 'price_desc') => void;
  baseTypes: readonly string[];
}

export function MarketplaceFilters({
  baseType,
  onBaseTypeChange,
  sortBy,
  onSortByChange,
  baseTypes,
}: MarketplaceFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Select value={baseType} onValueChange={onBaseTypeChange}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Product type" />
        </SelectTrigger>
        <SelectContent>
          {baseTypes.map((t) => (
            <SelectItem key={t} value={t} className="capitalize">
              {t === 'all' ? 'All types' : t.replace('_', ' ')}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={sortBy}
        onValueChange={(v) =>
          onSortByChange(v as 'newest' | 'price_asc' | 'price_desc')
        }
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest</SelectItem>
          <SelectItem value="price_asc">Price: Low to High</SelectItem>
          <SelectItem value="price_desc">Price: High to Low</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
