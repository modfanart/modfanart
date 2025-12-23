"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { FileUpload } from "@/components/ui/file-upload"
import { uploadProfileImage } from "@/lib/actions/profile-actions"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface ProfileImageUploadProps {
  currentImage: string | null
  onImageChange: (url: string | null) => void
  userInitials: string
}

export function ProfileImageUpload({ currentImage, onImageChange, userInitials }: ProfileImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)

  const handleImageUpload = async (file: File) => {
    if (!file) return

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPEG, PNG, GIF, or WebP image.",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    try {
      const result = await uploadProfileImage(file)
      if (result.success && result.url) {
        onImageChange(result.url)
        toast({
          title: "Image uploaded",
          description: "Your profile image has been updated.",
        })
      } else {
        throw new Error(result.error || "Failed to upload image")
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = () => {
    onImageChange(null)
    toast({
      title: "Image removed",
      description: "Your profile image has been removed.",
    })
  }

  return (
    <div className="flex items-center gap-6">
      <Avatar className="h-24 w-24">
        {isUploading ? (
          <div className="h-full w-full flex items-center justify-center bg-muted">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <AvatarImage src={currentImage || ""} alt="Profile" />
            <AvatarFallback className="text-lg">{userInitials}</AvatarFallback>
          </>
        )}
      </Avatar>
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Profile Picture</h4>
        <div className="flex items-center gap-2">
          <FileUpload
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleImageUpload}
            className="w-auto"
          />
          {currentImage && (
            <Button variant="outline" size="sm" onClick={handleRemoveImage} disabled={isUploading}>
              Remove
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

