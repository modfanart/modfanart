import { redirect } from "next/navigation"
import { AuthDebug } from "@/components/auth-debug"

export default function AuthDebugPage() {
  // Redirect to home in production
  if (process.env.NODE_ENV !== "development" && !process.env.NEXT_PUBLIC_DEBUG) {
    redirect("/")
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Authentication Debug</h1>
      <div className="max-w-2xl">
        <AuthDebug />
      </div>
    </div>
  )
}

