"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

export default function NewSubmissionError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(
      "New submission error:",
      error.message || "Unknown error",
      error.digest ? `Digest: ${error.digest}` : "",
    )
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
        <AlertCircle className="h-6 w-6 text-red-600" />
      </div>
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <p className="text-muted-foreground mb-2 text-center max-w-md">
        There was an error loading the submission form. This has been logged for investigation.
      </p>
      {error.digest && <p className="text-xs text-muted-foreground mb-6">Error ID: {error.digest}</p>}
      <div className="flex gap-4">
        <Button onClick={reset} className="mt-2">
          Try again
        </Button>
        <Link href="/dashboard">
          <Button variant="outline" className="mt-2">
            Go to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  )
}

