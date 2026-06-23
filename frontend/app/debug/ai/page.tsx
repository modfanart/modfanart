import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AITestForm } from "@/components/ai-test-form"

export default function AIDebugPage() {
  // Redirect to home in production
  if (process.env.NODE_ENV !== "development" && !process.env.NEXT_PUBLIC_DEBUG) {
    redirect("/")
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">AI Services Debug</h1>
      <div className="max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Test AI Analysis</CardTitle>
            <CardDescription>Test the AI analysis services with sample data</CardDescription>
          </CardHeader>
          <CardContent>
            <AITestForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

