import type { Metadata } from 'next';
import { ModerationDashboard } from '@/components/compliance/moderation-dashboard';

export const metadata: Metadata = {
  title: 'Compliance Dashboard',
  description: 'Monitor and manage content moderation and compliance',
};

export default function ComplianceDashboardPage() {
  return (
    <div className="container mx-auto py-6">
      <ModerationDashboard />
    </div>
  );
}
