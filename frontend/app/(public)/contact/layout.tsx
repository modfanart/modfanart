import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Contact Us | MOD Platform",
  description: "Get in touch with the MOD Platform team",
}

export default function ContactLayout({ children }: { children: ReactNode }) {
  return children
}

