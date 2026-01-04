import type { Metadata } from "next"
import { DashboardShell } from "@/components/dashboard-shell"
import { ProfileForm } from "@/components/profile/profile-form"
import { getUserProfile } from "@/lib/auth"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Profile | MOD Platform",
  description: "Manage your profile information and settings",
}

export default async function ProfilePage() {
  // Get the current user profile
  const user = await getUserProfile()

  // If no user is found, redirect to login
  if (!user) {
    redirect("/login")
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Profile</h3>
          <p className="text-sm text-muted-foreground">
            Manage your profile information and how others see you on the platform.
          </p>
        </div>
        <div className="divide-y divide-border rounded-md border">
          <ProfileForm user={user} />
        </div>
      </div>
    </DashboardShell>
  )
}

