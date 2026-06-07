import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  House, 
  Package, 
  Users, 
  FileText, 
  ShoppingCart, 
  Truck, 
  Receipt, 
  UsersThree,
  CaretLeft,
  CaretRight,
  SignOut,
  Gear,
  Database,
  Storefront,
  X
} from '@phosphor-icons/react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';

const menuItems = [
  { path: '/dashboard', icon: House, label: 'Dashboard', roles: ['super_admin', 'admin', 'developer', 'sales', 'ops', 'hr'] },
  { path: '/shop', icon: Storefront, label: 'Shop', roles: ['super_admin', 'admin', 'developer', 'sales', 'ops'] },
  { path: '/inventory', icon: Package, label: 'Inventory', roles: ['super_admin', 'admin', 'developer', 'sales', 'ops'] },
  { path: '/customers', icon: Users, label: 'Customers', roles: ['super_admin', 'admin', 'developer', 'sales', 'ops'] },
  { path: '/quotations', icon: FileText, label: 'Quotations', roles: ['super_admin', 'admin', 'developer', 'sales', 'ops'] },
  { path: '/orders', icon: ShoppingCart, label: 'Orders', roles: ['super_admin', 'admin', 'developer', 'sales', 'ops'] },
  { path: '/invoices', icon: Receipt, label: 'Invoices', roles: ['super_admin', 'admin', 'developer', 'sales', 'ops'] },
  { path: '/gatepasses', icon: Truck, label: 'Gatepasses', roles: ['super_admin', 'admin', 'developer', 'sales', 'ops'] },
  { path: '/users', icon: UsersThree, label: 'Users', roles: ['super_admin', 'admin', 'hr'] },
  { path: '/settings', icon: Gear, label: 'Settings', roles: ['super_admin', 'admin'] },
];

export const Sidebar = ({ mobileOpen, onMobileClose }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout, hasRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const filteredMenu = menuItems.filter(item => hasRole(item.roles));

  // Close mobile sidebar on route change
  useEffect(() => {
    if (mobileOpen) onMobileClose();
  }, [location.pathname]);

  const sidebarContent = (
    <aside
      data-testid="sidebar"
      className={cn(
        "fixed left-0 top-0 h-screen bg-zinc-950 border-r border-zinc-800 z-50 flex flex-col transition-all duration-200",
        // Desktop: show based on collapsed state
        "max-lg:w-64",
        collapsed ? "lg:w-16" : "lg:w-64"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-800">
        {(!collapsed || mobileOpen) && (
          <div className="flex items-center gap-2">
            <Database weight="duotone" className="w-8 h-8 text-white flex-shrink-0" />
            <span className="text-lg font-semibold text-white tracking-tight">SanitaryERP</span>
          </div>
        )}
        {/* Close button on mobile */}
        <button
          onClick={onMobileClose}
          className="p-1.5 rounded-md hover:bg-zinc-800 transition-colors lg:hidden"
          data-testid="sidebar-close-mobile"
        >
          <X weight="bold" className="w-5 h-5 text-zinc-400" />
        </button>
        {/* Collapse toggle on desktop */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md hover:bg-zinc-800 transition-colors hidden lg:block"
          data-testid="sidebar-toggle"
        >
          {collapsed ? (
            <CaretRight weight="bold" className="w-5 h-5 text-zinc-400" />
          ) : (
            <CaretLeft weight="bold" className="w-5 h-5 text-zinc-400" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {filteredMenu.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            const showLabel = mobileOpen || !collapsed;
            
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200",
                    isActive
                      ? "bg-white text-black"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                  )}
                >
                  <Icon weight={isActive ? "fill" : "duotone"} className="w-5 h-5 flex-shrink-0" />
                  {showLabel && <span className="text-sm font-medium">{item.label}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-zinc-800">
        <div className={cn("flex items-center", (collapsed && !mobileOpen) ? "justify-center" : "gap-3")}>
          <div 
            onClick={() => navigate('/profile')}
            className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center text-white font-medium text-sm cursor-pointer hover:bg-zinc-700 transition-colors flex-shrink-0"
            data-testid="sidebar-profile-avatar"
            title="View Profile"
          >
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          {(mobileOpen || !collapsed) && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-zinc-500 capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
          )}
          {(mobileOpen || !collapsed) && (
            <button
              onClick={logout}
              className="p-2 rounded-md hover:bg-zinc-800 transition-colors"
              data-testid="logout-btn"
              title="Logout"
            >
              <SignOut weight="bold" className="w-5 h-5 text-zinc-400 hover:text-white" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar - always rendered, hidden by CSS on mobile */}
      <div className="hidden lg:block">
        {sidebarContent}
      </div>

      {/* Mobile sidebar - overlay */}
      {mobileOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 z-40 lg:hidden" 
            onClick={onMobileClose}
            data-testid="sidebar-overlay"
          />
          <div className="lg:hidden">
            {sidebarContent}
          </div>
        </>
      )}
    </>
  );
};

export default Sidebar;
