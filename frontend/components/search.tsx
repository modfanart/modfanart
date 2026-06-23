"use client"

import type React from "react"

import { useState } from "react"
import { SearchIcon } from "lucide-react"
import { Input } from "@/components/ui/input"

interface SearchProps {
  onSearch?: (query: string) => void
}

export function Search({ onSearch }: SearchProps = {}) {
  const [value, setValue] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setValue(newValue)

    if (onSearch) {
      onSearch(newValue)
    }
  }

  return (
    <div className="relative max-w-md">
      <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search..."
        className="w-full bg-background pl-8 md:w-[300px] lg:w-[400px]"
        value={value}
        onChange={handleChange}
      />
    </div>
  )
}

