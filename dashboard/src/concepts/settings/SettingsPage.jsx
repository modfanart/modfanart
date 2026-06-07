import React from 'react';
import { Gear, User, Shield, Database, Info } from '@phosphor-icons/react';
import { Header } from '../../components/layout/Header';
import { useAuth } from '../../contexts/AuthContext';
import { seedData } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';

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

      <Header title="Settings" subtitle="Manage your account and system preferences" />

      <div className="max-w-5xl mx-auto p-6 space-y-10">

        {/* ===== PROFILE SECTION ===== */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-zinc-400">
            <User size={18} />
            <h2 className="text-sm uppercase tracking-wider">Account</h2>
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
          </div>
        </section>

        {/* ===== ADMIN SECTION ===== */}
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
                  Seed sample data for testing and development
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

        {/* ===== SYSTEM SECTION ===== */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-zinc-400">
            <Database size={18} />
            <h2 className="text-sm uppercase tracking-wider">System</h2>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-3 text-sm">

            <div className="flex justify-between">
              <span className="text-zinc-400">Application</span>
              <span>SanitaryERP</span>
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

        {/* ===== ABOUT ===== */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-zinc-400">
            <Info size={18} />
            <h2 className="text-sm uppercase tracking-wider">About</h2>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-sm text-zinc-400 leading-relaxed">
            SanitaryERP is a management system designed for brands, products, and
            operations. Built for scalability and enterprise workflows.
          </div>
        </section>

      </div>
    </div>
  );
};

export default SettingsPage;