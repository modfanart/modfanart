import type { ReactNode } from "react"
import { LayoutWrapper } from "@/components/layout-wrapper"

export default function ResourcesLayout({
  children,
}: {
  children: ReactNode
}) {
  return <LayoutWrapper>{children}</LayoutWrapper>
}

