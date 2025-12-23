import type { Metadata } from "next"
import Link from "next/link"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Terms of Service | MOD Platform",
  description: "Terms of Service for the MOD Platform fan art licensing service",
}

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="container flex-1 py-10">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
              <p className="text-muted-foreground">Last updated: March 6, 2025</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>1. Introduction</CardTitle>
              <CardDescription>Welcome to the MOD Platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                These Terms of Service ("Terms") govern your access to and use of the MOD Platform, including any
                content, functionality, and services offered on or through our website (the "Service").
              </p>
              <p>
                By registering with us or by using our Service, you agree to be bound by these Terms. If you disagree
                with any part of the terms, you may not access the Service.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>2. Licensing & Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-medium">2.1 Fan Art Submissions</h3>
              <p>
                When you submit fan art to the MOD Platform, you retain ownership of your original creative elements.
                However, you grant MOD Platform a non-exclusive license to display, promote, and facilitate licensing of
                your submitted artwork.
              </p>

              <h3 className="text-lg font-medium">2.2 Original IP Rights</h3>
              <p>
                The MOD Platform does not grant you any rights to the original intellectual property (IP) that your fan
                art is based on. All rights to original IP remain with their respective owners.
              </p>

              <h3 className="text-lg font-medium">2.3 Licensing to Third Parties</h3>
              <p>
                When your fan art is approved and licensed through our platform, you agree to the specific licensing
                terms for each transaction, which may include revenue sharing, usage limitations, and attribution
                requirements.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>3. User Responsibilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-medium">3.1 Accurate Information</h3>
              <p>
                You are responsible for providing accurate information about your submissions, including the original IP
                they're based on and your original creative contributions.
              </p>

              <h3 className="text-lg font-medium">3.2 Prohibited Content</h3>
              <p>
                You agree not to submit content that is illegal, infringing, harmful, abusive, harassing, defamatory,
                vulgar, obscene, invasive of privacy, or otherwise objectionable.
              </p>

              <h3 className="text-lg font-medium">3.3 AI-Generated Content</h3>
              <p>
                You must disclose if your submission contains or was created with the assistance of AI tools.
                Misrepresenting AI-generated content as fully human-created is prohibited.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>4. Subscription Plans & Payments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The MOD Platform offers various subscription tiers with different features and revenue sharing models.
                Payment terms, refund policies, and subscription management are governed by our payment processor's
                terms of service.
              </p>
              <p>
                Revenue sharing payments will be processed according to the schedule outlined in your specific tier
                agreement.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>5. Termination</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                We may terminate or suspend your account and access to the Service immediately, without prior notice or
                liability, for any reason, including without limitation if you breach the Terms.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                We reserve the right to modify or replace these Terms at any time. If a revision is material, we will
                provide at least 30 days' notice prior to any new terms taking effect.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      <SiteFooter />
    </div>
  )
}

