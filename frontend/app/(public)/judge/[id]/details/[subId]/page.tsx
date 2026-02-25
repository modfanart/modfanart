import Link from "next/dist/client/link";
import React from "react";

import { ArrowLeft, Calendar, Clock, Edit, User, MessageSquare, Download, Share2, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";

interface VoteDetailsPageProps {
  params: {
    id: string
    subId: string
  }
}

const submissionDetails = [
  {
    id: "sub-001",
    contestId: "the-librarians",
    title: "Squid Game Player 456",
    description: "Fan art of Player 456 from Squid Game in his iconic green tracksuit",
    imageUrl: "/placeholder.svg?height=400&width=400&text=Squid+Game",
    status: "approved",
    submittedAt: "2023-06-15T12:30:00Z",
    updatedAt: "2023-06-16T09:45:00Z",
    ipOwner: "Netflix",
    category: "Character Art",
    tags: ["squid game", "tv series", "character", "digital art"],
    artist: "Jane Cooper",
    vote: 5,
    comments:[],
    reviewNotes: "Great use of color and composition! The character is instantly recognizable and captures the show's aesthetic.",
    reviewedBy: "Judge 1",
    reviewedAt: "2023-06-16T09:45:00Z"
  },
  {
    id: "sub-002",
    contestId: "the-librarians",
    title: "Ahsoka Tano Portrait",
    description: "Digital painting of Ahsoka Tano from Star Wars: The Clone Wars",
    imageUrl: "/placeholder.svg?height=400&width=400&text=Ahsoka+Tano",
    status: "licensed",
    submittedAt: "2023-05-22T14:20:00Z",
    updatedAt: "2023-05-30T11:15:00Z",
    ipOwner: "Disney/Lucasfilm",
    category: "Character Art",
    tags: ["star wars", "ahsoka", "character", "digital painting"],
    artist: "Alex Morgan",
    vote: 8,
    comments: [],
    reviewNotes: "Stunning portrait with excellent attention to detail. The lighting and color choices really bring Ahsoka to life.",
    reviewedBy: "Judge 2",
    reviewedAt: "2023-05-30T11:15:00Z",
  }
]

export const getSubmissionById = (subId: string) => {
  return submissionDetails[0]
  //return submissionDetails.find(sub => sub.id === subId) || null
}

export default async function VoteDetailsPage({ params }: VoteDetailsPageProps) {
  const { id, subId } = await params
  const submission = getSubmissionById(subId)

  if (!submission) {
    return (
      <div className="container mx-auto py-6 px-4 md:px-6">
        <h1 className="text-2xl font-bold">Submission not found</h1>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex items-center mb-6">
        <Link href={`/judge/${id}`}>
          <Button variant="ghost" size="sm" className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Submissions
          </Button>
        </Link>
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
                  src={submission.imageUrl || "/placeholder.svg"}
                  alt={submission.title}
                  fill
                  className="object-contain"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="flex items-center text-sm text-muted-foreground">
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
                {submission.status !== "licensed" && (
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
              <TabsTrigger value="comments">Comments ({submission.comments?.length || 0})</TabsTrigger>
              {submission.status === "licensed" && <TabsTrigger value="license">License Info</TabsTrigger>}
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
                        <div className="bg-muted p-3 rounded-md text-sm">{submission.reviewNotes}</div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Reviewed by {submission.reviewedBy} on {new Date(submission.reviewedAt).toLocaleDateString()}
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

          </Tabs>
        </div>

        <div className="space-y-6">
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
        </div>
      </div>
    </div>
  )
}