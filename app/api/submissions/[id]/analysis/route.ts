import { NextResponse } from "next/server"
import { getSubmissionById } from "@/lib/db/models/submission"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const submissionId = params.id

    if (!submissionId) {
      return NextResponse.json({ error: "Submission ID is required" }, { status: 400 })
    }

    const submission = await getSubmissionById(submissionId)

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 })
    }

    // Return the submission with its analysis data
    return NextResponse.json({
      submission,
      analysis: submission.analysis,
    })
  } catch (error) {
    console.error("Error retrieving submission analysis:", error)
    return NextResponse.json(
      {
        error: "Failed to retrieve submission analysis",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

