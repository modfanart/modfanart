"use client"

import { useState } from "react"
import { Eye, MoreHorizontal, Check, X, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface OpportunityEntryProps {
  entry: {
    id: string
    title: string
    artist: string
    status: string
    submittedAt: string
    imageUrl: string
  }
  onUpdateStatus: (id: string, status: string) => void
  onDelete: (id: string) => void
}

export function OpportunityEntry({ entry, onUpdateStatus, onDelete }: OpportunityEntryProps) {
  const [viewDialogOpen, setViewDialogOpen] = useState(false)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      case "pending":
        return <Badge variant="outline">Pending</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <>
      <div className="grid grid-cols-[1fr_100px_100px_80px] gap-4 items-center py-3 border-b border-border last:border-0">
        <div className="font-medium">{entry.title}</div>
        <div className="text-sm">{entry.artist}</div>
        <div>{getStatusBadge(entry.status)}</div>
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setViewDialogOpen(true)}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdateStatus(entry.id, "approved")}>
                <Check className="mr-2 h-4 w-4 text-green-500" />
                Approve
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdateStatus(entry.id, "rejected")}>
                <X className="mr-2 h-4 w-4 text-red-500" />
                Reject
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(entry.id)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* View Entry Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{entry.title}</DialogTitle>
            <DialogDescription>
              Submitted by {entry.artist} on {formatDate(entry.submittedAt)}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="flex justify-center">
              <img
                src={entry.imageUrl || "/placeholder.svg"}
                alt={entry.title}
                className="max-h-[300px] object-contain rounded-md"
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Status</p>
              <div>{getStatusBadge(entry.status)}</div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between sm:space-x-2">
            <div className="flex space-x-2 mb-3 sm:mb-0">
              <Button variant="outline" onClick={() => onUpdateStatus(entry.id, "approved")}>
                Approve
              </Button>
              <Button variant="outline" onClick={() => onUpdateStatus(entry.id, "rejected")}>
                Reject
              </Button>
            </div>
            <Button variant="secondary" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

