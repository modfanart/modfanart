'use client';

import { Search, X } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { useLazyGlobalSearchQuery } from '@/services/api/searchApi';

// ─────────────────────────────────────────────
// Search Tabs (must match backend types)
// ─────────────────────────────────────────────
const TABS = [
  { label: 'All', value: undefined },
  { label: 'Artworks', value: 'artwork' },
  { label: 'Users', value: 'user' },
  { label: 'Brands', value: 'brand' },
  { label: 'Contests', value: 'contest' },
  { label: 'Categories', value: 'category' },
  { label: 'Tags', value: 'tag' },
];

// ─────────────────────────────────────────────
// Recent Searches Config
// ─────────────────────────────────────────────
const MAX_RECENT_SEARCHES = 8;
const STORAGE_KEY = 'recent_searches';

// ─────────────────────────────────────────────
// Local Storage Helpers
// ─────────────────────────────────────────────
const getRecentSearches = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveRecentSearches = (searches: string[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
  } catch {}
};

// ─────────────────────────────────────────────
// Search Modal Component
// ─────────────────────────────────────────────
export function SearchModal() {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string | undefined>(undefined);

  const [triggerSearch, { data, isLoading, isFetching }] = useLazyGlobalSearchQuery();

  // ─────────────────────────────────────────────
  // Load recent searches
  // ─────────────────────────────────────────────
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // ─────────────────────────────────────────────
  // Keyboard shortcuts
  // CMD/CTRL + K → open
  // ESC → close
  // ─────────────────────────────────────────────
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }

      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // ─────────────────────────────────────────────
  // Debounced Search
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) return;

    const timer = setTimeout(() => {
      const params: any = {
        q: query.trim(),
        limit: 12,
        offset: 0,
      };

      if (activeTab) {
        params.type = activeTab;
      }

      triggerSearch(params, true);
    }, 400);

    return () => clearTimeout(timer);
  }, [query, activeTab, triggerSearch]);
  // ─────────────────────────────────────────────
  // Save Search
  // ─────────────────────────────────────────────
  const handleSearchSubmit = useCallback(() => {
    if (!query.trim()) return;

    setRecentSearches((prev) => {
      const trimmed = query.trim();

      const filtered = prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());

      const updated = [trimmed, ...filtered].slice(0, MAX_RECENT_SEARCHES);

      saveRecentSearches(updated);

      return updated;
    });
  }, [query]);

  // ─────────────────────────────────────────────
  // Clear Search History
  // ─────────────────────────────────────────────
  const handleClearHistory = () => {
    setRecentSearches([]);
    saveRecentSearches([]);
  };

  // ─────────────────────────────────────────────
  // Result Navigation
  // ─────────────────────────────────────────────
  const handleResultClick = (item: any) => {
    switch (item.type) {
      case 'artwork':
        router.push(`/artwork/${item.id}`);
        break;

      case 'user':
        router.push(`/user/${item.id}`);
        break;

      case 'brand':
        router.push(`/brand/${item.id}`);
        break;

      case 'contest':
        router.push(`/contest/${item.id}`);
        break;

      case 'category':
        router.push(`/category/${item.id}`);
        break;

      case 'tag':
        router.push(`/tag/${item.id}`);
        break;
    }

    setOpen(false);
  };

  return (
    <>
      {/* Search Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="text-gray-600 hover:text-gray-900"
      >
        {' '}
        <Search className="h-5 w-5" />{' '}
      </Button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur-sm animate-in fade-in duration-200">
          {/* Close */}
          <button
            onClick={() => setOpen(false)}
            className="absolute top-6 right-8 text-gray-600 hover:text-gray-900"
          >
            <X size={28} />
          </button>

          <div className="mx-auto mt-20 md:mt-24 w-full max-w-3xl lg:max-w-4xl px-5 sm:px-6">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 h-6 w-6" />

              <Input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearchSubmit();
                  }
                }}
                placeholder="Search artworks, users, brands, contests..."
                className="pl-12 h-14 text-lg rounded-xl border-gray-300 focus-visible:ring-2 focus-visible:ring-purple-500 shadow-sm"
              />
            </div>

            {/* Tabs */}
            <div className="flex gap-6 sm:gap-10 mt-8 border-b border-gray-200 text-sm font-medium overflow-x-auto">
              {TABS.map((tab) => (
                <button
                  key={tab.label}
                  onClick={() => setActiveTab(tab.value)}
                  className={`pb-3 whitespace-nowrap transition ${
                    activeTab === tab.value
                      ? 'border-b-2 border-purple-600 text-purple-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="mt-8 min-h-[40vh]">
              {/* Recent Searches */}
              {!query.trim() && (
                <div>
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="text-sm font-medium text-gray-500 tracking-wide">
                      RECENT SEARCHES
                    </h3>

                    {recentSearches.length > 0 && (
                      <button
                        onClick={handleClearHistory}
                        className="text-xs text-gray-500 hover:text-gray-700 underline"
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  {recentSearches.length === 0 ? (
                    <p className="text-gray-400 text-sm">No recent searches yet.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2.5">
                      {recentSearches.map((item) => (
                        <button
                          key={item}
                          onClick={() => setQuery(item)}
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm rounded-full"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Search Results */}
              {query.trim() && (
                <div>
                  {isLoading || isFetching ? (
                    <div className="text-center py-12 text-gray-500">
                      Searching for "{query}"...
                    </div>
                  ) : data && data.results.length > 0 ? (
                    <div className="space-y-6">
                      <p className="text-sm text-gray-600">
                        Found {data.total} results for "{query}"
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {data.results.slice(0, 9).map((item) => (
                          <div
                            key={`${item.type}-${item.id}`}
                            onClick={() => handleResultClick(item)}
                            className="p-4 border rounded-lg hover:border-purple-300 transition bg-white shadow-sm cursor-pointer"
                          >
                            <div className="flex items-start gap-3">
                              {item.image && (
                                <img
                                  src={item.image}
                                  alt={item.title}
                                  className="w-14 h-14 object-cover rounded-md"
                                  loading="lazy"
                                />
                              )}

                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{item.title}</p>

                                <p className="text-xs text-purple-600 capitalize">{item.type}</p>

                                {item.subtitle && (
                                  <p className="text-sm text-gray-500 truncate">{item.subtitle}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {data.total > 9 && (
                        <p className="text-center text-sm text-gray-500 mt-6">
                          Showing 9 of {data.total} results
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      No results found for "{query}"
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
