import React from "react";
import { Link } from "react-router-dom";
import { Header } from "../../components/layout/Header";
import { useAuth } from "../../contexts/AuthContext";
import { useVisibleApps } from "../../router/apps";
import { cn } from "../../lib/utils";

const LauncherPage = () => {
  const { user } = useAuth();
  const apps = useVisibleApps();
  const name = user?.username || user?.email?.split("@")[0];

  return (
    <div className="min-h-screen">
      <Header title="MOD Workspace" subtitle="Choose an app to get started" />

      <main className="mx-auto max-w-5xl p-4 sm:p-8">
        <h2 className="mb-6 text-2xl font-semibold text-white">
          {name ? `Welcome back, ${name}` : "Welcome back"}
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {apps.map((app) => {
            const planned = app.status === "planned";
            const card = (
              <div
                className={cn(
                  "flex h-full flex-col gap-4 rounded-xl border border-zinc-800 bg-zinc-900 p-5 transition-colors",
                  planned
                    ? "opacity-60"
                    : "hover:border-zinc-600 hover:bg-zinc-800/60"
                )}
              >
                <div className="flex items-start justify-between">
                  <span className={cn("rounded-xl p-3", app.color)}>
                    {app.icon}
                  </span>
                  {planned && (
                    <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-[10px] uppercase tracking-wide text-zinc-400">
                      Coming soon
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-medium text-white">{app.name}</p>
                  <p className="mt-1 text-sm text-zinc-400">
                    {app.description}
                  </p>
                </div>
              </div>
            );
            return planned ? (
              <div key={app.id} className="cursor-not-allowed">
                {card}
              </div>
            ) : (
              <Link key={app.id} to={app.home} data-testid={`app-${app.id}`}>
                {card}
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default LauncherPage;
