"use client"

import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, CircleArrowLeft } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface JudgeDashboardProps {
  params: Promise<{ id: string }>
}

//sample judge data
const fanArtSubmissions = [
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
  },
  {
    id: "sub-003",
    contestId: "the-librarians",
    title: "Samurai Watercolor",
    description: "Traditional watercolor painting of a samurai warrior in battle stance",
    imageUrl: "/placeholder.svg?height=400&width=400&text=Samurai",
    status: "pending",
    submittedAt: "2023-07-03T09:10:00Z",
    updatedAt: "2023-07-03T09:10:00Z",
    ipOwner: "Original Creation",
    category: "Traditional Art",
    tags: ["samurai", "watercolor", "traditional", "warrior"],
    artist: "Kenji Tanaka",
    vote: null,
  },
  {
    id: "sub-004",
    contestId: "the-librarians",
    title: "Cytus II - Cherry",
    description: "Fan art of Cherry character from the rhythm game Cytus II",
    imageUrl: "/placeholder.svg?height=400&width=400&text=Cytus+II",
    status: "pending",
    submittedAt: "2023-07-01T16:45:00Z",
    updatedAt: "2023-07-01T16:45:00Z",
    ipOwner: "Rayark Inc.",
    category: "Game Art",
    tags: ["cytus", "rhythm game", "character", "digital art"],
    artist: "Mei Lin",
    vote: null,
  },
  {
    id: "sub-005",
    contestId: "the-librarians",
    title: "Jujutsu Kaisen Character",
    description: "Digital illustration of Satoru Gojo from Jujutsu Kaisen anime",
    imageUrl: "/placeholder.svg?height=400&width=400&text=Jujutsu+Kaisen",
    status: "approved",
    submittedAt: "2023-06-10T11:30:00Z",
    updatedAt: "2023-06-12T14:20:00Z",
    ipOwner: "MAPPA/Shueisha",
    category: "Anime Art",
    tags: ["jujutsu kaisen", "anime", "character", "digital illustration"],
    artist: "Hiroshi Nakamura",
    vote: 9,
  },
  {
    id: "sub-006",
    contestId: "the-librarians",
    title: "Street Fighter - Chun-Li",
    description: "Digital painting of Chun-Li from the Street Fighter game series",
    imageUrl: "/placeholder.svg?height=400&width=400&text=Chun-Li",
    status: "rejected",
    submittedAt: "2023-05-05T10:15:00Z",
    updatedAt: "2023-05-07T09:30:00Z",
    ipOwner: "Capcom",
    category: "Game Art",
    tags: ["street fighter", "chun-li", "game", "character"],
    artist: "Carlos Rodriguez",
    vote: 2,
  },
  {
    id: "sub-007",
    contestId: "the-librarians",
    title: "Deathwing Dragon",
    description: "Digital illustration of Deathwing from World of Warcraft",
    imageUrl: "/placeholder.svg?height=400&width=400&text=Deathwing",
    status: "licensed",
    submittedAt: "2023-04-18T13:40:00Z",
    updatedAt: "2023-04-25T15:20:00Z",
    ipOwner: "Blizzard Entertainment",
    category: "Game Art",
    tags: ["world of warcraft", "dragon", "deathwing", "digital art"],
    artist: "Sarah Johnson",
    vote: 7,
  },
  {
    id: "sub-008",
    contestId: "the-librarians",
    title: "Batman Dark Knight",
    description: "Noir-style illustration of Batman from DC Comics",
    imageUrl: "/placeholder.svg?height=400&width=400&text=Batman",
    status: "pending",
    submittedAt: "2023-07-05T08:20:00Z",
    updatedAt: "2023-07-05T08:20:00Z",
    ipOwner: "DC Comics",
    category: "Comic Art",
    tags: ["batman", "dc comics", "superhero", "noir"],
    artist: "Michael Brown",
    vote: null,
  },
  {
    id: "sub-009",
    contestId: "the-librarians",
    title: "Superman Abstract",
    description: "Abstract interpretation of Superman in flight",
    imageUrl: "/placeholder.svg?height=400&width=400&text=Superman",
    status: "approved",
    submittedAt: "2023-06-20T09:50:00Z",
    updatedAt: "2023-06-22T11:30:00Z",
    ipOwner: "DC Comics",
    category: "Comic Art",
    tags: ["superman", "dc comics", "abstract", "superhero"],
    artist: "Emma Wilson",
    vote: 6,
  },
]

//get judgedata by id

export default async function JudgeDashboard({ params }: JudgeDashboardProps) {
  const { id } = await params

  const [isLoading, setIsLoading] = useState(true)
  const [votes, setVotes] = useState<Record<string, number | null>>({})
  const [submissions, setSubmissions] = useState<typeof fanArtSubmissions>([])
  const judgeData = {
    id: 'wtK0bkFZkbaB',
    email: ''
  }

  useEffect(() => {
      const fetchSubmissions = async () => {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000))
        // Always use the sample data
        setSubmissions(fanArtSubmissions)
        setIsLoading(false)

        const initialVotes = Object.fromEntries(
          fanArtSubmissions.map((s) => [s.id, s.vote ?? null])
        )

        setVotes(initialVotes)
        setIsLoading(false)
      }
  
      fetchSubmissions()
    }, [])

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">
            <Link href={`/brand/manage`} className="w-full">
                <CircleArrowLeft className="inline mr-2 h-8 w-8" />
            </Link>
            Fan Submissions</h1>
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
              </div>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between mt-2 w-full">
                    <h3 className="font-medium line-clamp-1">{submission.title}</h3>
                    <Link href={`/judge/${judgeData.id}/details/${submission.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="mr-1 h-4 w-4" />
                        View Details
                      </Button>
                    </Link>
                  </div>
                  <p className="text-sm line-clamp-2">{submission.description}</p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <div className="flex items-center justify-between text-sm text-muted-foreground w-full">
                      <span>Artist: {submission.artist || "Unknown"}</span>
                      <p className="text-xs text-muted-foreground">
                        {new Date(submission.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-wrap gap-2 justify-center p-4">
                {Array.from({ length: 10 }, (_, i) => {
                  const value = i + 1
                  const isActive = votes[submission.id] === value

                  return (
                    <Button
                      key={value}
                      variant={isActive ? "default" : "outline"}
                      onClick={() => {
                        setVotes((prev) => ({
                          ...prev,
                          [submission.id]: value,
                        }))

                        setSubmissions((prev) =>
                          prev.map((s) =>
                            s.id === submission.id ? { ...s, vote: value } : s
                          )
                        )
                      }}
                      className={`
                        h-9 w-9 rounded-full p-0 transition-all
                        ${isActive 
                          ? "scale-110 shadow-md" 
                          : "hover:scale-105"
                        }
                      `}
                    >
                      {value}
                    </Button>
                  )
                })}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}