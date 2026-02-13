"use client"

import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Edit, Trash2, Eye, MoreHorizontal, CheckCircle, XCircle, Clock, DollarSign, CircleArrowLeft } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"

// Sample data for submissions using our fan art collection
const fanArtSubmissions = [
  {
    id: "sub-001",
    title: "Squid Game Player 456",
    description: "Fan art of Player 456 from Squid Game in his iconic green tracksuit",
    imageUrl: "/placeholder.svg?height=400&width=400&text=Squid+Game",
    status: "approved",
    submittedAt: "2023-06-15T12:30:00Z",
    updatedAt: "2023-06-16T09:45:00Z",
    views: 245,
    change: 12,
    ipOwner: "Netflix",
    category: "Character Art",
    tags: ["squid game", "tv series", "character", "digital art"],
    artist: "Jane Cooper",
  },
  {
    id: "sub-002",
    title: "Ahsoka Tano Portrait",
    description: "Digital painting of Ahsoka Tano from Star Wars: The Clone Wars",
    imageUrl: "/placeholder.svg?height=400&width=400&text=Ahsoka+Tano",
    status: "licensed",
    submittedAt: "2023-05-22T14:20:00Z",
    updatedAt: "2023-05-30T11:15:00Z",
    views: 512,
    change: 28,
    ipOwner: "Disney/Lucasfilm",
    category: "Character Art",
    tags: ["star wars", "ahsoka", "character", "digital painting"],
    artist: "Alex Morgan",
  },
  {
    id: "sub-003",
    title: "Samurai Watercolor",
    description: "Traditional watercolor painting of a samurai warrior in battle stance",
    imageUrl: "/placeholder.svg?height=400&width=400&text=Samurai",
    status: "pending",
    submittedAt: "2023-07-03T09:10:00Z",
    updatedAt: "2023-07-03T09:10:00Z",
    views: 87,
    change: 87,
    ipOwner: "Original Creation",
    category: "Traditional Art",
    tags: ["samurai", "watercolor", "traditional", "warrior"],
    artist: "Kenji Tanaka",
  },
  {
    id: "sub-004",
    title: "Cytus II - Cherry",
    description: "Fan art of Cherry character from the rhythm game Cytus II",
    imageUrl: "/placeholder.svg?height=400&width=400&text=Cytus+II",
    status: "pending",
    submittedAt: "2023-07-01T16:45:00Z",
    updatedAt: "2023-07-01T16:45:00Z",
    views: 124,
    change: 15,
    ipOwner: "Rayark Inc.",
    category: "Game Art",
    tags: ["cytus", "rhythm game", "character", "digital art"],
    artist: "Mei Lin",
  },
  {
    id: "sub-005",
    title: "Jujutsu Kaisen Character",
    description: "Digital illustration of Satoru Gojo from Jujutsu Kaisen anime",
    imageUrl: "/placeholder.svg?height=400&width=400&text=Jujutsu+Kaisen",
    status: "approved",
    submittedAt: "2023-06-10T11:30:00Z",
    updatedAt: "2023-06-12T14:20:00Z",
    views: 378,
    change: 22,
    ipOwner: "MAPPA/Shueisha",
    category: "Anime Art",
    tags: ["jujutsu kaisen", "anime", "character", "digital illustration"],
    artist: "Hiroshi Nakamura",
  },
  {
    id: "sub-006",
    title: "Street Fighter - Chun-Li",
    description: "Digital painting of Chun-Li from the Street Fighter game series",
    imageUrl: "/placeholder.svg?height=400&width=400&text=Chun-Li",
    status: "rejected",
    submittedAt: "2023-05-05T10:15:00Z",
    updatedAt: "2023-05-07T09:30:00Z",
    views: 92,
    change: -5,
    ipOwner: "Capcom",
    category: "Game Art",
    tags: ["street fighter", "chun-li", "game", "character"],
    artist: "Carlos Rodriguez",
  },
  {
    id: "sub-007",
    title: "Deathwing Dragon",
    description: "Digital illustration of Deathwing from World of Warcraft",
    imageUrl: "/placeholder.svg?height=400&width=400&text=Deathwing",
    status: "licensed",
    submittedAt: "2023-04-18T13:40:00Z",
    updatedAt: "2023-04-25T15:20:00Z",
    views: 423,
    change: 18,
    ipOwner: "Blizzard Entertainment",
    category: "Game Art",
    tags: ["world of warcraft", "dragon", "deathwing", "digital art"],
    artist: "Sarah Johnson",
  },
  {
    id: "sub-008",
    title: "Batman Dark Knight",
    description: "Noir-style illustration of Batman from DC Comics",
    imageUrl: "/placeholder.svg?height=400&width=400&text=Batman",
    status: "pending",
    submittedAt: "2023-07-05T08:20:00Z",
    updatedAt: "2023-07-05T08:20:00Z",
    views: 56,
    change: 56,
    ipOwner: "DC Comics",
    category: "Comic Art",
    tags: ["batman", "dc comics", "superhero", "noir"],
    artist: "Michael Brown",
  },
  {
    id: "sub-009",
    title: "Superman Abstract",
    description: "Abstract interpretation of Superman in flight",
    imageUrl: "/placeholder.svg?height=400&width=400&text=Superman",
    status: "approved",
    submittedAt: "2023-06-20T09:50:00Z",
    updatedAt: "2023-06-22T11:30:00Z",
    views: 187,
    change: 14,
    ipOwner: "DC Comics",
    category: "Comic Art",
    tags: ["superman", "dc comics", "abstract", "superhero"],
    artist: "Emma Wilson",
  },
]

