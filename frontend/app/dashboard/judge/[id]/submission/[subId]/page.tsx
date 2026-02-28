// app/dashboard/judge/[id]/submission/[subId]/page.tsx

import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Edit,
  User,
  MessageSquare,
  Download,
  Share2,
  Tag,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';

interface Submission {
  id: string;
  contestId: string;
  title: string;
  description: string;
  imageUrl: string;
  status: string;
  submittedAt: string;
  updatedAt: string;
  ipOwner: string;
  category: string;
  tags: string[];
  artist: string;
  vote: number;
  comments: any[]; // replace with proper Comment type later
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

// ────────────────────────────────────────────────
// Mock data – replace with real DB fetch in production
// ────────────────────────────────────────────────
const mockSubmissions: Submission[] = [
  {
    id: 'sub-001',
    contestId: 'the-librarians',
    title: 'Squid Game Player 456',
    description: 'Fan art of Player 456 from Squid Game in his iconic green tracksuit',
    imageUrl: '/placeholder.svg?height=400&width=400&text=Squid+Game',
    status: 'approved',
    submittedAt: '2023-06-15T12:30:00Z',
    updatedAt: '2023-06-16T09:45:00Z',
    ipOwner: 'Netflix',
    category: 'Character Art',
    tags: ['squid game', 'tv series', 'character', 'digital art'],
    artist: 'Jane Cooper',
    vote: 5,
    comments: [],
    reviewNotes:
      "Great use of color and composition! The character is instantly recognizable and captures the show's aesthetic.",
    reviewedBy: 'Judge 1',
    reviewedAt: '2023-06-16T09:45:00Z',
  },
  {
    id: 'sub-002',
    contestId: 'the-librarians',
    title: 'Ahsoka Tano Portrait',
    description: 'Digital painting of Ahsoka Tano from Star Wars: The Clone Wars',
    imageUrl: '/placeholder.svg?height=400&width=400&text=Ahsoka+Tano',
    status: 'licensed',
    submittedAt: '2023-05-22T14:20:00Z',
    updatedAt: '2023-05-30T11:15:00Z',
    ipOwner: 'Disney/Lucasfilm',
    category: 'Character Art',
    tags: ['star wars', 'ahsoka', 'character', 'digital painting'],
    artist: 'Alex Morgan',
    vote: 8,
    comments: [],
    reviewNotes:
      'Stunning portrait with excellent attention to detail. The lighting and color choices really bring Ahsoka to life.',
    reviewedBy: 'Judge 2',
    reviewedAt: '2023-05-30T11:15:00Z',
  },
];

function getSubmissionById(subId: string): Submission | undefined {
  return mockSubmissions.find((sub) => sub.id === subId);
}

// ────────────────────────────────────────────────
// Page Component – Next.js 15+ async params pattern
// ────────────────────────────────────────────────
export default async function VoteDetailsPage({
  params,
}: {
  params: Promise<{ id: string; subId: string }>;
}) {
  const { id, subId } = await params;

  const submission = getSubmissionById(subId);

  if (!submission) {
    return (
      <div className="container mx-auto py-8 px-4 md:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Submission Not Found</h1>
          <p className="text-muted-foreground mb-6">
            We couldn&apos;t find a submission with ID{' '}
            <code className="bg-muted px-1.5 py-0.5 rounded">{subId}</code>.
          </p>
          <Button asChild>
            <Link href={`/dashboard/judge/${id}`}>Back to Judge Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      {/* Back navigation */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/dashboard/judge/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Submissions
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero Card with Image */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <CardTitle className="text-2xl sm:text-3xl">{submission.title}</CardTitle>
                  <CardDescription className="mt-2 text-base">
                    {submission.description}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-sm px-3 py-1">
                  {submission.status.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="aspect-[4/3] sm:aspect-video relative bg-muted/40">
                <Image
                  src={
                    submission.imageUrl || '/placeholder.svg?height=800&width=1200&text=Submission'
                  }
                  alt={submission.title}
                  fill
                  className="object-contain p-4 sm:p-8"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px"
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-wrap justify-between gap-4 pt-6">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  {submission.artist}
                </span>
                <span>•</span>
                <span>Votes: {submission.vote}</span>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                {submission.status !== 'licensed' && (
                  <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>

          {/* Tabs Section */}
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="comments">Comments ({submission.comments.length})</TabsTrigger>
              {submission.status === 'licensed' && (
                <TabsTrigger value="license">License</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="details" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Submission Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Artist</h4>
                      <p className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {submission.artist}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Category</h4>
                      <p>{submission.category}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">IP Owner</h4>
                      <p>{submission.ipOwner}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Submitted</h4>
                      <p className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(submission.submittedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">
                        Last Updated
                      </h4>
                      <p className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {new Date(submission.updatedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  {submission.reviewNotes && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="text-sm font-medium mb-3">Judge Review Notes</h4>
                        <div className="bg-muted/50 border rounded-lg p-5 text-sm leading-relaxed whitespace-pre-wrap">
                          {submission.reviewNotes}
                        </div>
                        <p className="mt-4 text-xs text-muted-foreground">
                          Reviewed by <strong>{submission.reviewedBy}</strong> on{' '}
                          {new Date(submission.reviewedAt!).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comments" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Comments & Feedback</CardTitle>
                </CardHeader>
                <CardContent>
                  {submission.comments.length > 0 ? (
                    <div className="space-y-5">
                      {/* Map comments when you add real data */}
                      <p className="text-center text-muted-foreground py-8">
                        No comments yet. Be the first to leave feedback!
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      No comments have been added yet.
                    </div>
                  )}
                </CardContent>
                <CardFooter className="border-t">
                  <Button className="w-full">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Add Comment
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {submission.status === 'licensed' && (
              <TabsContent value="license" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>License Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      License agreement and terms will appear here once finalized.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {submission.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    <Tag className="mr-1 h-3 w-3" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* You can add more sidebar widgets here later:
              - Voting breakdown
              - Similar submissions
              - Quick actions
              - Metadata / stats
          */}
        </div>
      </div>
    </div>
  );
}
