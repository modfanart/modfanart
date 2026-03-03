import React from 'react';

const DashboardContent = () => {
  return (
    <div className="flex flex-col">
      <main className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Brand Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Welcome back! Manage your brand's fan art submissions, licenses & reviews.
              </p>
            </div>

            {/* Example action button – adjust to your needs */}
            <button className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              + New Campaign / Brief
            </button>
          </div>

          {/* Stats cards – placeholder / example */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <h3 className="text-sm font-medium text-muted-foreground">Active Campaigns</h3>
              <p className="text-3xl font-bold mt-2">8</p>
              <p className="text-xs text-muted-foreground mt-1">+2 this month</p>
            </div>

            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <h3 className="text-sm font-medium text-muted-foreground">Pending Submissions</h3>
              <p className="text-3xl font-bold mt-2">42</p>
              <p className="text-xs text-muted-foreground mt-1">12 need review</p>
            </div>

            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <h3 className="text-sm font-medium text-muted-foreground">Approved This Month</h3>
              <p className="text-3xl font-bold mt-2">67</p>
              <p className="text-xs text-muted-foreground mt-1">+18% vs last month</p>
            </div>

            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <h3 className="text-sm font-medium text-muted-foreground">Total Licensed Artworks</h3>
              <p className="text-3xl font-bold mt-2">184</p>
              <p className="text-xs text-muted-foreground mt-1">Revenue: $12,450</p>
            </div>
          </div>

          {/* You can add more sections here: */}
          {/* Recent activity, charts, tables of submissions, brand briefs, etc. */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Submissions</h2>
            <p className="text-sm text-muted-foreground">
              (Add your data table / list component here)
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardContent;
