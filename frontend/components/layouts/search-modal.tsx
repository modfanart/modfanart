'use client';

import { Search, X, Clock } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { useLazyGlobalSearchQuery } from '@/services/api/searchApi';

type SearchType = 'artwork' | 'user' | 'brand' | 'contest' | 'category' | 'tag' | undefined;

const TABS: Array<{ label: string; value: SearchType }> = [
  { label: 'All', value: undefined },
  { label: 'Artworks', value: 'artwork' },
  { label: 'Users', value: 'user' },
  { label: 'Brands', value: 'brand' },
  { label: 'Contests', value: 'contest' },
];

const MAX_RECENT_SEARCHES = 8;
const STORAGE_KEY = 'recent_searches';

const getRecentSearches = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

const saveRecentSearches = (searches: string[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
};

export function SearchModal() {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<SearchType>(undefined);

  const [triggerSearch, { data, isFetching, isLoading, isError }] = useLazyGlobalSearchQuery();

  // Load recent searches
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // Keyboard shortcut ⌘K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) return;

    const timeout = setTimeout(() => {
      triggerSearch({
        q: query.trim(),
        limit: 12,
        offset: 0,
        ...(activeTab && { type: activeTab }),
      });
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, activeTab, triggerSearch]);

  // Save to recent searches
  const handleSubmit = useCallback(() => {
    if (!query.trim()) return;

    setRecentSearches((prev) => {
      const filtered = prev.filter((p) => p.toLowerCase() !== query.toLowerCase());
      const updated = [query.trim(), ...filtered].slice(0, MAX_RECENT_SEARCHES);
      saveRecentSearches(updated);
      return updated;
    });
  }, [query]);

  const handleResultClick = (item: any) => {
    // TODO: Improve this routing logic later (especially for users)
    router.push(`/${item.type}/${item.id}`);
    setOpen(false);
  };

  const results = data?.results ?? [];

  return (
    <>
      {/* Trigger Button */}
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
        <Search className="h-5 w-5" />
      </Button>

      {/* Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          {/* Search Input */}
          <div className="border-b px-4 py-3 flex items-center gap-3">
            <Search className="h-5 w-5 text-muted-foreground" />

            <Input
              autoFocus
              placeholder="Search artworks, users, brands..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              className="border-0 focus-visible:ring-0 text-base"
            />

            <Button size="icon" variant="ghost" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 px-4 py-2 border-b overflow-x-auto">
            {TABS.map((tab) => (
              <Button
                key={tab.label}
                size="sm"
                variant={activeTab === tab.value ? 'default' : 'ghost'}
                onClick={() => setActiveTab(tab.value)}
                className="rounded-full whitespace-nowrap"
              >
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Content Area */}
          <div className="p-4 max-h-[60vh] overflow-y-auto">
            {/* Recent Searches */}
            {!query && (
              <div>
                <div className="flex justify-between mb-3">
                  <p className="text-xs text-muted-foreground">Recent Searches</p>
                  {recentSearches.length > 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setRecentSearches([]);
                        saveRecentSearches([]);
                      }}
                    >
                      Clear
                    </Button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((r) => (
                    <Badge
                      key={r}
                      variant="secondary"
                      className="cursor-pointer hover:bg-muted"
                      onClick={() => setQuery(r)}
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      {r}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Search Results */}
            {query && (
              <>
                {(isLoading || isFetching) && (
                  <p className="text-center text-muted-foreground py-10">Searching...</p>
                )}

                {isError && (
                  <p className="text-center text-red-500 py-10">
                    Something went wrong. Please try again.
                  </p>
                )}

                {!isLoading && !isFetching && results.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                    {results.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleResultClick(item)}
                        className="flex gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                      >
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-12 h-12 rounded-md object-cover flex-shrink-0"
                          />
                        )}

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.title}</p>
                          <p className="text-xs text-primary capitalize">{item.type}</p>
                          {item.subtitle && (
                            <p className="text-xs text-muted-foreground truncate">
                              {item.subtitle}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!isLoading && !isFetching && results.length === 0 && (
                  <p className="text-center text-muted-foreground py-10">
                    No results found for "{query}"
                  </p>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
