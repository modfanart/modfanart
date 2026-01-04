"use client"

import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  className?: string
}

export function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-full justify-start text-left font-normal", className)}
          style={{ backgroundColor: value }}
        >
          <div className="flex w-full items-center gap-2">
            <div className="h-4 w-4 rounded border" style={{ backgroundColor: value }} />
            <span>{value}</span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="grid gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-10 w-full" />
              <Input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="w-24" />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

