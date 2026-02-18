'use client';

import { Suspense, lazy, type ComponentType } from 'react';

import { Skeleton } from './skeleton';

import type React from 'react';

interface DynamicImportProps {
  component: () => Promise<{ default: ComponentType<any> }>;
  fallback?: React.ReactNode;
  props?: Record<string, any>;
}

export function DynamicImport({
  component,
  fallback = <Skeleton className="w-full h-40" />,
  props = {},
}: DynamicImportProps) {
  const LazyComponent = lazy(component);

  return (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  );
}
