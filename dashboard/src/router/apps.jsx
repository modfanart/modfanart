// Workspace app registry: apps, their sections, and the permission each one
// needs. The launcher, section tabs and route guard all read from here, so a
// staff role only sees (and can open) what its RBAC permissions allow.
// Admin-tier users pass every check.
import {
  ShieldCheck,
  AddressBook,
  ShoppingBag,
  Briefcase,
  Megaphone,
  Wallet,
  Funnel,
  CalendarCheck,
} from "@phosphor-icons/react";
import { useAuth } from "../contexts/AuthContext";

const iconProps = { size: 28, weight: "duotone" };

// `perm` may be a string or an array (any of).
export const apps = [
  {
    id: "admin",
    name: "Admin Console",
    description: "Users, roles & permissions, activity logs",
    icon: <ShieldCheck {...iconProps} />,
    color: "text-sky-400 bg-sky-500/10",
    sections: [
      { label: "Users", path: "/team-permissions", perm: "users.view" },
      { label: "Roles & permissions", path: "/team-permissions/roles", perm: "roles.view" },
      { label: "Activity logs", path: "/admin/activity-logs", perm: "audit.view" },
      { label: "Queries", path: "/queries", perm: "queries.manage" },
    ],
  },
  {
    id: "directory",
    name: "Directory",
    description: "Every artist, brand, judge, seller and request in one place",
    icon: <AddressBook {...iconProps} />,
    color: "text-emerald-400 bg-emerald-500/10",
    sections: [
      { label: "Artists", path: "/artists", match: ["/artist"], perm: "users.view" },
      { label: "Brands", path: "/brands", match: ["/brand"], perm: ["brands.manage", "brands.verify"] },
      { label: "Judges", path: "/judging", match: ["/judge"], perm: "contests.manage" },
      { label: "Sellers", path: "/sellers", match: ["/seller"], perm: "sellers.manage" },
      // Was "/requests", which had no route (404).
      { label: "Brand requests", path: "/brands/requests", perm: "brands.verify" },
    ],
  },
  {
    id: "campaigns",
    name: "Campaigns",
    description: "Contests, entries, prizes, materials and licensing",
    icon: <Megaphone {...iconProps} />,
    color: "text-rose-400 bg-rose-500/10",
    sections: [
      { label: "Contests", path: "/opportunities", match: ["/opportunity"], perm: "contests.manage" },
      { label: "Entries", path: "/submissions", perm: ["contests.moderate", "contests.manage"] },
      { label: "Prizes", path: "/campaigns/prizes", perm: ["prizes.manage", "contests.manage", "payouts.view"] },
      { label: "Materials", path: "/media-library", perm: "contests.manage" },
      { label: "Licensing", path: "/licensing", perm: ["licenses.view_all", "licenses.manage"] },
    ],
  },
  {
    id: "storefront",
    name: "Marketplace",
    description: "Products, sellers, orders, fulfilment and reviews",
    icon: <ShoppingBag {...iconProps} />,
    color: "text-amber-400 bg-amber-500/10",
    sections: [
      {
        label: "Overview",
        path: "/storefront/overview",
        perm: ["merch.moderate", "sellers.manage", "marketplace.manage", "orders.view_all", "payouts.view", "payouts.manage"],
      },
      { label: "Products", path: "/storefront/products", perm: "merch.moderate" },
      { label: "Seller applications", path: "/storefront/sellers", perm: "sellers.manage" },
      { label: "Orders", path: "/storefront/orders", perm: ["orders.view_all", "payouts.manage"] },
      { label: "Reviews", path: "/storefront/reviews", perm: "marketplace.manage" },
      { label: "Print providers", path: "/storefront/providers", perm: "marketplace.manage" },
      { label: "Shop preview", path: "/storefront", match: ["/merches", "/storefront/product"], perm: "workspace.access" },
    ],
  },
  {
    id: "ledger",
    name: "Ledger",
    description: "Payouts, fees and chargebacks",
    icon: <Wallet {...iconProps} />,
    color: "text-lime-400 bg-lime-500/10",
    sections: [
      { label: "Payouts", path: "/ledger/payouts", perm: ["payouts.view", "payouts.manage", "payouts.approve"] },
      { label: "Fee rules", path: "/ledger/pricing", perm: "marketplace.manage" },
      { label: "Disputes", path: "/ledger/disputes", perm: ["disputes.view", "payouts.manage"] },
    ],
  },
  {
    id: "brand-console",
    name: "Brand Console",
    description: "Act on behalf of brands you own or manage",
    icon: <Briefcase {...iconProps} />,
    color: "text-fuchsia-400 bg-fuchsia-500/10",
    sections: [
      { label: "My brands", path: "/brand-console", match: ["/brand-console/"], perm: "workspace.access" },
    ],
  },
  {
    id: "pipeline",
    name: "Pipeline",
    description: "Moderation queue",
    icon: <Funnel {...iconProps} />,
    color: "text-violet-400 bg-violet-500/10",
    sections: [{ label: "Moderation queue", path: "/pipeline", perm: "contests.moderate" }],
  },
  {
    id: "agenda",
    name: "Agenda",
    description: "Tasks and projects",
    icon: <CalendarCheck {...iconProps} />,
    color: "text-orange-400 bg-orange-500/10",
    sections: [
      { label: "Workbook", path: "/tickets", match: ["/tickets/workbook"], perm: "workspace.access" },
      { label: "Projects", path: "/tickets/projects", match: ["/project"], perm: "workspace.access" },
      { label: "My tasks", path: "/tickets/tasks", perm: "workspace.access" },
    ],
  },
];

const isPrefix = (pathname, prefix) =>
  prefix === "/" ? pathname === "/" : pathname === prefix || pathname.startsWith(prefix + "/");

export function resolveApp(pathname, appList = apps) {
  let best = {};
  let bestLen = -1;
  for (const app of appList) {
    for (const section of app.sections) {
      for (const p of [section.path, ...(section.match || [])]) {
        if (isPrefix(pathname, p) && p.length > bestLen) {
          best = { app, section };
          bestLen = p.length;
        }
      }
    }
  }
  return best;
}

/** Apps (and sections) the user may see; each app's home = first allowed section. */
export function visibleApps(can) {
  return apps
    .map((app) => {
      const sections = app.sections.filter((s) => !s.perm || can(s.perm));
      return sections.length ? { ...app, sections, home: sections[0].path } : null;
    })
    .filter(Boolean);
}

/** Route guard: a path that belongs to a section needs that section's permission. */
export function canOpenPath(pathname, can) {
  const { section } = resolveApp(pathname);
  if (!section?.perm) return true;
  return can(section.perm);
}

export function useVisibleApps() {
  const { can } = useAuth();
  return visibleApps(can);
}

export { isPrefix };
