'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import {
  Calendar,
  Clock,
  FileText,
  Filter,
  ImageIcon,
  Search,
  ShieldCheck,
  Star,
  DollarSign,
} from 'lucide-react';
import { DashboardShell } from '@/components/dashboard-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
type Activity = {
  id: string;
  type: 'submission' | 'license' | 'review' | 'compliance' | 'payment';
  description: string;
  timestamp: Date;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  icon: React.ReactNode;
};
// Mock data for activities
const mockActivities: Activity[] = [
  {
    id: 'act-1',
    type: 'submission',
    description: "Submitted new artwork 'Cosmic Hero'",
    timestamp: new Date(2025, 2, 6, 14, 30),
    status: 'pending',
    icon: <ImageIcon className="h-5 w-5 text-blue-500" />,
  },
  {
    id: 'act-2',
    type: 'license',
    description: "License approved for 'Dragon Warrior'",
    timestamp: new Date(2025, 2, 6, 10, 15),
    status: 'approved',
    icon: <FileText className="h-5 w-5 text-green-500" />,
  },
  {
    id: 'act-3',
    type: 'review',
    description: "Received feedback on 'Space Explorer'",
    timestamp: new Date(2025, 2, 5, 16, 45),
    status: 'completed',
    icon: <Star className="h-5 w-5 text-yellow-500" />,
  },
  {
    id: 'act-4',
    type: 'compliance',
    description: "IP compliance check completed for 'Forest Guardian'",
    timestamp: new Date(2025, 2, 5, 11, 20),
    status: 'approved',
    icon: <ShieldCheck className="h-5 w-5 text-purple-500" />,
  },
  {
    id: 'act-5',
    type: 'payment',
    description: "Received payment for 'Ocean Defender' license",
    timestamp: new Date(2025, 2, 4, 9, 10),
    status: 'completed',
    icon: <DollarSign className="h-5 w-5 text-emerald-500" />,
  },
  {
    id: 'act-6',
    type: 'submission',
    description: "Artwork 'Mountain Spirit' rejected",
    timestamp: new Date(2025, 2, 3, 13, 25),
    status: 'rejected',
    icon: <ImageIcon className="h-5 w-5 text-blue-500" />,
  },
  {
    id: 'act-7',
    type: 'license',
    description: "License request for 'City Guardian'",
    timestamp: new Date(2025, 2, 2, 15, 40),
    status: 'pending',
    icon: <FileText className="h-5 w-5 text-green-500" />,
  },
];

// Group activities by date
const groupActivitiesByDate = (activities: Activity[]): Record<string, Activity[]> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());

  return activities.reduce((groups: Record<string, Activity[]>, activity: Activity) => {
    const activityDate = new Date(activity.timestamp);
    activityDate.setHours(0, 0, 0, 0);

    let group: string;
    if (activityDate.getTime() === today.getTime()) {
      group = 'Today';
    } else if (activityDate.getTime() === yesterday.getTime()) {
      group = 'Yesterday';
    } else if (activityDate > thisWeekStart) {
      group = 'This Week';
    } else {
      group = 'Earlier';
    }

    if (!groups[group]) {
      groups[group] = [];
    }

    groups[group].push(activity);
    return groups;
  }, {} as Record<string, Activity[]>);
};

// Status badge component
type Status = 'pending' | 'approved' | 'rejected' | 'completed';

type StatusConfig = {
  color: string;
  label: string;
};

const statusConfig: Record<Status, StatusConfig> = {
  pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
  approved: { color: 'bg-green-100 text-green-800', label: 'Approved' },
  rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
  completed: { color: 'bg-blue-100 text-blue-800', label: 'Completed' },
};

type StatusBadgeProps = {
  status: Status;
};

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const config = statusConfig[status] ?? { color: 'bg-gray-100 text-gray-800', label: status };

  return (
    <Badge className={`${config.color} font-medium`} variant="outline">
      {config.label}
    </Badge>
  );
};

export default function HistoryPage() {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter activities based on type and search query
  const filteredActivities = mockActivities.filter((activity) => {
    const matchesType = filter === 'all' || activity.type === filter;
    const matchesSearch = activity.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const groupedActivities = groupActivitiesByDate(filteredActivities);

  return (
    <DashboardShell>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Activity History</h1>
          </div>
          <Button variant="outline" size="lg">
            <Calendar className="mr-2 h-5 w-5" />
            Date Range
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">Filter Activities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search activities..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Activities</SelectItem>
                  <SelectItem value="submission">Submissions</SelectItem>
                  <SelectItem value="license">Licenses</SelectItem>
                  <SelectItem value="review">Reviews</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="payment">Payments</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
          {Object.keys(groupedActivities).length > 0 ? (
            Object.entries(groupedActivities).map(([dateGroup, activities]) => (
              <div key={dateGroup} className="space-y-4">
                <h3 className="text-lg font-semibold">{dateGroup}</h3>
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <Card key={activity.id}>
                      <CardContent className="flex items-start gap-4 p-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                          {activity.icon}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <p className="font-medium">{activity.description}</p>
                            <div className="flex items-center gap-2">
                              <StatusBadge status={activity.status} />
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Clock className="mr-1 h-3 w-3" />
                                {format(new Date(activity.timestamp), 'h:mm a')}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                  <Clock className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-medium">No activities found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {searchQuery || filter !== 'all'
                    ? 'Try adjusting your filters or search query'
                    : 'Your activity history will appear here'}
                </p>
                {(searchQuery || filter !== 'all') && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setSearchQuery('');
                      setFilter('all');
                    }}
                  >
                    Clear filters
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {Object.keys(groupedActivities).length > 0 && (
          <div className="flex justify-center">
            <Button variant="outline" size="lg">
              Load More
            </Button>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
