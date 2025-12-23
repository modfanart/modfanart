import { Suspense } from "react"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

import { ManageOpportunityContent } from "@/components/opportunities/manage-opportunity-content"
import { DashboardShell } from "@/components/dashboard-shell"
import { OpportunityPageSkeleton } from "@/components/opportunities/opportunity-page-skeleton"

export const metadata: Metadata = {
  title: "Manage Opportunity | MOD Platform",
  description: "Manage opportunity details and submissions",
}

export default async function ManageOpportunityPage({
  params,
}: {
  params: { id: string }
}) {
  if (!params.id) {
    notFound()
  }

  return (
    <DashboardShell>
      <Suspense fallback={<OpportunityPageSkeleton />}>
        <ManageOpportunityContent opportunityId={params.id} />
      </Suspense>
    </DashboardShell>
  )
}

