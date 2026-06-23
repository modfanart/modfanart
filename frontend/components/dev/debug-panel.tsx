"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { usePathname } from "next/navigation"

export function DebugPanel() {
  // Only render in development mode
  if (process.env.NODE_ENV !== "development") {
    return null
  }

  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentPath, setCurrentPath] = useState<string>("")

  useEffect(() => {
    // Update the path when it changes
    const path = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "")
    setCurrentPath(path)
    console.log("Path changed:", path)
  }, [pathname, searchParams])

  useEffect(() => {
    // Check if auth cookie exists
    const hasAuthCookie = document.cookie.includes("authToken=")
    setIsAuthenticated(hasAuthCookie)
  }, [])

  const login = () => {
    // Set auth cookie for 1 day
    document.cookie = "authToken=test-token; path=/; max-age=86400"
    setIsAuthenticated(true)
    router.refresh()
  }

  const logout = () => {
    // Remove auth cookie
    document.cookie = "authToken=; path=/; max-age=0"
    setIsAuthenticated(false)
    router.refresh()
  }

  if (!isOpen) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-w-xs">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">Debug Panel</h3>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setIsOpen(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-1">Current Route</h4>
          <div className="text-sm font-mono bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-x-auto">
            {currentPath || "/"}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-1">Auth Status</h4>
          <div className="text-sm">
            Status:{" "}
            <span className={isAuthenticated ? "text-green-500" : "text-red-500"}>
              {isAuthenticated ? "Authenticated" : "Not Authenticated"}
            </span>
          </div>
          <div className="flex space-x-2 mt-2">
            <Button size="sm" onClick={login} disabled={isAuthenticated}>
              Login
            </Button>
            <Button size="sm" variant="outline" onClick={logout} disabled={!isAuthenticated}>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DebugPanel

