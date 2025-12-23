"use client"

import { DynamicImport } from "./dynamic-import"

export function DialogWrapper(props: any) {
  return <DynamicImport component={() => import("./dialog").then((mod) => ({ default: mod.Dialog }))} props={props} />
}

export function DialogTriggerWrapper(props: any) {
  return (
    <DynamicImport component={() => import("./dialog").then((mod) => ({ default: mod.DialogTrigger }))} props={props} />
  )
}

export function DialogContentWrapper(props: any) {
  return (
    <DynamicImport component={() => import("./dialog").then((mod) => ({ default: mod.DialogContent }))} props={props} />
  )
}

