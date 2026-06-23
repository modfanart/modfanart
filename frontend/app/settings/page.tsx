import type { Metadata } from "next"
import { DashboardShell } from "@/components/dashboard-shell"
import { SettingsForm } from "@/components/settings/settings-form"

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your account settings and preferences.",
}

export default function SettingsPage() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Settings</h3>
          <p className="text-sm text-muted-foreground">Manage your account settings and preferences.</p>
        </div>
        <div className="divide-y divide-border rounded-md border">
          <SettingsForm />
        </div>
      </div>
    </DashboardShell>
  )
}

