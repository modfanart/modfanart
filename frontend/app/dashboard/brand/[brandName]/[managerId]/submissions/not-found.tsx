import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ImageIcon } from "lucide-react"

export default function SubmissionsNotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
      <div className="flex flex-col items-center text-center max-w-md">
        <div className="rounded-full bg-muted p-4 mb-6">
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Submission Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The submission you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <div className="flex gap-4">
          <Link href="/submissions/manage">
            <Button variant="outline">View My Submissions</Button>
          </Link>
          <Link href="/submissions/new">
            <Button>Create New Submission</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

