// app/(dashboard)/brand/page.tsx
import React from 'react';
import { Sidebar } from './brandsidebar'; // adjust path if needed

export default function BrandDashboard() {
  // No props, no children — this is now a full page
  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      <Sidebar />
      <div className="flex flex-col">
        <main className="flex-1 overflow-y-auto p-6">
          {/* 
            Put your actual brand dashboard content here.
            This is where your page-specific UI lives now.
            Examples:
              - Overview stats
              - List of submissions/brands
              - Welcome message
              - Any server-fetched data
          */}
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">Brand Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's an overview of your brand activity.
            </p>

            {/* Add cards, tables, charts, etc. here */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Example placeholder cards */}
              <div className="rounded-lg border bg-card p-6 shadow-sm">
                <h3 className="text-lg font-semibold">Active Submissions</h3>
                <p className="text-3xl font-bold mt-2">24</p>
              </div>
              <div className="rounded-lg border bg-card p-6 shadow-sm">
                <h3 className="text-lg font-semibold">Pending Reviews</h3>
                <p className="text-3xl font-bold mt-2">7</p>
              </div>
              <div className="rounded-lg border bg-card p-6 shadow-sm">
                <h3 className="text-lg font-semibold">Approved This Month</h3>
                <p className="text-3xl font-bold mt-2">15</p>
              </div>
            </div>

            {/* More content... */}
          </div>
        </main>
      </div>
    </div>
  );
}
