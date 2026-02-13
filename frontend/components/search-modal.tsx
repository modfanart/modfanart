'use client';

import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const recentSearches = [
  'Mango Dreams',
  'Ankhon Dekhi',
  'Geetha Govindam',
  'Breaking Bad',
  'Raanjhanaa',
  'Tere Ishk Mein',
];

export function SearchModal() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  // CMD + K shortcut
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

  return (
    <>
      {/* Header Search Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="text-muted-foreground hover:text-white"
      >
        <Search className="h-5 w-5" />
      </Button>

      {/* FULLSCREEN OVERLAY */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm animate-in fade-in">
          {/* Close Button */}
          <button
            onClick={() => setOpen(false)}
            className="absolute top-6 right-8 text-muted-foreground hover:text-white transition"
          >
            <X size={24} />
          </button>

          {/* CENTERED CONTAINER */}
          <div className="mx-auto mt-24 w-full max-w-4xl px-6">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for Movies, Shows, Anime, Cast & Crew or Users..."
                className="pl-12 h-14 text-lg bg-zinc-900 border-zinc-800 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>

            {/* Tabs */}
            <div className="flex gap-8 mt-6 border-b border-zinc-800 text-sm">
              <button className="pb-3 border-b-2 border-purple-500 text-white">Content</button>
              <button className="pb-3 text-muted-foreground hover:text-white">Collections</button>
              <button className="pb-3 text-muted-foreground hover:text-white">Cast & Crew</button>
              <button className="pb-3 text-muted-foreground hover:text-white">Users</button>
            </div>

            {/* Recent Searches */}
            {!query && (
              <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm tracking-wide text-muted-foreground">RECENT SEARCHES</h3>

                  <button className="text-xs text-muted-foreground hover:text-white">
                    Clear history
                  </button>
                </div>

                <div className="flex flex-wrap gap-3">
                  {recentSearches.map((item) => (
                    <button
                      key={item}
                      onClick={() => setQuery(item)}
                      className="px-4 py-2 bg-zinc-900 rounded-full text-sm hover:bg-zinc-800 transition"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Results Placeholder */}
            {query && (
              <div className="mt-8 text-muted-foreground">
                Searching for <span className="text-white">{query}</span>...
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
