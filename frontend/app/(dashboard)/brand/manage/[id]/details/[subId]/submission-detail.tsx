"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface SubmissionDetailProps {
  submission: any // Replace 'any' with a more specific type if available
}

const SubmissionDetail = ({ submission }: SubmissionDetailProps) => {
  if (!submission) {
    return (
      <Card>
        <CardContent>
          <p>Submission not found.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{submission.title}</CardTitle>
        <CardDescription>{submission.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Display submission details here */}
        <p>Category: {submission.category}</p>
        <p>Original IP: {submission.originalIp}</p>
        {/* Add more details as needed */}
      </CardContent>
    </Card>
  )
}

export default SubmissionDetail

