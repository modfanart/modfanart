"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorProps) {
  // Log the error when it occurs
  useEffect(() => {
    // Log to console in development
    console.error("Global error caught:", error)

    // In production, you would send this to your error tracking service
    if (process.env.NODE_ENV === "production") {
      // Example of how you might log to an error tracking service
      // This is a placeholder - replace with your actual error reporting
      const errorData = {
        message: error.message,
        stack: error.stack,
        digest: error.digest,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      }

      // Send error to backend logging endpoint
      fetch("/api/log-error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(errorData),
        // Use keepalive to ensure the request completes even if the page is unloaded
        keepalive: true,
      }).catch((e) => console.error("Failed to log error:", e))
    }
  }, [error])

  // Determine if we should show technical details
  const showTechnicalDetails = process.env.NODE_ENV !== "production"

  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
          <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full">
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" aria-hidden="true" />
            </div>

            <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100">Something went wrong</h1>

            <p className="text-center text-gray-600 dark:text-gray-300">
              We've encountered an unexpected error. Our team has been notified and is working to fix the issue.
            </p>

            {showTechnicalDetails && (
              <div className="p-4 mt-4 overflow-auto text-sm bg-gray-100 dark:bg-gray-900 rounded-md max-h-40">
                <p className="font-medium text-red-600 dark:text-red-400">{error.message}</p>
                {error.stack && (
                  <pre className="mt-2 text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{error.stack}</pre>
                )}
              </div>
            )}

            {error.digest && (
              <p className="text-xs text-center text-gray-500 dark:text-gray-400">Error ID: {error.digest}</p>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => reset()} className="flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Try again
              </Button>

              <Button
                variant="outline"
                onClick={() => (window.location.href = "/")}
                className="flex items-center justify-center"
              >
                Return to home page
              </Button>
            </div>

            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              If the problem persists, please contact our support team.
            </p>
          </div>
        </div>
      </body>
    </html>
  )
}

