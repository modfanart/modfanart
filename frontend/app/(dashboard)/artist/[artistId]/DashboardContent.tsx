import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Overview } from '@/components/overview';
import { RecentSubmissions } from '@/components/submissions/recent-submissions';
import { SubscriptionInfo } from '@/components/submissions/subscription-info';
import {
  PlusCircle,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  ImageIcon,
  AlertTriangle,
} from 'lucide-react';
import { Suspense } from 'react';
import { useGetMyContestEntriesQuery } from '@/services/api/contestsApi';

// entry_status from the backend is 'pending' | 'approved' | 'rejected' | 'disqualified'
function mapEntryToSubmission(entry: any) {
  return {
    id: entry.entry_id,
    title: entry.artwork_title || entry.contest_title || 'Untitled',
    imageUrl: entry.thumbnail_url || '/placeholder.svg',
    status: entry.entry_status,
    submittedAt: entry.submitted_at,
    artist: entry.contest_title,
  };
}

// In a real app, this would come from your database
// Define user information with proper defaults to avoid undefined errors
const userData = {
  role: 'artist', // Could be "artist", "creator", or "brand"
  name: 'Joe Artist',
  email: 'joe@example.com',
  subscriptionTier: 'premium_artist', // Could be "free", "premium_artist", "creator", or "enterprise"
  subscriptionStatus: 'active', // Could be "active", "inactive", "past_due", or "canceled"
  subscriptionRenewalDate: '2024-12-31',
  stripeCustomerId: 'cus_123456789',
};

