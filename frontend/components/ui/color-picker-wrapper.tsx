"use client"

import { DynamicImport } from "./dynamic-import"

export function ColorPickerWrapper(props: any) {
  return (
    <DynamicImport
      component={() => import("./color-picker").then((mod) => ({ default: mod.ColorPicker }))}
      props={props}
      fallback={<div className="w-full h-10 bg-muted/20 rounded-md animate-pulse" />}
    />
  )
}

