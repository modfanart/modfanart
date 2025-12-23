import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function DebugPage() {
  // Redirect to home in production
  if (process.env.NODE_ENV !== "development" && !process.env.NEXT_PUBLIC_DEBUG) {
    redirect("/")
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Debug Tools</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/debug/auth">
          <Card className="h-full hover:bg-muted/50 transition-colors">
            <CardHeader>
              <CardTitle>Auth Debug</CardTitle>
              <CardDescription>Test authentication flows</CardDescription>
            </CardHeader>
            <CardContent>
              <p>View session data and test sign in/out</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/debug/ai">
          <Card className="h-full hover:bg-muted/50 transition-colors">
            <CardHeader>
              <CardTitle>AI Services</CardTitle>
              <CardDescription>Test AI integrations</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Test AIORNOT and OpenAI integrations</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/debug/forms">
          <Card className="h-full hover:bg-muted/50 transition-colors">
            <CardHeader>
              <CardTitle>Form Tests</CardTitle>
              <CardDescription>Test form components</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Test form validation and submission</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/debug/stripe">
          <Card className="h-full hover:bg-muted/50 transition-colors">
            <CardHeader>
              <CardTitle>Stripe Tests</CardTitle>
              <CardDescription>Test payment flows</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Test Stripe checkout and subscription management</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}

