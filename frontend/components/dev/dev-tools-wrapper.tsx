'use client';

import dynamic from 'next/dynamic';

import type { ReactNode } from 'react';

// Dynamically import the debug panel to ensure it's only loaded in development
const DebugPanel = dynamic(
  () =>
    process.env.NODE_ENV === 'development'
      ? import('./debug-panel').then((mod) => mod.default)
      : Promise.resolve(() => null),
  { ssr: false }
);

interface DevToolsWrapperProps {
  children: ReactNode;
  showDebugTools?: boolean;
}

export function DevToolsWrapper({ children, showDebugTools = false }: DevToolsWrapperProps) {
  // In production, just return the children
  if (process.env.NODE_ENV !== 'development') {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      {showDebugTools && <DebugPanel />}
    </>
  );
}

export default DevToolsWrapper;
