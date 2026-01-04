import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Video, Users, BookOpen, Download, ExternalLink } from "lucide-react"

export const metadata = {
  title: "Resources | MOD Platform",
  description: "Resources and guides for the MOD Platform",
}

export default function ResourcesPage() {
  return (
    <div className="container py-12 md:py-16 lg:py-24">
      <div className="mx-auto max-w-4xl text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">Resources</h1>
        <p className="text-xl text-muted-foreground">Helpful guides and resources for artists, brands, and creators</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-primary" />
              Brand Guidelines
            </CardTitle>
            <CardDescription>Guidelines for creating fan art that complies with IP requirements</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Learn how to create fan art that respects intellectual property rights and has the best chance of being
              approved.
            </p>
            <Button className="w-full" asChild>
              <Link href="/resources/guidelines">View Guidelines</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Video className="h-5 w-5 mr-2 text-primary" />
              Video Tutorials
            </CardTitle>
            <CardDescription>Step-by-step video guides for using the MOD Platform</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Watch tutorials on submitting fan art, understanding licensing options, and maximizing your success.
            </p>
            <Button className="w-full" variant="outline" asChild>
              <Link href="/resources/tutorials">Watch Tutorials</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-primary" />
              Community Forum
            </CardTitle>
            <CardDescription>Connect with other artists, brands, and creators</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Join discussions, share tips, and get feedback from the MOD Platform community.
            </p>
            <Button className="w-full" variant="outline" asChild>
              <Link href="/community">Visit Forum</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-primary" />
              Documentation
            </CardTitle>
            <CardDescription>Detailed documentation for all platform features</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Comprehensive guides to every feature and process on the MOD Platform.
            </p>
            <Button className="w-full" variant="outline" asChild>
              <Link href="/resources/docs">Read Docs</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Download className="h-5 w-5 mr-2 text-primary" />
              Downloadable Resources
            </CardTitle>
            <CardDescription>Templates, checklists, and guides to download</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Download helpful resources including submission templates, legal guides, and more.
            </p>
            <Button className="w-full" variant="outline" asChild>
              <Link href="/resources/downloads">View Downloads</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ExternalLink className="h-5 w-5 mr-2 text-primary" />
              External Resources
            </CardTitle>
            <CardDescription>Helpful links to external IP guidelines and resources</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Links to official IP holder guidelines, legal resources, and other helpful external content.
            </p>
            <Button className="w-full" variant="outline" asChild>
              <Link href="/resources/external">View Links</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

