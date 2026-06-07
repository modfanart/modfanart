import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  MagnifyingGlass,
  User,
  List,
  Gear,
  SignOut,
} from '@phosphor-icons/react';

import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import SearchModal from '../search/SearchModal';

export const Header = ({ title, subtitle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Get menu toggle from MainLayout
  let onMenuToggle = null;
  try {
    const ctx = useOutletContext?.(); // safer
    onMenuToggle = ctx?.onMenuToggle;
  } catch {
    // Ignore if not inside MainLayout
  }

  // Ctrl/Cmd + K for search
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
  };

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() || 'U';

  return (
    <>
      <header
        className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md"
        data-testid="header"
      >
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          {/* Left Side */}
          <div className="flex min-w-0 items-center gap-3">
            {onMenuToggle && (
              <button
                onClick={onMenuToggle}
                className="rounded-md p-2 -ml-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white lg:hidden"
              >
                <List weight="bold" className="h-5 w-5" />
              </button>
            )}

            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold tracking-tight text-white sm:text-xl">
                {title}
              </h1>
              {subtitle && (
                <p className="truncate text-xs text-zinc-400 sm:text-sm">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Desktop Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden h-9 items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900 px-3 text-zinc-500 transition-colors hover:border-zinc-700 hover:text-zinc-300 sm:flex"
            >
              <MagnifyingGlass className="h-4 w-4" />
              <span className="text-sm">Search...</span>
              <kbd className="ml-2 rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-500">
                ⌘K
              </kbd>
            </button>

            {/* Mobile Search */}
            <Button
              variant="ghost"
              size="icon"
              className="text-zinc-400 hover:text-white sm:hidden"
              onClick={() => setSearchOpen(true)}
            >
              <MagnifyingGlass className="h-5 w-5" />
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden text-zinc-400 hover:text-white sm:inline-flex"
            >
              <Bell weight="duotone" className="h-5 w-5" />
            </Button>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-sm font-medium text-white hover:border-zinc-500 transition-colors overflow-hidden"
                title={user?.username || user?.email}
              >
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.username}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>{initials}</span>
                )}
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-lg border border-zinc-700 bg-zinc-900 py-1 shadow-xl z-50">
                    <div className="px-4 py-3 border-b border-zinc-800">
                      <p className="font-medium text-white">{user?.username}</p>
                      <p className="text-sm text-zinc-400 truncate">{user?.email}</p>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          navigate('/profile');
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
                      >
                        <User className="h-4 w-4" />
                        View Profile
                      </button>

                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          navigate('/settings');
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
                      >
                        <Gear className="h-4 w-4" />
                        Settings
                      </button>
                    </div>

                    <div className="border-t border-zinc-800 py-1">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-zinc-800 hover:text-red-500"
                      >
                        <SignOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default Header;