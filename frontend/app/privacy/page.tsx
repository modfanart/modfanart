import type { Metadata } from "next"
import Link from "next/link"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Privacy Policy | MOD Platform",
  description: "Privacy Policy for the MOD Platform fan art licensing service",
}

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="container flex-1 py-10">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
              <p className="text-muted-foreground">Last updated: March 6, 2025</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>1. Introduction</CardTitle>
              <CardDescription>Your privacy is important to us</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                At MOD Platform, we respect your privacy and are committed to protecting your personal data. This
                Privacy Policy explains how we collect, use, and safeguard your information when you use our platform.
              </p>
              <p>By using the MOD Platform, you consent to the data practices described in this policy.</p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>2. Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-medium">2.1 Personal Information</h3>
              <p>We collect information that you provide directly to us, including:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Account information (name, email, password)</li>
                <li>Profile information (username, bio, profile picture)</li>
                <li>Payment information (processed securely through our payment processor)</li>
                <li>Content you upload (artwork, descriptions, tags)</li>
                <li>Communications with us</li>
              </ul>

              <h3 className="text-lg font-medium">2.2 Automatically Collected Information</h3>
              <p>When you use our platform, we automatically collect certain information, including:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Device information (browser type, operating system)</li>
                <li>Usage data (pages visited, time spent)</li>
                <li>IP address and location data</li>
                <li>Cookies and similar technologies</li>
              </ul>

              <h3 className="text-lg font-medium">2.3 AI Analysis Data</h3>
              <p>
                When you submit artwork, we use AI tools to analyze your submissions for compliance and authenticity.
                This analysis may include:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>AI detection analysis</li>
                <li>Content safety screening</li>
                <li>IP compliance evaluation</li>
                <li>Brand guideline adherence assessment</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>3. How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>We use your information for the following purposes:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and manage your account</li>
                <li>Facilitate the licensing of your fan art</li>
                <li>Screen submissions for compliance with our policies</li>
                <li>Communicate with you about your account and our services</li>
                <li>Respond to your requests and inquiries</li>
                <li>Send you marketing communications (with your consent)</li>
                <li>Analyze usage patterns to improve our platform</li>
                <li>Protect against fraudulent or illegal activity</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>4. Data Sharing and Disclosure</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>We may share your information with:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>IP holders and brands (for licensing purposes)</li>
                <li>Service providers (payment processors, hosting providers)</li>
                <li>AI analysis partners (for content screening)</li>
                <li>Legal authorities (when required by law)</li>
              </ul>
              <p>We do not sell your personal information to third parties.</p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>5. Your Rights and Choices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Depending on your location, you may have certain rights regarding your personal information, including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access to your personal data</li>
                <li>Correction of inaccurate data</li>
                <li>Deletion of your data</li>
                <li>Restriction of processing</li>
                <li>Data portability</li>
                <li>Objection to processing</li>
              </ul>
              <p>To exercise these rights, please contact us using the information provided in the Contact section.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Security</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                We implement appropriate technical and organizational measures to protect your personal information.
                However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot
                guarantee absolute security.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      <SiteFooter />
    </div>
  )
}

