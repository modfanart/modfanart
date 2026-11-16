import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Toaster } from "../ui/sonner";

// No sidebar: navigation is the app launcher (9-dot button) + per-app section
// tabs, both rendered by <Header /> on every page.
const MainLayout = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <main className="min-h-screen">
        <Outlet />
      </main>
      <Toaster position="top-right" richColors />
    </div>
  );
};

export default MainLayout;
