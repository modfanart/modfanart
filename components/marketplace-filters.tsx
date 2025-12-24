'use client';

import { useState, useEffect, useRef } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';

type Filters = {
  priceRange: number[];
  categories: string[];
  brands: string[];
};

interface MarketplaceFiltersProps {
  onFilterChange: (filters: Filters) => void;
}

export function MarketplaceFilters({ onFilterChange }: MarketplaceFiltersProps) {
  const [priceRange, setPriceRange] = useState<number[]>([0, 100]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const isInitialMount = useRef(true);

  // Available categories
  const categories = [
    { id: 'apparel', label: 'Apparel' },
    { id: 'posters', label: 'Posters & Prints' },
    { id: 'accessories', label: 'Accessories' },
    { id: 'stickers', label: 'Stickers' },
    { id: 'collectibles', label: 'Collectibles' },
    { id: 'digital', label: 'Digital Items' },
  ];

  // Popular brands/IPs
  const brands = [
    { id: 'marvel', label: 'Marvel' },
    { id: 'nintendo', label: 'Nintendo' },
    { id: 'fantasy', label: 'Fantasy Realms' },
    { id: 'anime', label: 'Anime Studio' },
    { id: 'scifi', label: 'Sci-Fi Universe' },
    { id: 'gaming', label: 'Classic Gaming' },
  ];

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    onFilterChange({
      priceRange,
      categories: selectedCategories,
      brands: selectedBrands,
    });
  }, [priceRange, selectedCategories, selectedBrands, onFilterChange]);

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    setSelectedCategories((prev) =>
      checked ? [...prev, categoryId] : prev.filter((id) => id !== categoryId)
    );
  };

  const handleBrandChange = (brandId: string, checked: boolean) => {
    setSelectedBrands((prev) =>
      checked ? [...prev, brandId] : prev.filter((id) => id !== brandId)
    );
  };

  const handlePriceChange = (value: number[]) => {
    setPriceRange(value);
  };

  const resetFilters = () => {
    setPriceRange([0, 100]);
    setSelectedCategories([]);
    setSelectedBrands([]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-medium">Filters</h3>
        <button onClick={resetFilters} className="text-sm text-primary hover:underline">
          Reset all filters
        </button>
      </div>

      <div>
        <h4 className="mb-2 text-sm font-medium">Price Range</h4>
        <Slider
          defaultValue={[0, 100]}
          max={100}
          step={1}
          value={priceRange}
          onValueChange={handlePriceChange}
          className="my-6"
        />
        <div className="flex items-center justify-between">
          <span className="text-sm">${priceRange[0]}</span>
          <span className="text-sm">${priceRange[1]}+</span>
        </div>
      </div>

      <Separator />

      <div>
        <h4 className="mb-2 text-sm font-medium">Categories</h4>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category.id}`}
                checked={selectedCategories.includes(category.id)}
                onCheckedChange={(checked) => handleCategoryChange(category.id, checked === true)}
              />
              <label
                htmlFor={`category-${category.id}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {category.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h4 className="mb-2 text-sm font-medium">Brands</h4>
        <div className="space-y-2">
          {brands.map((brand) => (
            <div key={brand.id} className="flex items-center space-x-2">
              <Checkbox
                id={`brand-${brand.id}`}
                checked={selectedBrands.includes(brand.id)}
                onCheckedChange={(checked) => handleBrandChange(brand.id, checked === true)}
              />
              <label
                htmlFor={`brand-${brand.id}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {brand.label}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
