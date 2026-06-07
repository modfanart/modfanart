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
        "fixed left-0 top-0 h-screen bg-zinc-950 border-r border-zinc-800 z-50 flex flex-col transition-all duration-200",
        collapsed ? "lg:w-16" : "lg:w-64",
        "max-lg:w-64"
      )}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-800">
        {(!collapsed || mobileOpen) && (
          <div className="flex items-center gap-2">
            <Database className="w-8 h-8 text-white" />
            <span className="text-lg font-semibold text-white">
              SanitaryERP
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

      {/* User */}
      <div className="p-4 border-t border-zinc-800">
        <div className="flex items-center gap-3">
          <div
            onClick={() => navigate("/profile")}
            className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center text-white cursor-pointer"
          >
            {user?.username?.slice(0, 2).toUpperCase() || "U"}
          </div>

          {(!collapsed || mobileOpen) && (
            <>
              <div className="flex-1">
                <p className="text-sm text-white">{user?.username}</p>
                <p className="text-xs text-zinc-500">{user?.role?.name}</p>
              </div>

              <button onClick={logout}>
                <SignOut className="w-5 h-5 text-zinc-400" />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;