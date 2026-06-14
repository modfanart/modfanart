import React from 'react';
import { cn } from '../../lib/utils';

export const SidebarLayout = ({
  sidebar,
  children,
  className,
}) => {
  return (
    <div className="h-screen w-full flex bg-black text-white overflow-hidden">

      {/* ===== SIDEBAR ===== */}
      <aside className="w-64 shrink-0 border-r border-zinc-900 bg-zinc-950">
        <div className="h-full flex flex-col">
          {sidebar}
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main className={cn(
        "flex-1 overflow-y-auto",
        className
      )}>
        {children}
      </main>

    </div>
  );
};