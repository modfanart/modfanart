'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Download,
  Edit,
  Eye,
  MessageSquare,
  Share2,
  Tag,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

interface SubmissionPageProps {
  params: {
    subId: string;
    brandId: string;
  };
}

// Import the sample data
const fanArtSubmissions = [
  {
    id: 'sub-001',
    title: 'Squid Game Player 456',
    description: 'Fan art of Player 456 from Squid Game in his iconic green tracksuit',
    imageUrl: '/placeholder.svg?height=400&width=400&text=Squid+Game',
    status: 'approved',
    submittedAt: '2023-06-15T12:30:00Z',
    updatedAt: '2023-06-16T09:45:00Z',
    views: 245,
    change: 12,
    ipOwner: 'Netflix',
    category: 'Character Art',
    tags: ['squid game', 'tv series', 'character', 'digital art'],
    artist: 'Jane Cooper',
    artistEmail: 'jane.cooper@example.com',
    licenseType: 'Non-Commercial',
    reviewNotes:
      'Great work capturing the essence of the character. Approved for non-commercial use.',
    reviewedBy: 'Mark Wilson',
    reviewedAt: '2023-06-16T09:45:00Z',
    comments: [
      {
        id: 'comment-001',
        user: 'Mark Wilson',
        role: 'IP Reviewer',
        content:
          'Great attention to detail in this piece. The color palette matches the show perfectly.',
        timestamp: '2023-06-15T14:30:00Z',
      },
      {
        id: 'comment-002',
        user: 'Sarah Johnson',
        role: 'Community Manager',
        content: 'This is one of our favorite submissions this month!',
        timestamp: '2023-06-16T08:15:00Z',
      },
    ],
  },
  {
    id: 'sub-002',
    title: 'Ahsoka Tano Portrait',
    description: 'Digital painting of Ahsoka Tano from Star Wars: The Clone Wars',
    imageUrl: '/placeholder.svg?height=400&width=400&text=Ahsoka+Tano',
    status: 'licensed',
    submittedAt: '2023-05-22T14:20:00Z',
    updatedAt: '2023-05-30T11:15:00Z',
    views: 512,
    change: 28,
    ipOwner: 'Disney/Lucasfilm',
    category: 'Character Art',
    tags: ['star wars', 'ahsoka', 'character', 'digital painting'],
    artist: 'Alex Morgan',
    artistEmail: 'alex.morgan@example.com',
    licenseType: 'Commercial Limited',
    reviewNotes:
      'Excellent portrayal of the character. Approved for limited commercial use with attribution.',
    reviewedBy: 'John Smith',
    reviewedAt: '2023-05-25T10:30:00Z',
    comments: [
      {
        id: 'comment-003',
        user: 'John Smith',
        role: 'IP Reviewer',
        content: 'The likeness is spot on. Great work with the facial markings and expressions.',
        timestamp: '2023-05-23T11:45:00Z',
      },
    ],
    licenseDetails: {
      licenseId: 'LIC-2023-0042',
      issuedDate: '2023-05-30T11:15:00Z',
      expiryDate: '2024-05-30T11:15:00Z',
      terms:
        'Commercial use limited to online merchandise with maximum revenue cap of $10,000. Attribution required.',
      royaltyRate: '8%',
    },
  },
  {
    id: 'sub-003',
    title: 'Samurai Watercolor',
    description: 'Traditional watercolor painting of a samurai warrior in battle stance',
    imageUrl: '/placeholder.svg?height=400&width=400&text=Samurai',
    status: 'pending',
    submittedAt: '2023-07-03T09:10:00Z',
    updatedAt: '2023-07-03T09:10:00Z',
    views: 87,
    change: 87,
    ipOwner: 'Original Creation',
    category: 'Traditional Art',
    tags: ['samurai', 'watercolor', 'traditional', 'warrior'],
    artist: 'Kenji Tanaka',
    artistEmail: 'kenji.tanaka@example.com',
    licenseType: 'N/A',
    reviewNotes: '',
    reviewedBy: '',
    reviewedAt: '',
    comments: [],
  },
  {
    id: 'sub-004',
    title: 'Cytus II - Cherry',
    description: 'Fan art of Cherry character from the rhythm game Cytus II',
    imageUrl: '/placeholder.svg?height=400&width=400&text=Cytus+II',
    status: 'pending',
    submittedAt: '2023-07-01T16:45:00Z',
    updatedAt: '2023-07-01T16:45:00Z',
    views: 124,
    change: 15,
    ipOwner: 'Rayark Inc.',
    category: 'Game Art',
    tags: ['cytus', 'rhythm game', 'character', 'digital art'],
    artist: 'Mei Lin',
    artistEmail: 'mei.lin@example.com',
    licenseType: 'N/A',
    reviewNotes: '',
    reviewedBy: '',
    reviewedAt: '',
    comments: [],
  },
  {
    id: 'sub-005',
    title: 'Jujutsu Kaisen Character',
    description: 'Digital illustration of Satoru Gojo from Jujutsu Kaisen anime',
    imageUrl: '/placeholder.svg?height=400&width=400&text=Jujutsu+Kaisen',
    status: 'approved',
    submittedAt: '2023-06-10T11:30:00Z',
    updatedAt: '2023-06-12T14:20:00Z',
    views: 378,
    change: 22,
    ipOwner: 'MAPPA/Shueisha',
    category: 'Anime Art',
    tags: ['jujutsu kaisen', 'anime', 'character', 'digital illustration'],
    artist: 'Hiroshi Nakamura',
    artistEmail: 'hiroshi.nakamura@example.com',
    licenseType: 'Non-Commercial',
    reviewNotes: 'Excellent representation of the character. Approved for non-commercial use only.',
    reviewedBy: 'Emily Chen',
    reviewedAt: '2023-06-12T14:20:00Z',
    comments: [
      {
        id: 'comment-004',
        user: 'Emily Chen',
        role: 'IP Reviewer',
        content: 'The art style is very faithful to the original. Great work on the details.',
        timestamp: '2023-06-11T13:20:00Z',
      },
    ],
  },
  {
    id: 'sub-006',
    title: 'Street Fighter - Chun-Li',
    description: 'Digital painting of Chun-Li from the Street Fighter game series',
    imageUrl: '/placeholder.svg?height=400&width=400&text=Chun-Li',
    status: 'rejected',
    submittedAt: '2023-05-05T10:15:00Z',
    updatedAt: '2023-05-07T09:30:00Z',
    views: 92,
    change: -5,
    ipOwner: 'Capcom',
    category: 'Game Art',
    tags: ['street fighter', 'chun-li', 'game', 'character'],
    artist: 'Carlos Rodriguez',
    artistEmail: 'carlos.rodriguez@example.com',
    licenseType: 'N/A',
    reviewNotes:
      'The submission contains elements that are too similar to official promotional artwork. Please revise with a more original interpretation.',
    reviewedBy: 'David Park',
    reviewedAt: '2023-05-07T09:30:00Z',
    comments: [
      {
        id: 'comment-005',
        user: 'David Park',
        role: 'IP Reviewer',
        content:
          "While the quality is good, this appears to be too derivative of Capcom's official artwork. Please submit a more transformative work.",
        timestamp: '2023-05-06T15:45:00Z',
      },
    ],
  },
  {
    id: 'sub-007',
    title: 'Deathwing Dragon',
    description: 'Digital illustration of Deathwing from World of Warcraft',
    imageUrl: '/placeholder.svg?height=400&width=400&text=Deathwing',
    status: 'licensed',
    submittedAt: '2023-04-18T13:40:00Z',
    updatedAt: '2023-04-25T15:20:00Z',
    views: 423,
    change: 18,
    ipOwner: 'Blizzard Entertainment',
    category: 'Game Art',
    tags: ['world of warcraft', 'dragon', 'deathwing', 'digital art'],
    artist: 'Sarah Johnson',
    artistEmail: 'sarah.johnson@example.com',
    licenseType: 'Commercial Full',
    reviewNotes:
      'Outstanding work that captures the essence of the character. Approved for full commercial licensing.',
    reviewedBy: 'Michael Brown',
    reviewedAt: '2023-04-20T11:15:00Z',
    comments: [
      {
        id: 'comment-006',
        user: 'Michael Brown',
        role: 'IP Reviewer',
        content:
          'This is exceptional work. The details on the scales and the lighting effects are particularly impressive.',
        timestamp: '2023-04-19T10:30:00Z',
      },
      {
        id: 'comment-007',
        user: 'Lisa Wong',
        role: 'Licensing Manager',
        content:
          "We'd like to offer a full commercial license for this piece. Please check your email for details.",
        timestamp: '2023-04-22T14:15:00Z',
      },
    ],
    licenseDetails: {
      licenseId: 'LIC-2023-0078',
      issuedDate: '2023-04-25T15:20:00Z',
      expiryDate: '2025-04-25T15:20:00Z',
      terms:
        'Full commercial use including merchandise, prints, and digital distribution. Attribution required.',
      royaltyRate: '12%',
    },
  },
  {
    id: 'sub-008',
    title: 'Batman Dark Knight',
    description: 'Noir-style illustration of Batman from DC Comics',
    imageUrl: '/placeholder.svg?height=400&width=400&text=Batman',
    status: 'pending',
    submittedAt: '2023-07-05T08:20:00Z',
    updatedAt: '2023-07-05T08:20:00Z',
    views: 56,
    change: 56,
    ipOwner: 'DC Comics',
    category: 'Comic Art',
    tags: ['batman', 'dc comics', 'superhero', 'noir'],
    artist: 'Michael Brown',
    artistEmail: 'michael.brown@example.com',
    licenseType: 'N/A',
    reviewNotes: '',
    reviewedBy: '',
    reviewedAt: '',
    comments: [],
  },
  {
    id: 'sub-009',
    title: 'Superman Abstract',
    description: 'Abstract interpretation of Superman in flight',
    imageUrl: '/placeholder.svg?height=400&width=400&text=Superman',
    status: 'approved',
    submittedAt: '2023-06-20T09:50:00Z',
    updatedAt: '2023-06-22T11:30:00Z',
    views: 187,
    change: 14,
    ipOwner: 'DC Comics',
    category: 'Comic Art',
    tags: ['superman', 'dc comics', 'abstract', 'superhero'],
    artist: 'Emma Wilson',
    artistEmail: 'emma.wilson@example.com',
    licenseType: 'Non-Commercial',
    reviewNotes:
      'Creative abstract interpretation that maintains the essence of the character. Approved for non-commercial use.',
    reviewedBy: 'Thomas Lee',
    reviewedAt: '2023-06-22T11:30:00Z',
    comments: [
      {
        id: 'comment-008',
        user: 'Thomas Lee',
        role: 'IP Reviewer',
        content:
          'I appreciate the abstract approach while still making the subject recognizable. Good use of color and movement.',
        timestamp: '2023-06-21T13:40:00Z',
      },
    ],
  },
];

