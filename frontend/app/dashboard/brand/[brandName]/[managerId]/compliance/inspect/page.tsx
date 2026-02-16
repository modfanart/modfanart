import { Suspense } from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AI Moderation Inspector",
  description: "Inspect and debug AIORNOT and OpenAI moderation results",
}

import ModerationInspector from "@/components/compliance/moderation-inspector"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function InspectPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Moderation Inspector</h1>
          <p className="text-muted-foreground">Debug and inspect AIORNOT and OpenAI moderation results</p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Moderation Analysis Results</CardTitle>
            <CardDescription>Test moderation with sample content or inspect past submission results</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="w-full h-[600px]" />}>
              <ModerationInspector />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

