'use client';

import type React from 'react';
import { DynamicImport } from './dynamic-import';
import type { ChartConfig } from './chart';
import { ChartContainer } from './chart';

interface ChartContainerProps {
  config: ChartConfig;
  children: React.ReactElement; // ← Change from React.ReactNode to React.ReactElement
  className?: string;
  id?: string;
}

export function ChartWrapper({ config, children, className, id }: ChartContainerProps) {
  return (
    <ChartContainer config={config} className={className} id={id}>
      {children}
    </ChartContainer>
  );
}

// For the lazy version, apply the same type fix:
export function LazyChartWrapper({ config, children, className, id }: ChartContainerProps) {
  return (
    <DynamicImport
      component={() => import('./chart').then((mod) => ({ default: mod.ChartContainer }))}
      props={{ config, children, className, id }}
      fallback={
        <div className="aspect-video w-full bg-muted/20 rounded-md flex items-center justify-center">
          <div className="text-sm text-muted-foreground">Loading chart...</div>
        </div>
      }
    />
  );
}
