import type { Metadata } from "next"
import SubmissionDetailPageContent from "./submission-detail-page"
import { notFound, redirect } from "next/navigation"

interface SubmissionPageProps {
  params: {
    id: string
  }
}

export const metadata: Metadata = {
  title: "Submission Details",
  description: "View and manage your fan art submission details",
}

export default function SubmissionPage({ params }: SubmissionPageProps) {
  // If the ID is "new", redirect to the new submission page
  if (params.id === "new") {
    redirect("/submissions/new")
    return null
  }

  // Validate the ID parameter
  if (!params?.id) {
    return notFound()
  }

  return <SubmissionDetailPageContent id={params.id} />
}

