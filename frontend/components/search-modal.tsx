'use client';

import { useEffect, useState } from 'react';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Search } from 'lucide-react'; // or your icon library
import { Button } from '@/components/ui/button';
import { DialogTitle } from '@/components/ui/dialog'; // for accessibility

// You can later fetch real data or make this dynamic
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

  // Optional: cmd+k / ctrl+k shortcut to open
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <>
      {/* Trigger button - we'll place this in the header */}
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-foreground"
        onClick={() => setOpen(true)}
        aria-label="Open search"
      >
        <Search className="h-5 w-5" />
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        {/* Improves accessibility */}
        <DialogTitle className="sr-only">Search Movies, Shows, Anime...</DialogTitle>

        <Command shouldFilter={true} className="bg-background">
          <CommandInput
            placeholder="Search for Movies, Shows, Anime, Cast & Crew or Users..."
            className="placeholder:text-muted-foreground"
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>

            <CommandGroup heading="Recent Searches">
              {recentSearches.map((search) => (
                <CommandItem
                  key={search}
                  value={search}
                  onSelect={() => {
                    // Handle navigation / selection
                    console.log('Selected:', search);
                    // e.g. router.push(`/search?q=${encodeURIComponent(search)}`)
                    setOpen(false);
                  }}
                >
                  {search}
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandSeparator />

            {/* You can add more groups later: Top Results, Suggestions, etc. */}
            {/* Example placeholder group */}
            <CommandGroup heading="Suggestions">
              <CommandItem>Upcoming Movies</CommandItem>
              <CommandItem>Popular Anime</CommandItem>
              <CommandItem>Trending Shows</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
