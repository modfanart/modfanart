import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Sidebar from "./Sidebar";
import { Toaster } from "../ui/sonner";

const MainLayout = () => {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {mobileOpen && (
  <div
    className="fixed inset-0 bg-black/60 z-40 lg:hidden"
    onClick={() => setMobileOpen(false)}
  />
)}
      {/* Sidebar */}
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* Main Content */}
      <main
        className={`flex-1 min-h-screen transition-all duration-200 ${
          collapsed ? "lg:ml-16" : "lg:ml-64"
        }`}
      >
        <Outlet context={{ onMenuToggle: () => setMobileOpen(true) }} />
      </main>

      <Toaster position="top-right" richColors />
    </div>
  );
};

export default MainLayout;