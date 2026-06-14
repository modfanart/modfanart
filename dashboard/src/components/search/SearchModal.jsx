import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MagnifyingGlass,
  X,
  Package,
  Users,
  Trophy,
  ArrowRight,
  UserCircle
} from '@phosphor-icons/react';

import { Dialog, DialogContent } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { ScrollArea } from '../../components/ui/scroll-area';
import { useLazyGlobalSearchQuery } from '../../services/api/searchApi';

export const SearchModal = ({ open, onClose }) => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const [triggerSearch, { data, isFetching }] = useLazyGlobalSearchQuery();

  const tabConfig = {
    all: { type: undefined, label: 'All', icon: MagnifyingGlass },
    artwork: { type: 'artwork', label: 'Artworks', icon: Package },
    user: { type: 'user', label: 'Users', icon: Users },
    brand: { type: 'brand', label: 'Brands', icon: UserCircle },
    contest: { type: 'contest', label: 'Contests', icon: Trophy }
  };

  const currentType = tabConfig[activeTab].type;

  const performSearch = useCallback(
    (term) => {
      if (!term || term.length < 2) return;

      triggerSearch({
        q: term,
        limit: 20,
        type: currentType
      });
    },
    [triggerSearch, currentType]
  );

  const debouncedSearch = useCallback(debounce(performSearch, 280), [
    performSearch
  ]);

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  useEffect(() => {
    if (!open) {
      setSearchTerm('');
      setActiveTab('all');
    }
  }, [open]);

  const handleNavigate = (item) => {
    onClose();

    const { type, id } = item;

    switch (type) {
      case 'artwork':
        navigate(`/products/${id}`);
        break;
      case 'user':
        navigate(`/customers/${id}`);
        break;
      case 'brand':
        navigate(`/brands/${id}`);
        break;
      case 'contest':
        navigate(`/contests/${id}`);
        break;
      case 'category':
        navigate(`/categories/${id}`);
        break;
      case 'tag':
        navigate(`/tags/${id}`);
        break;
      default:
        navigate(`/${type}s/${id}`);
    }
  };

  const results = data?.results || [];
  const totalResults = results.length;

  const tabs = Object.entries(tabConfig).map(([key, config]) => ({
    id: key,
    ...config
  }));

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="
          bg-zinc-900 border-zinc-800
          w-[100vw] h-[100dvh]
          sm:w-[calc(100vw-2rem)] sm:h-auto sm:max-w-2xl
          sm:rounded-2xl
          p-0 overflow-hidden
          flex flex-col
        "
      >
        {/* SEARCH INPUT */}
        <div className="p-3 sm:p-4 border-b border-zinc-800">
          <div className="relative">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />

            <Input
              autoFocus
              placeholder="Search anything..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="
                pl-10 pr-10 h-12
                bg-zinc-950 border-zinc-800
                text-white text-base sm:text-lg
                placeholder-zinc-500
              "
            />

            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* TABS */}
        <div className="flex border-b border-zinc-800 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2
                  px-4 sm:px-5
                  py-3
                  text-sm font-medium
                  whitespace-nowrap
                  shrink-0
                  transition-colors border-b-2
                  ${
                    activeTab === tab.id
                      ? 'text-white border-white'
                      : 'text-zinc-500 hover:text-zinc-300 border-transparent'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* RESULTS */}
        <ScrollArea className="flex-1 sm:h-[420px]">
          {isFetching ? (
            <div className="flex flex-col items-center justify-center flex-1 text-zinc-500">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          ) : searchTerm.length < 2 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-zinc-500">
              <MagnifyingGlass className="w-10 h-10 mb-3 opacity-40" />
              <p>Type at least 2 characters</p>
            </div>
          ) : totalResults === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-zinc-500">
              <p>No results found for "{searchTerm}"</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {results.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  onClick={() => handleNavigate(item)}
                  className="
                    flex items-center gap-3
                    p-3 rounded-xl
                    hover:bg-zinc-800/70
                    cursor-pointer group
                    transition-colors
                  "
                >
                  <div className="w-10 h-10 rounded-lg bg-zinc-800 flex-shrink-0 overflow-hidden">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-400">
                        {item.type === 'user' && item.title
                          ? item.title.charAt(0).toUpperCase()
                          : '•'}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">
                      {item.title}
                    </p>

                    <p className="text-xs text-zinc-500 truncate">
                      {item.subtitle}
                      {item.extra && ` • ${item.extra}`}
                    </p>

                    <p className="text-[10px] uppercase tracking-widest text-zinc-600 mt-0.5">
                      {item.type}
                    </p>
                  </div>

                  <ArrowRight className="w-4 h-4 text-zinc-500 opacity-0 group-hover:opacity-100 transition-all" />
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* FOOTER */}
        <div className="p-3 border-t border-zinc-800 text-center text-xs text-zinc-500 pb-[calc(env(safe-area-inset-bottom)+12px)]">
          Press <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded">ESC</kbd> to
          close
        </div>
      </DialogContent>
    </Dialog>
  );
};

/* debounce helper */
function debounce(func, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default SearchModal;