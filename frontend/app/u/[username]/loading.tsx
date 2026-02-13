'use client';

import { Skeleton } from '@/components/ui/skeleton';

export default function ProfileLoading() {
  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:py-12 max-w-7xl">
      <div className="space-y-8">
        {/* Header area */}
        <div className="space-y-3">
          <Skeleton className="h-8 w-64 rounded-lg" />
          <Skeleton className="h-5 w-96 rounded-md" />
        </div>

        {/* Profile card skeleton */}
        <div className="rounded-xl border bg-card p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar */}
            <Skeleton className="h-32 w-32 rounded-full shrink-0" />

            <div className="flex-1 space-y-4 w-full md:w-auto">
              {/* Name & handle */}
              <div className="space-y-2">
                <Skeleton className="h-8 w-64 rounded-lg" />
                <Skeleton className="h-5 w-48 rounded-md" />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2 text-center">
                    <Skeleton className="h-7 w-16 mx-auto rounded-md" />
                    <Skeleton className="h-4 w-20 mx-auto rounded" />
                  </div>
                ))}
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-20 w-full rounded-md" />
              </div>

              {/* Social links */}
              <div className="space-y-3">
                <Skeleton className="h-5 w-40 rounded" />
                <Skeleton className="h-5 w-40 rounded" />
                <Skeleton className="h-5 w-40 rounded" />
              </div>

              {/* Followers & edit button */}
              <div className="flex items-center gap-6">
                <Skeleton className="h-5 w-48 rounded" />
                <Skeleton className="h-10 w-32 rounded-lg" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs area skeleton */}
        <div className="space-y-6">
          {/* Tab headers */}
          <div className="flex gap-6 border-b pb-1">
            <Skeleton className="h-10 w-24 rounded-t-lg" />
            <Skeleton className="h-10 w-24 rounded-t-lg" />
            <Skeleton className="h-10 w-32 rounded-t-lg" />
          </div>

          {/* Sub-tabs (inside Favs) */}
          <div className="flex gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-20 rounded-md" />
            ))}
          </div>

          {/* Content cards */}
          <div className="space-y-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="rounded-lg border p-5">
                <div className="flex gap-5">
                  <Skeleton className="h-44 w-32 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-4">
                    <Skeleton className="h-7 w-3/4 rounded" />
                    <Skeleton className="h-4 w-full rounded" />
                    <Skeleton className="h-4 w-full rounded" />
                    <Skeleton className="h-4 w-2/3 rounded" />
                    <div className="flex gap-6">
                      <Skeleton className="h-5 w-16 rounded" />
                      <Skeleton className="h-5 w-16 rounded" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
