"use client"

import type React from "react"

import { DynamicImport } from "./dynamic-import"
import type { ChartConfig } from "./chart"

interface ChartContainerProps {
  config: ChartConfig
  children: React.ReactNode
  className?: string
  id?: string
}

export function ChartWrapper(props: ChartContainerProps) {
  return (
    <DynamicImport
      component={() => import("./chart").then((mod) => ({ default: mod.ChartContainer }))}
      props={props}
      fallback={
        <div className="aspect-video w-full bg-muted/20 rounded-md flex items-center justify-center">
          <div className="text-sm text-muted-foreground">Loading chart...</div>
        </div>
      }
    />
  )
}

export function LineChartWrapper(props: any) {
  return <DynamicImport component={() => import("./chart").then((mod) => ({ default: mod.LineChart }))} props={props} />
}

export function BarChartWrapper(props: any) {
  return <DynamicImport component={() => import("./chart").then((mod) => ({ default: mod.BarChart }))} props={props} />
}

