import React from "react";
  import { Sidebar } from "../brand/brandsidebar";

  interface BrandDashboardProps {
    children: React.ReactNode
  }

  export default function BrandDashboard({children}: BrandDashboardProps) {
    return (
        <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
              <Sidebar />
              <div className="flex flex-col">
                <main className="flex-1 overflow-y-auto p-6">{children}</main>
              </div>
            </div>
    )
  }