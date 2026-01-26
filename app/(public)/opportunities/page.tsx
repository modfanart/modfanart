// 'use client'

import Link from "next/link"
import Image from "next/image"
import { CalendarIcon, Clock, Award, Users, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const OPPORTUNITY_ROUTES: Record<string, string> = {
  "the-librarians": "/opportunities/the-librarians",
};



export default function OpportunitiesPage() {
  // Sample data for contests and RFDs
  const contests = [
    {
      id: "the-librarians",
      title: "The Librarians Official Fan art Contest",
      description: "Create original fan art inspired by The Librarians universe — past, present, or future.",
      image: "https://i.postimg.cc/T27x4hk5/New-Images-Artboard-4-(1).png",
      organizer: "2026 Electric Entertainment, Inc",
      deadline: "2026-02-29",
      prize: "$100",
      entries: 15,
      status: "active",
      categories: ["Fan Art"],
      featured: true,
    },/*
    {
      id: "contest-2",
      title: "Marvel Cinematic Universe Art Challenge",
      description: "Design fan art inspired by the latest Marvel movies and TV shows.",
      image: "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?q=80&w=2070&auto=format&fit=crop",
      organizer: "Marvel Entertainment",
      deadline: "2023-07-30",
      prize: "$2,500",
      entries: 342,
      status: "active",
      categories: ["Superhero", "Movies"],
      featured: true,
    },
    {
      id: "contest-3",
      title: "Indie Game Character Reimagined",
      description: "Reimagine characters from popular indie games in your unique style.",
      image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071&auto=format&fit=crop",
      organizer: "Indie Game Alliance",
      deadline: "2023-08-10",
      prize: "$750",
      entries: 89,
      status: "active",
      categories: ["Gaming", "Character Design"],
    },*/
  ]

  const rfds = [/*
    {
      id: "rfd-1",
      title: "Star Wars Celebration Merchandise",
      description: "Looking for unique Star Wars fan art designs for official merchandise.",
      image: "https://images.unsplash.com/photo-1472457897821-70d3819a0e24?q=80&w=2069&auto=format&fit=crop",
      organizer: "Lucasfilm Ltd.",
      deadline: "2023-09-01",
      compensation: "Royalty-based",
      status: "active",
      categories: ["Movies", "Merchandise"],
      featured: true,
    },
    {
      id: "rfd-2",
      title: "Fantasy Novel Cover Art",
      description: "Seeking artists to create cover art for upcoming fantasy novel series.",
      image: "https://images.unsplash.com/photo-1518281361980-b26bfd556770?q=80&w=2070&auto=format&fit=crop",
      organizer: "Penguin Random House",
      deadline: "2023-07-20",
      compensation: "$3,000 per cover",
      status: "active",
      categories: ["Books", "Fantasy"],
    },
    {
      id: "rfd-3",
      title: "Video Game Concept Art",
      description: "Looking for concept artists to create fan art inspired designs for upcoming RPG.",
      image: "https://images.unsplash.com/photo-1580327344181-c1163234e5a0?q=80&w=2067&auto=format&fit=crop",
      organizer: "Epic Games",
      deadline: "2023-08-15",
      compensation: "$5,000 + Credit",
      status: "active",
      categories: ["Gaming", "Concept Art"],
      featured: true,
    },*/
  ]
  const liveOpps = contests.length + rfds.length

  console.log("Live Opportunities:", liveOpps)

  return (
    <div className="container py-10">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Fan Art Opportunities</h1>
        <p className="mt-4 text-xl text-muted-foreground">
          Discover contests and licensing opportunities for your fan art
        </p>
      </div>

      <Tabs defaultValue="all" className="mb-10">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All Opportunities</TabsTrigger>
            <TabsTrigger value="contests">Contests</TabsTrigger>
            <TabsTrigger value="rfds">Licensing RFDs</TabsTrigger>
          </TabsList>
          <Link href="/dashboard/opportunities/create">
            <Button>
              Create Opportunity
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <TabsContent value="all" className="mt-6">
          <div className="mb-8">
            <h2 className="mb-4 text-2xl font-bold">Featured Opportunities</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...contests]
                .filter((item) => item.featured)
                .map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="relative h-48 w-full">
                      <Image src={item.image || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
                      <div className="absolute right-2 top-2">
                        <Badge variant="secondary" className="bg-black/70 text-white hover:bg-black/70">
                          {item.id.startsWith("contest") ? "Contest" : "Licensing RFD"}
                        </Badge>
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle className="line-clamp-1">{item.title}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <span>By {item.organizer}</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {item.categories.map((category) => (
                          <Badge key={category} variant="outline">
                            {category}
                          </Badge>
                        ))}
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          <span>Due {new Date(item.deadline).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {item.id.startsWith("contest") ? (
                            <>
                              <Award className="h-4 w-4 text-muted-foreground" />
                              <span>Prize: {(item as any).prize}</span>
                            </>
                          ) : (
                            <>
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{(item as any).compensation}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Link href={`/opportunities/${item.id}`} className="w-full">
                        <Button className="w-full">View Details</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          </div>

          {(liveOpps > 1 ?
          <div>
            <h2 className="mb-4 text-2xl font-bold">All Opportunities</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...contests]
                .filter((item) => !item.featured)
                .map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="relative h-48 w-full">
                      <Image src={item.image || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
                      <div className="absolute right-2 top-2">
                        <Badge variant="secondary" className="bg-black/70 text-white hover:bg-black/70">
                          {item.id.startsWith("contest") ? "Contest" : "Licensing RFD"}
                        </Badge>
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle className="line-clamp-1">{item.title}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <span>By {item.organizer}</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {item.categories.map((category) => (
                          <Badge key={category} variant="outline">
                            {category}
                          </Badge>
                        ))}
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          <span>Due {new Date(item.deadline).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {item.id.startsWith("contest") ? (
                            <>
                              <Award className="h-4 w-4 text-muted-foreground" />
                              <span>Prize: {(item as any).prize}</span>
                            </>
                          ) : (
                            <>
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{(item as any).compensation}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Link href={`/opportunities/${item.id}`} className="w-full">
                        <Button className="w-full">View Details</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
            </div>
            
          </div>
          : null )}
        </TabsContent>

        <TabsContent value="contests" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {contests.map((contest) => (
              <Card key={contest.id} className="overflow-hidden">
                <div className="relative h-48 w-full">
                  <Image src={contest.image || "/placeholder.svg"} alt={contest.title} fill className="object-cover" />
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-1">{contest.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <span>By {contest.organizer}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{contest.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {contest.categories.map((category) => (
                      <Badge key={category} variant="outline">
                        {category}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <span>Due {new Date(contest.deadline).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <span>Prize: {contest.prize}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{contest.entries} Entries</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href={OPPORTUNITY_ROUTES[contest.id] ?? "/opportunities"} className="w-full">
                    <Button className="w-full">View Details</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rfds" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/*{rfds.map((rfd) => (
              <Card key={rfd.id} className="overflow-hidden">
                <div className="relative h-48 w-full">
                  <Image src={rfd.image || "/placeholder.svg"} alt={rfd.title} fill className="object-cover" />
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-1">{rfd.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <span>By {rfd.organizer}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{rfd.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {rfd.categories.map((category) => (
                      <Badge key={category} variant="outline">
                        {category}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <span>Due {new Date(rfd.deadline).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{rfd.compensation}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href={`/opportunities/${rfd.id}`} className="w-full">
                    <Button className="w-full">View Details</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}*/}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

