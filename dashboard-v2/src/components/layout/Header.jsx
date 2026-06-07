import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { ShoppingCart, Bell, MagnifyingGlass, User, List } from '@phosphor-icons/react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import CartPanel from '../cart/CartPanel';
import SearchModal from '../search/SearchModal';

export const Header = ({ title, subtitle }) => {
  const { itemCount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);

  // Get the menu toggle from MainLayout outlet context
  let onMenuToggle = null;
  try {
    const ctx = useOutletContext();
    onMenuToggle = ctx?.onMenuToggle;
  } catch {}

  // Keyboard shortcut: Ctrl+K or Cmd+K to open search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 z-40" data-testid="header">
        <div className="flex items-center justify-between px-4 sm:px-6 h-16">
          {/* Left: Menu toggle + Title */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger — mobile only */}
            {onMenuToggle && (
              <button
                onClick={onMenuToggle}
                className="p-2 -ml-2 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 lg:hidden"
                data-testid="mobile-menu-btn"
              >
                <List weight="bold" className="w-5 h-5" />
              </button>
            )}
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-semibold text-white tracking-tight truncate">{title}</h1>
              {subtitle && <p className="text-xs sm:text-sm text-zinc-400 truncate">{subtitle}</p>}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Search trigger — full on md+, icon only on mobile */}
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 h-9 bg-zinc-900 border border-zinc-800 rounded-md text-zinc-500 hover:text-zinc-300 hover:border-zinc-700 transition-colors cursor-pointer"
              data-testid="header-search"
            >
              <MagnifyingGlass className="w-4 h-4" />
              <span className="text-sm">Search...</span>
              <kbd className="ml-2 text-xs px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-500">&#8984;K</kbd>
            </button>
            <Button
              variant="ghost"
              size="icon"
              className="text-zinc-400 hover:text-white sm:hidden"
              onClick={() => setSearchOpen(true)}
              data-testid="header-search-mobile"
            >
              <MagnifyingGlass className="w-5 h-5" />
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hidden sm:inline-flex" data-testid="notifications-btn">
              <Bell weight="duotone" className="w-5 h-5" />
            </Button>

            {/* Cart */}
            <Sheet>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-zinc-400 hover:text-white relative"
                  data-testid="cart-btn"
                >
                  <ShoppingCart weight="duotone" className="w-5 h-5" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-black text-xs font-bold rounded-full flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-zinc-950 border-zinc-800 w-full sm:max-w-lg">
                <SheetHeader>
                  <SheetTitle className="text-white">Shopping Cart</SheetTitle>
                </SheetHeader>
                <CartPanel />
              </SheetContent>
            </Sheet>

            {/* Profile Avatar */}
            <button
              onClick={() => navigate('/profile')}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white font-medium text-sm hover:border-zinc-500 transition-colors cursor-pointer flex-shrink-0"
              data-testid="header-profile-btn"
              title="My Profile"
            >
              {user?.name?.charAt(0)?.toUpperCase() || <User className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Search Modal */}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default Header;
