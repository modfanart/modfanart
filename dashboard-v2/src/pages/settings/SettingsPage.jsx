import React from 'react';
import { Gear } from '@phosphor-icons/react';
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
      toast.success(data.message);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to seed data');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="min-h-screen" data-testid="settings-page">
      <Header title="Settings" subtitle="Manage system settings" />
      
      <div className="p-6 space-y-6">
        {/* Profile Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-md p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Profile</h3>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center text-white text-2xl font-bold">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <p className="text-xl font-semibold text-white">{user?.name}</p>
              <p className="text-zinc-400">{user?.email}</p>
              <p className="text-sm text-zinc-500 capitalize mt-1">{user?.role?.replace('_', ' ')}</p>
            </div>
          </div>
        </div>

        {/* Admin Tools */}
        {hasRole(['super_admin', 'admin']) && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-md p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Admin Tools</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-zinc-950 rounded-md">
                <div>
                  <p className="text-white font-medium">Seed Mock Data</p>
                  <p className="text-sm text-zinc-500">Add sample brands, categories, products, and customers</p>
                </div>
                <Button
                  onClick={handleSeedData}
                  disabled={seeding}
                  className="bg-white text-black hover:bg-zinc-200"
                  data-testid="seed-data-btn"
                >
                  {seeding ? 'Seeding...' : 'Seed Data'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* System Info */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-md p-6">
          <h3 className="text-lg font-semibold text-white mb-4">System Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-400">Application</span>
              <span className="text-white">SanitaryERP</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Version</span>
              <span className="text-white">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Environment</span>
              <span className="text-white">Production</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
