import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Overview } from '@/components/overview';
import { RecentSubmissions } from '@/components/recent-submissions';
import { SubscriptionInfo } from '@/components/subscription-info';
import {
  PlusCircle,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  ImageIcon,
  AlertTriangle,
} from 'lucide-react';
import { DashboardShell } from '@/components/dashboard-shell';
import { Suspense } from 'react';

// Sample data for submissions with actual fan art
const submissions = [
  {
    id: '64db6ca4-4336-495c-a873-10967141e292',
    title: 'Squid Game Player 456',
    imageUrl: '/placeholder.svg?height=500&width=500&text=Squid+Game+456',
    status: 'pending',
    submittedAt: '2023-03-15T12:30:00Z',
    artist: 'Min-Ji Park',
    description: 'Fan art of Player 456 from Squid Game in his iconic green tracksuit',
    ipOwner: 'Netflix',
  },
  {
    id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
    title: 'Ahsoka Tano Portrait',
    imageUrl: '/placeholder.svg?height=500&width=500&text=Ahsoka+Tano',
    status: 'approved',
    submittedAt: '2023-03-14T09:15:00Z',
    artist: 'Alex Rodriguez',
    description: 'Digital painting of Ahsoka Tano from Star Wars: The Clone Wars',
    ipOwner: 'Disney/Lucasfilm',
  },
  {
    id: '1dc6e36c-2644-4695-812b-f4d95929680f',
    title: 'Watercolor Samurai',
    imageUrl: '/placeholder.svg?height=500&width=500&text=Samurai+Watercolor',
    status: 'licensed',
    submittedAt: '2023-03-12T15:45:00Z',
    artist: 'Hiroshi Tanaka',
    description: 'Traditional watercolor painting of a samurai warrior in battle stance',
    ipOwner: 'Original Creation',
  },
  {
    id: '7729424a-c947-4017-8959-34950780159f',
    title: 'Cytus II - Cherry',
    imageUrl: '/placeholder.svg?height=500&width=500&text=Cytus+II+Cherry',
    status: 'rejected',
    submittedAt: '2023-03-10T11:00:00Z',
    artist: 'Wei Chen',
    description: 'Fan art of Cherry character from the rhythm game Cytus II',
    ipOwner: 'Rayark Inc.',
  },
  {
    id: '5f28c6a7-3a67-4f8d-b85e-9a3dc1f8b5a2',
    title: 'Jujutsu Kaisen Character',
    imageUrl: '/placeholder.svg?height=500&width=500&text=Jujutsu+Kaisen',
    status: 'pending',
    submittedAt: '2023-03-08T14:20:00Z',
    artist: 'Kenji Yamamoto',
    description: 'Digital illustration of a character from Jujutsu Kaisen anime series',
    ipOwner: 'MAPPA/Shueisha',
  },
  {
    id: '3e7d8f9c-2b1a-4c5d-9e6f-7g8h9i0j1k2l',
    title: 'Street Fighter Chun-Li',
    imageUrl: '/placeholder.svg?height=500&width=500&text=Chun-Li',
    status: 'approved',
    submittedAt: '2023-03-05T10:30:00Z',
    artist: 'Carlos Mendez',
    description: 'Dynamic illustration of Chun-Li from the Street Fighter game series',
    ipOwner: 'Capcom',
  },
  {
    id: '2a3b4c5d-6e7f-8g9h-0i1j-2k3l4m5n6o7p',
    title: 'Deathwing Dragon',
    imageUrl: '/placeholder.svg?height=500&width=500&text=Deathwing',
    status: 'licensed',
    submittedAt: '2023-03-03T16:45:00Z',
    artist: 'Sarah Johnson',
    description: 'Epic digital painting of Deathwing from World of Warcraft',
    ipOwner: 'Blizzard Entertainment',
  },
  {
    id: '8q9r0s1t-2u3v-4w5x-6y7z-8a9b0c1d2e3f',
    title: 'Batman Dark Knight',
    imageUrl: '/placeholder.svg?height=500&width=500&text=Batman',
    status: 'pending',
    submittedAt: '2023-03-01T09:15:00Z',
    artist: 'Michael Brown',
    description: 'Noir-style illustration of Batman overlooking Gotham City',
    ipOwner: 'DC Comics',
  },
];

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

function DashboardContent() {
  console.log('Dashboard content component rendering');
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
          <Link href="/submissions/new">
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
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground">+22% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">+15% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">-5% from last month</p>
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
              <CardDescription>Submissions awaiting your review.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <RecentSubmissions />
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
                  <Link href="/submissions/new">
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

export default function DashboardPage() {
  console.log('Dashboard page component rendering');
  return (
    <DashboardShell>
      <Suspense fallback={<div className="p-6">Loading dashboard...</div>}>
        <DashboardContent />
      </Suspense>
    </DashboardShell>
  );
}
