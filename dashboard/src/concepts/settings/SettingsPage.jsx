import React from 'react';
import { User, Shield, Database, Info, Key, PencilSimple, ClockCounterClockwise } from '@phosphor-icons/react';

import { Header } from '../../components/layout/Header';
import { useAuth } from '../../contexts/AuthContext';
import { seedData } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';

// Sidebar Layout (adjust import if you already have one)
import { SidebarLayout } from '../../components/layout/SidebarLayout';

export const SettingsPage = () => {
  const { user, hasRole } = useAuth();
  const [seeding, setSeeding] = React.useState(false);

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      const { data } = await seedData();
      toast.success(data.message || 'Data seeded successfully');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to seed data');
    } finally {
      setSeeding(false);
    }
  };

  const roleName = user?.role?.name || user?.role || 'user';

  return (
    
      <div className="min-h-screen bg-black text-white" data-testid="settings-page">

        {/* ===== HEADER ===== */}
        <Header
          title="MODFAN WORKSPACE"
          subtitle="Manage profile, security and system settings"
        />

        <div className="max-w-5xl mx-auto p-6 space-y-10">

          {/* ================= PROFILE ================= */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-zinc-400">
              <User size={18} />
              <h2 className="text-sm uppercase tracking-wider">Profile</h2>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center text-xl font-bold">
                  {user?.username?.charAt(0)?.toUpperCase()}
                </div>

                <div>
                  <p className="text-lg font-semibold">{user?.username}</p>
                  <p className="text-sm text-zinc-400">{user?.email}</p>
                  <p className="text-xs text-zinc-500 capitalize mt-1">
                    {roleName?.replace('_', ' ')}
                  </p>
                </div>
              </div>

              <Button className="flex items-center gap-2">
                <PencilSimple size={16} />
                Edit Profile
              </Button>
            </div>
          </section>

          {/* ================= SECURITY ================= */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-zinc-400">
              <Key size={18} />
              <h2 className="text-sm uppercase tracking-wider">Security</h2>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4">

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Change Password</p>
                  <p className="text-sm text-zinc-500">
                    Update your account password
                  </p>
                </div>

                <Button variant="outline">
                  Change Password
                </Button>
              </div>

              <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
                <div>
                  <p className="font-medium">Forgot Password</p>
                  <p className="text-sm text-zinc-500">
                    Send reset link to your email
                  </p>
                </div>

                <Button variant="ghost">
                  Send Reset Link
                </Button>
              </div>

            </div>
          </section>

          {/* ================= ADMIN ================= */}
          {hasRole(['super_admin', 'admin']) && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-zinc-400">
                <Shield size={18} />
                <h2 className="text-sm uppercase tracking-wider">Administration</h2>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex items-center justify-between">
                <div>
                  <p className="font-medium">Database Utilities</p>
                  <p className="text-sm text-zinc-500">
                    Seed sample data for development
                  </p>
                </div>

                <Button
                  onClick={handleSeedData}
                  disabled={seeding}
                  className="bg-white text-black hover:bg-zinc-200"
                >
                  {seeding ? 'Seeding...' : 'Seed Data'}
                </Button>
              </div>
            </section>
          )}

          {/* ================= SYSTEM ================= */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-zinc-400">
              <Database size={18} />
              <h2 className="text-sm uppercase tracking-wider">System</h2>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-400">Application</span>
                <span>MODFAN WORKSPACE</span>
              </div>

              <div className="flex justify-between">
                <span className="text-zinc-400">Version</span>
                <span>1.0.0</span>
              </div>

              <div className="flex justify-between">
                <span className="text-zinc-400">Environment</span>
                <span>Production</span>
              </div>
            </div>
          </section>

          {/* ================= CHANGELOG ================= */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-zinc-400">
              <ClockCounterClockwise size={18} />
              <h2 className="text-sm uppercase tracking-wider">Changelog</h2>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-sm space-y-3">

              <div>
                <p className="font-medium">v1.0.0</p>
                <p className="text-zinc-500">
                  Initial release of MODFAN WORKSPACE with authentication, products and admin tools.
                </p>
              </div>

              <div>
                <p className="font-medium">v0.9.0</p>
                <p className="text-zinc-500">
                  Added role-based access control and dashboard improvements.
                </p>
              </div>

            </div>
          </section>

        </div>
      </div>

  );
};

export default SettingsPage;