export default function DashboardContent() {
  const { data, isLoading } = useGetMyContestEntriesQuery({ limit: 100 });
  const submissions = (data?.entries || []).map(mapEntryToSubmission);

  const totalCount = submissions.length;
  const approvedCount = submissions.filter((s) => s.status === 'approved').length;
  const rejectedCount = submissions.filter((s) => s.status === 'rejected').length;

  const recentSubmissions = submissions
    .filter((s) => s.status === 'pending')
    .slice(0, 5)
    .map((s) => ({
      id: s.id,
      title: s.title,
      artist: { name: s.artist || 'You', image: '', initials: 'YOU' },
      date: new Date(s.submittedAt).toLocaleDateString(),
      status: s.status,
    }));

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {userData.name}! Here's an overview of your fan art licensing activity.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button className="bg-[#9747ff] hover:bg-[#8035e0]">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Submission
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '—' : totalCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '—' : approvedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '—' : rejectedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$4,891</div>
            <p className="text-xs text-muted-foreground">+18% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-12">
        <div className="col-span-12 md:col-span-8 grid gap-4 md:grid-cols-2">
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <CardDescription>Monthly earnings from licensed fan art.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <Overview />
            </CardContent>
          </Card>

          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Recent Submissions</CardTitle>
              <CardDescription>Your submissions awaiting moderation.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <RecentSubmissions submissions={recentSubmissions} />
            </CardContent>
          </Card>

          <Card className="md:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle>Subscription</CardTitle>
              <CardDescription>Your current plan and status.</CardDescription>
            </CardHeader>
            <CardContent>
              <SubscriptionInfo
                tier={
                  userData.subscriptionTier as 'free' | 'premium_artist' | 'creator' | 'enterprise'
                }
                status={
                  userData.subscriptionStatus as 'active' | 'inactive' | 'past_due' | 'canceled'
                }
                renewalDate={userData.subscriptionRenewalDate}
                customerId={userData.stripeCustomerId}
              />
            </CardContent>
          </Card>
        </div>

        <Card className="col-span-12 md:col-span-4">
          <CardHeader>
            <CardTitle>AI Moderation Insights</CardTitle>
            <CardDescription>Performance of your submissions against AI screening.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  AI Detection Scores
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Human-created artwork</span>
                    <span className="font-medium">92%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: '92%' }}
                    ></div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">IP Compliance</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Compliance rate</span>
                    <span className="font-medium">85%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Content Safety</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Safety score</span>
                    <span className="font-medium">98%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: '98%' }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/analytics">
                    View Detailed Analytics
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <Tabs defaultValue="all">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="all">All Submissions</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="licensed">Licensed</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <Link href="/submissions/manage">
                <Button variant="outline" size="sm">
                  View All
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
          <TabsContent value="all" className="mt-6">
            {submissions.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8">
                <div className="flex flex-col items-center justify-center text-center">
                  <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No submissions yet</h3>
                  <p className="text-muted-foreground mb-4 max-w-md">
                    Start by creating your first fan art submission to begin the licensing process.
                  </p>
                  <Link href="/">
                    <Button className="bg-[#9747ff] hover:bg-[#8035e0]">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create New Submission
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {submissions.map((submission) => (
                  <Link href={`/submissions/${submission.id}`} key={submission.id}>
                    <Card className="overflow-hidden hover:shadow-md transition-shadow">
                      <div className="aspect-square relative">
                        <Image
                          src={submission.imageUrl || '/placeholder.svg'}
                          alt={submission.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <CardContent className="p-4">
                        <div className="flex flex-col space-y-1">
                          <h3 className="font-medium line-clamp-1">{submission.title}</h3>
                          <p className="text-xs text-muted-foreground">By {submission.artist}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(submission.submittedAt).toLocaleDateString()}
                          </p>
                          <div className="mt-1">
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                submission.status === 'approved'
                                  ? 'bg-green-100 text-green-800'
                                  : submission.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : submission.status === 'licensed'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {submission.status.charAt(0).toUpperCase() +
                                submission.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="pending" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {submissions
                .filter((submission) => submission.status === 'pending')
                .map((submission) => (
                  <Link href={`/submissions/${submission.id}`} key={submission.id}>
                    <Card className="overflow-hidden hover:shadow-md transition-shadow">
                      <div className="aspect-square relative">
                        <Image
                          src={submission.imageUrl || '/placeholder.svg'}
                          alt={submission.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <CardContent className="p-4">
                        <div className="flex flex-col space-y-1">
                          <h3 className="font-medium line-clamp-1">{submission.title}</h3>
                          <p className="text-xs text-muted-foreground">By {submission.artist}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(submission.submittedAt).toLocaleDateString()}
                          </p>
                          <div className="mt-1">
                            <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                              Pending
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
            </div>
          </TabsContent>
          <TabsContent value="approved" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {submissions
                .filter((submission) => submission.status === 'approved')
                .map((submission) => (
                  <Link href={`/submissions/${submission.id}`} key={submission.id}>
                    <Card className="overflow-hidden hover:shadow-md transition-shadow">
                      <div className="aspect-square relative">
                        <Image
                          src={submission.imageUrl || '/placeholder.svg'}
                          alt={submission.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <CardContent className="p-4">
                        <div className="flex flex-col space-y-1">
                          <h3 className="font-medium line-clamp-1">{submission.title}</h3>
                          <p className="text-xs text-muted-foreground">By {submission.artist}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(submission.submittedAt).toLocaleDateString()}
                          </p>
                          <div className="mt-1">
                            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                              Approved
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
            </div>
          </TabsContent>
          <TabsContent value="licensed" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {submissions
                .filter((submission) => submission.status === 'licensed')
                .map((submission) => (
                  <Link href={`/submissions/${submission.id}`} key={submission.id}>
                    <Card className="overflow-hidden hover:shadow-md transition-shadow">
                      <div className="aspect-square relative">
                        <Image
                          src={submission.imageUrl || '/placeholder.svg'}
                          alt={submission.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <CardContent className="p-4">
                        <div className="flex flex-col space-y-1">
                          <h3 className="font-medium line-clamp-1">{submission.title}</h3>
                          <p className="text-xs text-muted-foreground">By {submission.artist}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(submission.submittedAt).toLocaleDateString()}
                          </p>
                          <div className="mt-1">
                            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                              Licensed
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
