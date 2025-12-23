"use client"

import { DynamicImport } from "./dynamic-import"
import type { CalendarProps } from "react-day-picker"

export function CalendarWrapper(props: CalendarProps) {
  return (
    <DynamicImport
      component={() => import("./calendar").then((mod) => ({ default: mod.Calendar }))}
      props={props}
      fallback={
        <div className="p-3 w-full max-w-sm bg-muted/20 rounded-md">
          <div className="space-y-2">
            <div className="h-8 bg-muted/30 rounded-md" />
            <div className="grid grid-cols-7 gap-1">
              {Array(35)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="aspect-square rounded-md bg-muted/30" />
                ))}
            </div>
          </div>
        </div>
      }
    />
  )
}

