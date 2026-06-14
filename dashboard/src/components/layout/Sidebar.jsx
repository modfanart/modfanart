import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  CaretLeft,
  CaretRight,
  SignOut,
  X,
  Database 
} from '@phosphor-icons/react';

import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';
import { sidebarRoutes } from '../../router/routes/sidebarRoutes';
export const Sidebar = ({ mobileOpen, onMobileClose, collapsed, setCollapsed }) => {
  const { user, logout, hasRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const filteredMenu = sidebarRoutes.filter(route => 
    route.isSidebarActive && 
    (!route.roles || hasRole(route.roles))
  );

  useEffect(() => {
    if (mobileOpen) onMobileClose();
  }, [location.pathname]);

  return (
<aside
  className={cn(
    "fixed left-0 top-0 h-screen bg-zinc-950 border-r border-zinc-800 z-50 flex flex-col transition-transform duration-200",

    // MOBILE: slide in/out
    mobileOpen ? "translate-x-0" : "-translate-x-full",

    // DESKTOP: always visible, no translate
    "lg:translate-x-0",

    // WIDTH CONTROL
    collapsed ? "lg:w-16" : "lg:w-64",
    "w-64 lg:w-auto"
  )}
>
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-800">
        {(!collapsed || mobileOpen) && (
          <div className="flex items-center gap-2">
            <Database className="w-8 h-8 text-white" />
            <span className="text-lg font-semibold text-white">
              MOD WORKSPACE
            </span>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:block p-1.5 hover:bg-zinc-800 rounded"
        >
          {collapsed ? <CaretRight /> : <CaretLeft />}
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {filteredMenu.map((route) => {
          const isActive =
            location.pathname === route.path ||
            location.pathname.startsWith(route.path);

          return (
            <NavLink
              key={route.path}
              to={route.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md",
                isActive
                  ? "bg-white text-black"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
              )}
            >
              {route.icon}
              {(!collapsed || mobileOpen) && <span>{route.name}</span>}
            </NavLink>
          );
        })}
      </nav>


    </aside>
  );
};

export default Sidebar;