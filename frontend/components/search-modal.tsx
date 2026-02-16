'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLazyGlobalSearchQuery } from '@/services/api/searchApi';
// How many recent searches to keep
const MAX_RECENT_SEARCHES = 8;
const STORAGE_KEY = 'recent_searches';

// Helper to get/save recent searches
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
  } catch {
    // silent fail
  }
};

export function SearchModal() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches on mount
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // CMD/CTRL + K to open/close
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

  // When user presses Enter → add to recent & trigger search
  const handleSearchSubmit = useCallback(() => {
    if (!query.trim()) return;

    // Add to recent searches (dedupe + newest first + limit)
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== query.trim().toLowerCase());
      const updated = [query.trim(), ...filtered].slice(0, MAX_RECENT_SEARCHES);
      saveRecentSearches(updated);
      return updated;
    });

    // Here you can also navigate or do something else
    // e.g. router.push(`/search?q=${encodeURIComponent(query)}`)
  }, [query]);

  const handleClearHistory = () => {
    setRecentSearches([]);
    saveRecentSearches([]);
  };

  // RTK Query – lazy version
  const [triggerSearch, { data, isLoading, isFetching }] = useLazyGlobalSearchQuery();

  // Debounced auto-search when typing
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) return;

    const timer = setTimeout(() => {
      triggerSearch(
        {
          q: query.trim(),
          limit: 12,
          offset: 0,
          // type: 'content,movies,shows' // ← you can make this dynamic later with tabs
        },
        true // prefer cache if available
      );
    }, 400);

    return () => clearTimeout(timer);
  }, [query, triggerSearch]);

  return (
    <>
      {/* Trigger button in header */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="text-gray-600 hover:text-gray-900"
      >
        <Search className="h-5 w-5" />
      </Button>

      {/* Fullscreen modal */}
      {open && (
        <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur-sm animate-in fade-in duration-200">
          <button
            onClick={() => setOpen(false)}
            className="absolute top-6 right-8 text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="Close search"
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
                placeholder="Search movies, shows, anime, cast & crew, users..."
                className="pl-12 h-14 text-lg rounded-xl border-gray-300 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:border-transparent shadow-sm"
              />
            </div>

            {/* Tabs */}
            <div className="flex gap-6 sm:gap-10 mt-8 border-b border-gray-200 text-sm font-medium">
              <button className="pb-3 border-b-2 border-purple-600 text-purple-700">All</button>
              <button className="pb-3 text-gray-600 hover:text-gray-900 transition">Movies</button>
              <button className="pb-3 text-gray-600 hover:text-gray-900 transition">Shows</button>
              <button className="pb-3 text-gray-600 hover:text-gray-900 transition">People</button>
              <button className="pb-3 text-gray-600 hover:text-gray-900 transition">Users</button>
            </div>

            {/* Content area */}
            <div className="mt-8 min-h-[40vh]">
              {/* Recent Searches – shown when no query */}
              {!query.trim() && (
                <div>
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="text-sm font-medium text-gray-500 tracking-wide">
                      RECENT SEARCHES
                    </h3>
                    {recentSearches.length > 0 && (
                      <button
                        onClick={handleClearHistory}
                        className="text-xs text-gray-500 hover:text-gray-700 underline-offset-2 hover:underline"
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
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm rounded-full transition-colors"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Search in progress or results */}
              {query.trim() && (
                <div>
                  {isLoading || isFetching ? (
                    <div className="text-center py-12 text-gray-500">
                      Searching for "{query}"...
                    </div>
                  ) : data?.results?.length ? (
                    <div className="space-y-6">
                      <p className="text-sm text-gray-600">
                        Found {data.total} results for "{query}"
                      </p>

                      {/* Simple grid/list of results */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {data.results.slice(0, 9).map((item) => (
                          <div
                            key={`${item.type}-${item.id}`}
                            className="p-4 border rounded-lg hover:border-purple-300 transition-colors bg-white shadow-sm"
                          >
                            <div className="flex items-start gap-3">
                              {item.image && (
                                <img
                                  src={item.image}
                                  alt={item.title || item.name || ''}
                                  className="w-16 h-16 object-cover rounded"
                                />
                              )}
                              <div>
                                <p className="font-medium">
                                  {item.title || item.name || item.username || '—'}
                                </p>
                                <p className="text-sm text-gray-500 capitalize">{item.type}</p>
                                {item.description && (
                                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {data.total > data.results.length && (
                        <p className="text-center text-sm text-gray-500 mt-6">
                          Showing {data.results.length} of {data.total} results
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