function SubmissionDetailPageContent({ subId, brandId }: { subId: string; brandId: string }) {
  const id = subId;
  const router = useRouter();
  const [submission, setSubmission] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubmission = async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Find the submission in our sample data
      const foundSubmission = fanArtSubmissions.find((sub) => sub.id === id);

      if (foundSubmission) {
        setSubmission(foundSubmission);
      } else {
        // If not found, redirect to 404
        router.push('/submissions/not-found');
      }

      setIsLoading(false);
    };

    fetchSubmission();
  }, [id, router]);

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800 hover:bg-red-100 hover:text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 hover:text-yellow-800';
      case 'licensed':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100 hover:text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100 hover:text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4 md:px-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            <Skeleton className="h-4 w-20" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="aspect-square relative rounded-md overflow-hidden">
                  <Skeleton className="h-full w-full absolute" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!submission) {
    return null;
  }

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex items-center mb-6">
        <Link href={`/brand/manage/${brandId}/`}>
          <Button variant="ghost" size="sm" className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Submissions
          </Button>
        </Link>
        <Badge className={getStatusBadge(submission.status)}>
          {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{submission.title}</CardTitle>
              <CardDescription>{submission.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-square relative rounded-md overflow-hidden">
                <Image
                  src={submission.imageUrl || '/placeholder.svg'}
                  alt={submission.title}
                  fill
                  className="object-contain"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="flex items-center text-sm text-muted-foreground">
                <Eye className="h-4 w-4 mr-1" />
                {submission.views} views
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                {submission.status !== 'licensed' && (
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>

          <Tabs defaultValue="details">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="comments">
                Comments ({submission.comments?.length || 0})
              </TabsTrigger>
              {submission.status === 'licensed' && (
                <TabsTrigger value="license">License Info</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="details" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Submission Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium">Artist</h4>
                      <p className="text-sm text-muted-foreground flex items-center">
                        <User className="h-3.5 w-3.5 mr-1" />
                        {submission.artist}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Category</h4>
                      <p className="text-sm text-muted-foreground">{submission.category}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">IP Owner</h4>
                      <p className="text-sm text-muted-foreground">{submission.ipOwner}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">License Type</h4>
                      <p className="text-sm text-muted-foreground">{submission.licenseType}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Submitted</h4>
                      <p className="text-sm text-muted-foreground flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        {new Date(submission.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Last Updated</h4>
                      <p className="text-sm text-muted-foreground flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        {new Date(submission.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {submission.reviewNotes && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="text-sm font-medium mb-2">Review Notes</h4>
                        <div className="bg-muted p-3 rounded-md text-sm">
                          {submission.reviewNotes}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Reviewed by {submission.reviewedBy} on{' '}
                          {new Date(submission.reviewedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comments" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Comments</CardTitle>
                </CardHeader>
                <CardContent>
                  {submission.comments && submission.comments.length > 0 ? (
                    <div className="space-y-4">
                      {submission.comments.map((comment: any) => (
                        <div key={comment.id} className="border rounded-md p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium">{comment.user}</p>
                              <p className="text-xs text-muted-foreground">{comment.role}</p>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {new Date(comment.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <p className="text-sm">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-6">No comments yet</p>
                  )}
                </CardContent>
                <CardFooter>
                  <Button className="w-full">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Add Comment
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {submission.status === 'licensed' && (
              <TabsContent value="license" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>License Information</CardTitle>
                    <CardDescription>
                      License ID: {submission.licenseDetails.licenseId}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium">Issued Date</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(submission.licenseDetails.issuedDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Expiry Date</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(submission.licenseDetails.expiryDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Royalty Rate</h4>
                        <p className="text-sm text-muted-foreground">
                          {submission.licenseDetails.royaltyRate}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="text-sm font-medium mb-2">License Terms</h4>
                      <div className="bg-muted p-3 rounded-md text-sm">
                        {submission.licenseDetails.terms}
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Download License Agreement
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Views</span>
                  <span className="font-medium">{submission.views}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Change</span>
                  <span
                    className={`font-medium ${submission.change > 0 ? 'text-green-500' : 'text-red-500'}`}
                  >
                    {submission.change > 0 ? '+' : ''}
                    {submission.change}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Comments</span>
                  <span className="font-medium">{submission.comments?.length || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {submission.tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="flex items-center">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {submission.status === 'pending' && (
            <Card>
              <CardHeader>
                <CardTitle>Submission Status</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Your submission is currently under review. We'll notify you when there's an
                  update.
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span>Average review time:</span>
                  <span className="font-medium">2-3 business days</span>
                </div>
              </CardContent>
            </Card>
          )}

          {submission.status === 'approved' && !submission.licenseDetails && (
            <Card className="bg-green-50 dark:bg-green-950">
              <CardHeader>
                <CardTitle className="text-green-800 dark:text-green-300">
                  Ready for Licensing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-green-700 dark:text-green-400 mb-4">
                  Your submission has been approved and is ready for licensing!
                </p>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Apply for License
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default SubmissionDetailPageContent;
