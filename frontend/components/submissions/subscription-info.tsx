'use client';

import { CreditCard, ArrowUpCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface SubscriptionInfoProps {
  tier: 'free' | 'premium_artist' | 'creator' | 'enterprise';
  status: 'active' | 'inactive' | 'past_due' | 'canceled';
  renewalDate?: string;
  customerId?: string;
}

function getTierName(tier: SubscriptionInfoProps['tier']) {
  switch (tier) {
    case 'free':
      return 'Free Artist';
    case 'premium_artist':
      return 'Premium Artist';
    case 'creator':
      return 'Creator/IP Holder';
    case 'enterprise':
      return 'Enterprise';
    default:
      return 'Unknown';
  }
}

function getStatusText(status: SubscriptionInfoProps['status']) {
  switch (status) {
    case 'active':
      return 'Active';
    case 'inactive':
      return 'Inactive';
    case 'past_due':
      return 'Past Due';
    case 'canceled':
      return 'Canceled';
    default:
      return 'Unknown';
  }
}

function getStatusColor(status: SubscriptionInfoProps['status']) {
  switch (status) {
    case 'active':
      return 'bg-green-500';
    case 'past_due':
      return 'bg-yellow-500';
    case 'canceled':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
}

export function SubscriptionInfo({ tier, status, renewalDate, customerId }: SubscriptionInfoProps) {
  const tierName = getTierName(tier);
  const statusText = getStatusText(status);
  const statusColor = getStatusColor(status);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium">{tierName}</p>
          <div className="flex items-center">
            <div className={`h-2 w-2 rounded-full ${statusColor} mr-2`} />
            <p className="text-xs text-muted-foreground">{statusText}</p>
          </div>
        </div>
        {status === 'active' && renewalDate && (
          <Badge variant="outline" className="text-xs">
            Renews {new Date(renewalDate).toLocaleDateString()}
          </Badge>
        )}
      </div>

      <div className="flex flex-col space-y-2">
        <Button variant="outline" size="sm" className="w-full justify-start">
          <CreditCard className="mr-2 h-4 w-4" />
          Manage Billing
        </Button>
        {tier !== 'enterprise' && (
          <Button variant="outline" size="sm" className="w-full justify-start">
            <ArrowUpCircle className="mr-2 h-4 w-4" />
            Upgrade Plan
          </Button>
        )}
      </div>
    </div>
  );
}
