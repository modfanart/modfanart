import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from './Sidebar';
import { Toaster } from '../ui/sonner';

export const MainLayout = () => {
  const { user, loading, hasAccess } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || user === false) {
    return <Navigate to="/login" replace />;
  }

  if (!hasAccess) {
    return <Navigate to="/no-access" replace />;
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <main className="lg:ml-64 min-h-screen transition-all duration-200">
        <Outlet context={{ onMenuToggle: () => setMobileOpen(true) }} />
      </main>
      <Toaster position="top-right" richColors />
    </div>
  );
};

export default MainLayout;
