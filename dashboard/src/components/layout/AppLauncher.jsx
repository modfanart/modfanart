import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { DotsNine } from "@phosphor-icons/react";
import { resolveApp, isPrefix, useVisibleApps } from "../../router/apps";
import { cn } from "../../lib/utils";

// Google-style 9-dot button that opens a grid of apps.
export const AppLauncher = () => {
  const apps = useVisibleApps();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { app: current } = resolveApp(pathname);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Apps"
        aria-expanded={open}
        className={cn(
          "rounded-md p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white",
          open && "bg-zinc-800 text-white"
        )}
      >
        <DotsNine weight="bold" className="h-6 w-6" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 z-50 mt-2 w-[19rem] rounded-xl border border-zinc-700 bg-zinc-900 p-3 shadow-2xl sm:w-[22rem]">
            <div className="grid grid-cols-3 gap-1">
              {apps.map((app) => {
                const planned = app.status === "planned";
                const active = current?.id === app.id;
                const tile = (
                  <div
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-lg p-3 text-center transition-colors",
                      planned
                        ? "cursor-not-allowed opacity-50"
                        : "hover:bg-zinc-800",
                      active && "bg-zinc-800 ring-1 ring-zinc-600"
                    )}
                  >
                    <span className={cn("rounded-lg p-2", app.color)}>
                      {React.cloneElement(app.icon, { size: 24 })}
                    </span>
                    <span className="text-xs font-medium leading-tight text-zinc-200">
                      {app.name}
                    </span>
                    {planned && (
                      <span className="text-[10px] uppercase tracking-wide text-zinc-500">
                        Soon
                      </span>
                    )}
                  </div>
                );
                return planned ? (
                  <div key={app.id}>{tile}</div>
                ) : (
                  <Link key={app.id} to={app.home}>
                    {tile}
                  </Link>
                );
              })}
            </div>
            <div className="mt-2 border-t border-zinc-800 pt-2 text-center">
              <Link
                to="/"
                className="text-xs text-zinc-400 hover:text-white"
              >
                All apps
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Section tabs for whichever app the current URL belongs to.
export const AppSectionNav = () => {
  const { pathname } = useLocation();
  const apps = useVisibleApps();
  // Only show tabs for sections this user may open.
  const { app, section } = resolveApp(pathname, apps);

  if (!app || app.sections.length < 2) return null;

  return (
    <nav className="flex items-center gap-1 overflow-x-auto border-t border-zinc-800/70 px-4 sm:px-6">
      <span className="mr-3 shrink-0 text-xs font-semibold uppercase tracking-wider text-zinc-500">
        {app.name}
      </span>
      {app.sections.map((s) => {
        const active = section?.path === s.path;
        return (
          <NavLink
            key={s.path}
            to={s.path}
            className={cn(
              "shrink-0 border-b-2 px-3 py-2.5 text-sm transition-colors",
              active
                ? "border-white text-white"
                : "border-transparent text-zinc-400 hover:text-white"
            )}
          >
            {s.label}
          </NavLink>
        );
      })}
    </nav>
  );
};

export default AppLauncher;
