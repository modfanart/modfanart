"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function ExampleComponent() {
  // Only render in development environment
  const renderComponent = process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_DEBUG

  const [count, setCount] = useState(0)

  if (!renderComponent) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Example Component</CardTitle>
        <CardDescription>This is an example component for development purposes</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Count: {count}</p>
      </CardContent>
      <CardFooter>
        <Button onClick={() => setCount(count + 1)}>Increment</Button>
      </CardFooter>
    </Card>
  )
}