export default function ManageSubmissionsPage() {
  const [submissions, setSubmissions] = useState<typeof fanArtSubmissions>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const params = useParams<{ id: string }>()
  const brandId = params.id

  // Simulate API call to fetch submissions
  useEffect(() => {
    const fetchSubmissions = async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))
      // Always use the sample data
      setSubmissions(fanArtSubmissions)
      setIsLoading(false)
    }

    fetchSubmissions()
  }, [])

  // Handle delete submission
  const handleDelete = (id: string) => {
    setSubmissions(submissions.filter((sub) => sub.id !== id))
    // If all submissions are deleted, reset to sample data after a short delay
    if (submissions.length <= 1) {
      setTimeout(() => {
        setSubmissions(fanArtSubmissions)
      }, 2000)
    }
    setDeleteId(null)
  }

  function updateSubmissionStatus(
    id: string,
    newStatus: string
    ) {
    setSubmissions(prev =>
        prev.map(submission =>
        submission.id === id
            ? { ...submission, status: newStatus }
            : submission
        )
    )
    }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "licensed":
        return <DollarSign className="h-4 w-4 text-blue-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800 hover:bg-red-100 hover:text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 hover:text-yellow-800"
      case "licensed":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100 hover:text-blue-800"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100 hover:text-gray-800"
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">
            <Link href={`/brand/manage`} className="w-full">
                <CircleArrowLeft className="inline mr-2 h-8 w-8" />
            </Link>
            My Submissions</h1>
        <div className="flex items-center gap-2">
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-square relative">
                <Skeleton className="h-full w-full absolute" />
              </div>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-between">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-9 rounded-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="licensed">Licensed</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          {/* All Submissions Tab */}
          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {submissions.map((submission) => (
                <Card key={submission.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-square relative">
                    <Image
                      src={submission.imageUrl || "/placeholder.svg"}
                      alt={submission.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge className={getStatusBadge(submission.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(submission.status)}
                          {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                        </span>
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h3 className="font-medium line-clamp-1">{submission.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{submission.description}</p>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <span>Artist: {submission.artist || "Unknown"}</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-muted-foreground">Views:</span>
                          <span className="font-medium">{submission.views}</span>
                          <span className={`text-xs ${submission.change > 0 ? "text-green-500" : "text-red-500"}`}>
                            {submission.change > 0 ? "+" : ""}
                            {submission.change}%
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(submission.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex justify-between">
                    <Link href={`/brand/manage/${brandId}/details/${submission.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="mr-1 h-4 w-4" />
                        View Details
                      </Button>
                    </Link>
                    {submission.status !== "licensed" ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {submission.status === "pending" ? 
                                <DropdownMenuItem>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Approve
                                </DropdownMenuItem>
                            : null }
                            {submission.status === "pending" ? 
                            <DropdownMenuItem>
                                <XCircle className="mr-2 h-4 w-4" />
                                Reject
                            </DropdownMenuItem>
                            : null }
                            {submission.status === "approved" || submission.status === "rejected" ?
                                <DropdownMenuItem>
                                    <Clock className="mr-2 h-4 w-4" />
                                    Mark as Pending
                                </DropdownMenuItem>
                            : null }
                            {submission.status === "approved" ? (
                                <DropdownMenuItem>
                                    <DollarSign className="mr-2 h-4 w-4" />
                                    Submit for Licensing
                                </DropdownMenuItem>
                            ) : null }

                            {/* <DropdownMenuItem disabled={submission.status === "licensed"}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit submission
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View analytics
                            </DropdownMenuItem> */}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : null}
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Filtered Tabs */}
          {["pending", "approved", "licensed", "rejected"].map((status) => (
            <TabsContent key={status} value={status} className="mt-6">
              {submissions.filter((s) => s.status === status).length === 0 ? (
                <div className="text-center py-10">
                  <h3 className="text-lg font-medium">No {status} submissions</h3>
                  <p className="text-muted-foreground mt-2">Switch to the "All" tab to see all your submissions.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {submissions
                    .filter((submission) => submission.status === status)
                    .map((submission) => (
                      <Card key={submission.id} className="overflow-hidden hover:shadow-md transition-shadow">
                        <div className="aspect-square relative">
                          <Image
                            src={submission.imageUrl || "/placeholder.svg"}
                            alt={submission.title}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute top-2 right-2">
                            <Badge className={getStatusBadge(submission.status)}>
                              <span className="flex items-center gap-1">
                                {getStatusIcon(submission.status)}
                                {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                              </span>
                            </Badge>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <h3 className="font-medium line-clamp-1">{submission.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">{submission.description}</p>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <span>Artist: {submission.artist || "Unknown"}</span>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-1">
                                <span className="text-sm text-muted-foreground">Views:</span>
                                <span className="font-medium">{submission.views}</span>
                                <span
                                  className={`text-xs ${submission.change > 0 ? "text-green-500" : "text-red-500"}`}
                                >
                                  {submission.change > 0 ? "+" : ""}
                                  {submission.change}%
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {new Date(submission.submittedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="p-4 pt-0 flex justify-between">
                          <Link href={`/brand/manage/${brandId}/details/${submission.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="mr-1 h-4 w-4" />
                              View Details
                            </Button>
                          </Link>
                          {submission.status !== "licensed" ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Open menu</span>
                                </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {submission.status === "pending" ? 
                                    <DropdownMenuItem>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Approve
                                    </DropdownMenuItem>
                                    : null }
                                    {submission.status === "pending" ? 
                                    <DropdownMenuItem>
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Reject
                                    </DropdownMenuItem>
                                    : null }
                                    {submission.status === "approved" || submission.status === "rejected" ?
                                    <DropdownMenuItem>
                                        <Clock className="mr-2 h-4 w-4" />
                                        Mark as Pending
                                    </DropdownMenuItem>
                                    :null }
                                    {submission.status === "approved" ? (
                                        <DropdownMenuItem>
                                            <DollarSign className="mr-2 h-4 w-4" />
                                            Submit for Licensing
                                        </DropdownMenuItem>
                                    ) : null }
                                {/* <DropdownMenuItem disabled={submission.status === "licensed"}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit submission
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View analytics
                                </DropdownMenuItem> */}
                                </DropdownMenuContent>
                            </DropdownMenu>
                          ) : null }
                            

                        </CardFooter>
                      </Card>
                    ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  )
}