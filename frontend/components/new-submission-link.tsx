"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

export function NewSubmissionLink() {
  return (
    <Link href="/submissions/new" passHref legacyBehavior replace>
      <Button className="bg-[#9747ff] hover:bg-[#8035e0]" asChild>
        <a>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Submission
        </a>
      </Button>
    </Link>
  )
}

