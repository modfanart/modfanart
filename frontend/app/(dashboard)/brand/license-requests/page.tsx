"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, XCircle, Clock, MessageCircle, FileText, ExternalLink, Search, Shield, Info } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"

export default function LicenseRequestsPage() {
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Sample data for license requests
  const licenseRequests = [
    {
      id: "req-001",
      artworkId: "art-001",
      artworkTitle: "Squid Game Player 456",
      artworkImage:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/squid-game-456-ORXbXQQXXnHPuxVKnJVlvwQhh1RvTt.jpg",
      requester: {
        name: "Netflix Productions",
        avatar: "/placeholder.svg?height=40&width=40",
        company: "Netflix Inc.",
        verified: true,
      },
      licenseType: "Commercial",
      usage: "Marketing materials for Squid Game Season 2",
      duration: "1 year",
      payment: "$1,200",
      status: "pending",
      requestDate: "2023-11-15",
      aiVerification: {
        status: "verified",
        score: 0.98,
        humanVerified: true,
      },
      ipCompliance: {
        status: "compliant",
        score: 0.95,
        notes: "Artwork is based on official Squid Game IP with appropriate transformative elements",
      },
      additionalNotes: "Request includes usage in digital and print marketing materials for the upcoming season",
    },
    {
      id: "req-002",
      artworkId: "art-002",
      artworkTitle: "Ahsoka Tano Portrait",
      artworkImage:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ahsoka-tano-star-wars-Ue0ySJJXXnHPuxVKnJVlvwQhh1RvTt.jpg",
      requester: {
        name: "Disney Publishing",
        avatar: "/placeholder.svg?height=40&width=40",
        company: "Disney",
        verified: true,
      },
      licenseType: "Commercial",
      usage: "Star Wars novel cover artwork",
      duration: "2 years",
      payment: "$2,500",
      status: "approved",
      requestDate: "2023-11-10",
      approvedDate: "2023-11-12",
      aiVerification: {
        status: "verified",
        score: 0.99,
        humanVerified: true,
      },
      ipCompliance: {
        status: "compliant",
        score: 0.97,
        notes: "Artwork adheres to Star Wars style guide and official character representation",
      },
      additionalNotes: "Approved for use in both digital and print editions of the novel",
    },
    {
      id: "req-003",
      artworkId: "art-003",
      artworkTitle: "Samurai Watercolor",
      artworkImage:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/samurai-watercolor-ORXbXQQXXnHPuxVKnJVlvwQhh1RvTt.jpg",
      requester: {
        name: "Indie Game Studio",
        avatar: "/placeholder.svg?height=40&width=40",
        company: "Samurai Games LLC",
        verified: false,
      },
      licenseType: "Personal",
      usage: "Reference material for character design",
      duration: "6 months",
      payment: "$350",
      status: "rejected",
      requestDate: "2023-11-05",
      rejectedDate: "2023-11-07",
      rejectionReason: "Usage terms too vague",
      aiVerification: {
        status: "verified",
        score: 0.92,
        humanVerified: true,
      },
      ipCompliance: {
        status: "uncertain",
        score: 0.65,
        notes: "Artwork contains elements that may be derived from protected samurai-themed IPs",
      },
      additionalNotes: "Rejected due to vague usage terms and potential IP conflicts",
    },
    {
      id: "req-004",
      artworkId: "art-004",
      artworkTitle: "Cytus II Cherry",
      artworkImage:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/cytus-ii-cherry-ORXbXQQXXnHPuxVKnJVlvwQhh1RvTt.jpg",
      requester: {
        name: "Rayark Games",
        avatar: "/placeholder.svg?height=40&width=40",
        company: "Rayark Inc.",
        verified: true,
      },
      licenseType: "Commercial",
      usage: "Promotional materials for Cytus II update",
      duration: "1 year",
      payment: "$800",
      status: "pending",
      requestDate: "2023-11-14",
      aiVerification: {
        status: "verified",
        score: 0.96,
        humanVerified: true,
      },
      ipCompliance: {
        status: "compliant",
        score: 0.9,
        notes: "Artwork is consistent with Cytus II visual style and character design",
      },
      additionalNotes: "Request includes usage in social media and in-game promotional banners",
    },
    {
      id: "req-005",
      artworkId: "art-005",
      artworkTitle: "Jujutsu Kaisen Character",
      artworkImage:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/jujutsu-kaisen-ORXbXQQXXnHPuxVKnJVlvwQhh1RvTt.jpg",
      requester: {
        name: "Crunchyroll",
        avatar: "/placeholder.svg?height=40&width=40",
        company: "Crunchyroll LLC",
        verified: true,
      },
      licenseType: "Commercial",
      usage: "Fan merchandise (t-shirts, posters)",
      duration: "2 years",
      payment: "$1,800",
      status: "approved",
      requestDate: "2023-11-08",
      approvedDate: "2023-11-11",
      aiVerification: {
        status: "verified",
        score: 0.97,
        humanVerified: true,
      },
      ipCompliance: {
        status: "compliant",
        score: 0.93,
        notes: "Artwork follows Jujutsu Kaisen style guide and official character representation",
      },
      additionalNotes: "Approved for merchandise production with royalty reporting requirements",
    },
    {
      id: "req-006",
      artworkId: "art-006",
      artworkTitle: "Street Fighter Chun-Li",
      artworkImage:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/street-fighter-chun-li-ORXbXQQXXnHPuxVKnJVlvwQhh1RvTt.jpg",
      requester: {
        name: "Capcom Events",
        avatar: "/placeholder.svg?height=40&width=40",
        company: "Capcom Co., Ltd.",
        verified: true,
      },
      licenseType: "Commercial",
      usage: "Tournament promotional materials",
      duration: "3 months",
      payment: "$650",
      status: "pending",
      requestDate: "2023-11-16",
      aiVerification: {
        status: "verified",
        score: 0.95,
        humanVerified: true,
      },
      ipCompliance: {
        status: "compliant",
        score: 0.91,
        notes: "Artwork adheres to Street Fighter character guidelines and official representation",
      },
      additionalNotes: "Request is for limited-time usage during the upcoming tournament season",
    },
  ]

  // Filter requests by status
  const pendingRequests = licenseRequests.filter((req) => req.status === "pending")
  const approvedRequests = licenseRequests.filter((req) => req.status === "approved")
  const rejectedRequests = licenseRequests.filter((req) => req.status === "rejected")

  // Handle opening the dialog with the selected request
  const handleOpenDetails = (request: any) => {
    setSelectedRequest(request)
    setIsDialogOpen(true)
  }

  // Render status badge with appropriate color and icon
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1 px-2 py-1"
          >
            <Clock className="h-3 w-3" /> Pending
          </Badge>
        )
      case "approved":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1 px-2 py-1"
          >
            <CheckCircle className="h-3 w-3" /> Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1 px-2 py-1">
            <XCircle className="h-3 w-3" /> Rejected
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="px-2 py-1">
            {status}
          </Badge>
        )
    }
  }

  // Render AI verification badge
  const renderAIVerificationBadge = (verification: any) => {
    if (verification.status === "verified") {
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1 px-2 py-1"
        >
          <Shield className="h-3 w-3" /> Human Verified
        </Badge>
      )
    } else {
      return (
        <Badge
          variant="outline"
          className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1 px-2 py-1"
        >
          <Shield className="h-3 w-3" /> AI Detected
        </Badge>
      )
    }
  }

  // Render IP compliance badge
  const renderIPComplianceBadge = (compliance: any) => {
    switch (compliance.status) {
      case "compliant":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1 px-2 py-1"
          >
            <CheckCircle className="h-3 w-3" /> IP Compliant
          </Badge>
        )
      case "uncertain":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1 px-2 py-1"
          >
            <Info className="h-3 w-3" /> IP Review Needed
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1 px-2 py-1">
            <XCircle className="h-3 w-3" /> IP Issues
          </Badge>
        )
    }
  }

  // Render request card
  const renderRequestCard = (request: any) => (
    <Card
      key={request.id}
      className="overflow-hidden h-full flex flex-col cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => handleOpenDetails(request)}
    >
      <CardHeader className="pb-3 space-y-2">
        <div className="flex justify-between items-start gap-2">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border">
              <AvatarImage src={request.requester.avatar} alt={request.requester.name} />
              <AvatarFallback>{request.requester.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <CardTitle className="text-sm font-medium">{request.requester.name}</CardTitle>
                {request.requester.verified && (
                  <Badge variant="outline" className="h-5 bg-blue-50 text-blue-700 border-blue-200 text-[10px] px-1.5">
                    Verified
                  </Badge>
                )}
              </div>
              <CardDescription className="text-xs mt-0.5">{request.requester.company}</CardDescription>
            </div>
          </div>
          {renderStatusBadge(request.status)}
        </div>
      </CardHeader>
      <CardContent className="pb-4 flex-grow">
        <div className="flex gap-4">
          <div className="relative h-24 w-24 rounded-md overflow-hidden flex-shrink-0 border">
            <Image
              src={request.artworkImage || "/placeholder.svg"}
              alt={request.artworkTitle}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-sm mb-2">{request.artworkTitle}</h4>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
              <div className="text-xs text-muted-foreground">License Type:</div>
              <div className="text-xs font-medium">{request.licenseType}</div>
              <div className="text-xs text-muted-foreground">Usage:</div>
              <div className="text-xs font-medium">{request.usage}</div>
              <div className="text-xs text-muted-foreground">Duration:</div>
              <div className="text-xs font-medium">{request.duration}</div>
              <div className="text-xs text-muted-foreground">Payment:</div>
              <div className="text-xs font-medium text-green-600">{request.payment}</div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-3 border-t">
        {request.status === "pending" ? (
          <div className="flex gap-3 w-full">
            <Button variant="outline" size="sm" className="flex-1" onClick={(e) => e.stopPropagation()}>
              <XCircle className="h-4 w-4 mr-1.5" /> Reject
            </Button>
            <Button size="sm" className="flex-1" onClick={(e) => e.stopPropagation()}>
              <CheckCircle className="h-4 w-4 mr-1.5" /> Approve
            </Button>
          </div>
        ) : request.status === "approved" ? (
          <div className="flex gap-3 w-full">
            <Button variant="outline" size="sm" className="flex-1" onClick={(e) => e.stopPropagation()}>
              <FileText className="h-4 w-4 mr-1.5" /> View License
            </Button>
            <Button size="sm" className="flex-1" onClick={(e) => e.stopPropagation()}>
              <MessageCircle className="h-4 w-4 mr-1.5" /> Message
            </Button>
          </div>
        ) : (
          <div className="flex gap-3 w-full">
            <Button variant="outline" size="sm" className="flex-1" onClick={(e) => e.stopPropagation()}>
              <MessageCircle className="h-4 w-4 mr-1.5" /> Message
            </Button>
            <Button variant="outline" size="sm" className="flex-1" onClick={(e) => e.stopPropagation()}>
              <ExternalLink className="h-4 w-4 mr-1.5" /> View Details
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  )

  // Render detailed request dialog
  const renderRequestDialog = () => {
    if (!selectedRequest) return null

    return (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader className="mb-2">
            <div className="flex items-center justify-between mb-2">
              <DialogTitle className="text-xl font-bold">License Request Details</DialogTitle>
              {renderStatusBadge(selectedRequest.status)}
            </div>
            <DialogDescription className="text-base">
              Request #{selectedRequest.id} for "{selectedRequest.artworkTitle}"
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
            {/* Artwork Preview */}
            <div className="space-y-4">
              <div className="relative aspect-square w-full rounded-lg overflow-hidden border shadow-sm">
                <Image
                  src={selectedRequest.artworkImage || "/placeholder.svg"}
                  alt={selectedRequest.artworkTitle}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="px-1">
                <h3 className="font-medium text-lg mb-1">{selectedRequest.artworkTitle}</h3>
                <p className="text-sm text-muted-foreground">Artwork ID: {selectedRequest.artworkId}</p>
              </div>
            </div>

            {/* Request Details */}
            <div className="space-y-6">
              {/* Requester Information */}
              <div className="space-y-3">
                <h3 className="font-medium text-xs uppercase tracking-wider text-muted-foreground mb-3">Requester</h3>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border">
                    <AvatarImage src={selectedRequest.requester.avatar} alt={selectedRequest.requester.name} />
                    <AvatarFallback>{selectedRequest.requester.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{selectedRequest.requester.name}</p>
                      {selectedRequest.requester.verified && (
                        <Badge
                          variant="outline"
                          className="h-5 bg-blue-50 text-blue-700 border-blue-200 text-[10px] px-1.5"
                        >
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{selectedRequest.requester.company}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* License Details */}
              <div className="space-y-3">
                <h3 className="font-medium text-xs uppercase tracking-wider text-muted-foreground mb-3">
                  License Details
                </h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">License Type</p>
                    <p className="font-medium">{selectedRequest.licenseType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Payment</p>
                    <p className="font-medium text-green-600">{selectedRequest.payment}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Duration</p>
                    <p className="font-medium">{selectedRequest.duration}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Request Date</p>
                    <p className="font-medium">{selectedRequest.requestDate}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground mb-1">Usage</p>
                    <p className="font-medium">{selectedRequest.usage}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Verification & Compliance */}
              <div className="space-y-3">
                <h3 className="font-medium text-xs uppercase tracking-wider text-muted-foreground mb-3">
                  Verification & Compliance
                </h3>
                <div className="flex flex-wrap gap-2">
                  {renderAIVerificationBadge(selectedRequest.aiVerification)}
                  {renderIPComplianceBadge(selectedRequest.ipCompliance)}
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-sm mt-4">
                  <p className="font-medium mb-2">IP Compliance Notes:</p>
                  <p className="text-muted-foreground">{selectedRequest.ipCompliance.notes}</p>
                </div>
                {selectedRequest.additionalNotes && (
                  <div className="bg-gray-50 p-4 rounded-lg text-sm mt-4">
                    <p className="font-medium mb-2">Additional Notes:</p>
                    <p className="text-muted-foreground">{selectedRequest.additionalNotes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-3 sm:justify-between pt-6 mt-2">
            <div className="flex gap-3">
              <Button variant="outline" size="sm" className="h-9" onClick={() => setIsDialogOpen(false)}>
                Close
              </Button>
              <Button variant="outline" size="sm" className="h-9">
                <MessageCircle className="h-4 w-4 mr-1.5" /> Message Requester
              </Button>
            </div>

            {selectedRequest.status === "pending" ? (
              <div className="flex gap-3">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9">
                      <XCircle className="h-4 w-4 mr-1.5" /> Reject Request
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reject License Request</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to reject this license request from {selectedRequest.requester.name}? This
                        action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction className="bg-red-600 hover:bg-red-700">Reject Request</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" className="h-9">
                      <CheckCircle className="h-4 w-4 mr-1.5" /> Approve Request
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Approve License Request</AlertDialogTitle>
                      <AlertDialogDescription>
                        You are about to approve a license request from {selectedRequest.requester.name} for{" "}
                        {selectedRequest.payment}. The license will be valid for {selectedRequest.duration} for{" "}
                        {selectedRequest.usage}.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction>Approve Request</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ) : selectedRequest.status === "approved" ? (
              <Button size="sm" className="h-9">
                <FileText className="h-4 w-4 mr-1.5" /> View License Agreement
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm">Rejected: {selectedRequest.rejectionReason}</span>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">License Requests</h1>
          <p className="text-muted-foreground mt-1">Manage requests to license your artwork</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-grow sm:flex-grow-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search requests..." className="pl-9 w-full sm:w-[250px]" />
          </div>
          <Select defaultValue="newest">
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="highest">Highest Payment</SelectItem>
              <SelectItem value="lowest">Lowest Payment</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6 bg-background border-b rounded-none p-0 h-auto w-full justify-start">
          <TabsTrigger
            value="all"
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary py-3 px-4"
          >
            All Requests <Badge className="ml-2 bg-gray-100 text-gray-900">{licenseRequests.length}</Badge>
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary py-3 px-4"
          >
            Pending <Badge className="ml-2 bg-yellow-100 text-yellow-900">{pendingRequests.length}</Badge>
          </TabsTrigger>
          <TabsTrigger
            value="approved"
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary py-3 px-4"
          >
            Approved <Badge className="ml-2 bg-green-100 text-green-900">{approvedRequests.length}</Badge>
          </TabsTrigger>
          <TabsTrigger
            value="rejected"
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary py-3 px-4"
          >
            Rejected <Badge className="ml-2 bg-red-100 text-red-900">{rejectedRequests.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {licenseRequests.map(renderRequestCard)}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="mt-0">
          {pendingRequests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingRequests.map(renderRequestCard)}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-gray-50 rounded-lg">
              <Clock className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Pending Requests</h3>
              <p className="text-muted-foreground max-w-md mt-2">
                You don't have any pending license requests at the moment. When someone requests to license your
                artwork, it will appear here.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="mt-0">
          {approvedRequests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {approvedRequests.map(renderRequestCard)}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-gray-50 rounded-lg">
              <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Approved Requests</h3>
              <p className="text-muted-foreground max-w-md mt-2">
                You haven't approved any license requests yet. When you approve a request, it will appear here.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="mt-0">
          {rejectedRequests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rejectedRequests.map(renderRequestCard)}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-gray-50 rounded-lg">
              <XCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Rejected Requests</h3>
              <p className="text-muted-foreground max-w-md mt-2">
                You haven't rejected any license requests yet. When you reject a request, it will appear here.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Render the detailed request dialog */}
      {renderRequestDialog()}
    </div>
  )
}

