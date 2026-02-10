"use client"

import type { HTMLAttributes } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  ImageIcon,
  FileCheck,
  BarChart3,
  ShieldCheck,
  Settings,
  CreditCard,
  HelpCircle,
  History,
  PlusCircle,
  LayoutDashboard,
  Trophy,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface SidebarProps extends HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className, ...props }: SidebarProps) {
  const pathname = usePathname()

  // Debug logging for navigation
  console.log("Sidebar rendered with pathname:", pathname)

  const routes = [
    {
      label: "Campaign Management",
      icon: <ImageIcon className="h-5 w-5" />,
      href: "/brand/manage",
      active: pathname.startsWith("/brand")
    },
    {
      label: "Fan Asset Hub",
      icon: <FileCheck className="h-5 w-5" />,
      href: "/license-requests",
      active: pathname === "/license-requests",
    },
    {
      label: "Marketplace",
      icon: <CreditCard className="h-5 w-5" />,
      href: "/earnings",
      active: pathname === "/earnings",
    },
  ]

  return (
    <div className="flex h-full flex-col border-r bg-white">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mod-logo-dark-gTZuJePnecraDwGyMlBCHe6E6xJgsx.png"
            alt="MOD Logo"
            width={80}
            height={30}
            className="h-8 w-auto"
          />
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-xs font-semibold uppercase tracking-tight text-gray-500">MENU</h2>

          <nav className="space-y-1">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                prefetch={true}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                  route.active ? "bg-[#9747ff] text-white" : "text-gray-700 hover:bg-gray-100",
                )}
                data-testid={route["data-testid"]}
              >
                {route.icon}
                {route.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-xs font-semibold uppercase tracking-tight text-gray-500">SUPPORT</h2>
          <nav className="space-y-1">
            <Link
              href="/settings"
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                pathname === "/settings" ? "bg-[#9747ff] text-white" : "text-gray-700 hover:bg-gray-100",
              )}
              prefetch={true}
            >
              <Settings className="h-5 w-5" />
              Settings
            </Link>
            <Link
              href="/help"
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                pathname === "/help" ? "bg-[#9747ff] text-white" : "text-gray-700 hover:bg-gray-100",
              )}
              prefetch={true}
            >
              <HelpCircle className="h-5 w-5" />
              Help
            </Link>
          </nav>
        </div>
      </div>
    </div>
  )
}