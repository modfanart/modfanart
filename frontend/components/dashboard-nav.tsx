"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { BarChart3, CheckCircle2, Image, LayoutGrid, User, Settings, CreditCard, Shield } from "lucide-react"

interface DashboardNavProps extends React.HTMLAttributes<HTMLElement> {
  items?: {
    href: string
    title: string
    icon: React.ReactNode
  }[]
}

export function DashboardNav({ className, items, ...props }: DashboardNavProps) {
  const pathname = usePathname()

  const defaultItems = [
    {
      href: "/dashboard",
      title: "Overview",
      icon: <LayoutGrid className="mr-2 h-4 w-4" />,
    },
    {
      href: "/submissions/manage",
      title: "My Submissions",
      icon: <Image className="mr-2 h-4 w-4" />,
      active: pathname === "/submissions/manage" || pathname.startsWith("/submissions/"),
    },
    {
      href: "/dashboard/approvals",
      title: "Approvals",
      icon: <CheckCircle2 className="mr-2 h-4 w-4" />,
    },
    {
      href: "/dashboard/analytics",
      title: "Analytics",
      icon: <BarChart3 className="mr-2 h-4 w-4" />,
    },
    {
      title: "IP Compliance",
      href: "/dashboard/compliance",
      icon: <Shield className="mr-2 h-4 w-4" />,
    },
    {
      href: "/dashboard/profile",
      title: "Profile",
      icon: <User className="mr-2 h-4 w-4" />,
    },
    {
      href: "/dashboard/billing",
      title: "Billing",
      icon: <CreditCard className="mr-2 h-4 w-4" />,
    },
    {
      href: "/dashboard/settings",
      title: "Settings",
      icon: <Settings className="mr-2 h-4 w-4" />,
    },
  ]

  const navItems = items || defaultItems

  return (
    <nav className={cn("flex flex-col space-y-1", className)} {...props}>
      {navItems.map((item) => (
        <Button
          key={item.href}
          variant={pathname === item.href ? "secondary" : "ghost"}
          className={cn("justify-start", pathname === item.href && "bg-muted font-medium")}
          asChild
        >
          <Link href={item.href}>
            {item.icon}
            {item.title}
          </Link>
        </Button>
      ))}
    </nav>
  )
}

