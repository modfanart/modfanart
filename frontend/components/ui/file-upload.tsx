"use client"

import { useRef, type ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"

interface FileUploadProps {
  accept?: string
  onChange: (file: File) => void
  className?: string
}

export function FileUpload({ accept, onChange, className }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onChange(file)
    }
  }

  return (
    <div className={className}>
      <input type="file" ref={inputRef} accept={accept} onChange={handleChange} className="hidden" />
      <Button type="button" variant="outline" onClick={handleClick} className="w-full">
        <Upload className="mr-2 h-4 w-4" />
        Upload File
      </Button>
    </div>
  )
}

