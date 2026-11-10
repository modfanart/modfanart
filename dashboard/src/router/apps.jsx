
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

const iconProps = { size: 28, weight: "duotone" };

export const apps = [
  {
    id: "admin",
    name: "Admin Console",
    description: "Users, roles, permissions and activity logs",
    icon: <ShieldCheck {...iconProps} />,
    color: "text-sky-400 bg-sky-500/10",
    home: "/team-permissions",
    sections: [
      { label: "Users", path: "/team-permissions" },
      { label: "Roles", path: "/team-permissions/roles" },
      { label: "Activity Logs", path: "/admin/activity-logs" },
      { label: "Queries", path: "/queries" },
    ],
  },
  {
    id: "directory",
    name: "Directory",
    description: "Every artist, brand, judge, seller and request in one place",
    icon: <AddressBook {...iconProps} />,
    color: "text-emerald-400 bg-emerald-500/10",
    home: "/artists",
    sections: [
      { label: "Artists", path: "/artists", match: ["/artist"] },
      { label: "Brands", path: "/brands", match: ["/brand"] },
      { label: "Judges", path: "/judging", match: ["/judge"] },
      { label: "Sellers", path: "/sellers", match: ["/seller"] },
      { label: "Requests", path: "/requests" },
    ],
  },
  {
    id: "storefront",
    name: "Storefront",
    description: "Products, orders, fulfillment and marketplace operations",
    icon: <ShoppingBag {...iconProps} />,
    color: "text-amber-400 bg-amber-500/10",
    home: "/storefront",
    sections: [
      { label: "Shop", path: "/storefront", match: ["/merches"] },
      { label: "Products", path: "/storefront/products" },
      { label: "Orders", path: "/storefront/orders" },
      { label: "Fulfillment", path: "/storefront/fulfillment" },
    ],
  },
  {
    id: "brand-console",
    name: "Brand Console",
    description: "Act on behalf of brands you own or manage",
    icon: <Briefcase {...iconProps} />,
    color: "text-fuchsia-400 bg-fuchsia-500/10",
    home: "/brand-console",
    sections: [
      { label: "My brands", path: "/brand-console", match: ["/brand-console/"] },
    ],

  },
  {
    id: "campaigns",
    name: "Campaigns",
    description: "Contests, participants, contest material and licensing",
    icon: <Megaphone {...iconProps} />,
    color: "text-rose-400 bg-rose-500/10",
    home: "/opportunities",
    sections: [
      { label: "Contests", path: "/opportunities", match: ["/opportunity"] },
      { label: "Participants", path: "/submissions" },
      { label: "Materials", path: "/media-library" },
      { label: "Licensing", path: "/licensing" },
    ],
  },
  {
    id: "ledger",
    name: "Ledger",
    description: "Payouts and all price data",
    icon: <Wallet {...iconProps} />,
    color: "text-lime-400 bg-lime-500/10",
    home: "/ledger/payouts",
    sections: [
      { label: "Payouts", path: "/ledger/payouts" },
      { label: "Pricing", path: "/ledger/pricing" },
    ],
  },
  {
    id: "pipeline",
    name: "Pipeline",
    description: "Moderation queue and AI pipeline",
    icon: <Funnel {...iconProps} />,
    color: "text-violet-400 bg-violet-500/10",
    home: "/pipeline",
    sections: [
      { label: "Moderation Queue", path: "/pipeline" },
    ],
  },
  {
    id: "agenda",
    name: "Agenda",
    description: "Tasks and projects",
    icon: <CalendarCheck {...iconProps} />,
    color: "text-orange-400 bg-orange-500/10",
    home: "/tickets",
    sections: [
      { label: "Workbook", path: "/tickets", match: ["/tickets/workbook"] },
      { label: "Projects", path: "/tickets/projects", match: ["/project"] },
      { label: "My Tasks", path: "/tickets/tasks" },
    ],
  },
];

const isPrefix = (pathname, prefix) =>
  prefix === "/"
    ? pathname === "/"
    : pathname === prefix || pathname.startsWith(prefix + "/");

export function resolveApp(pathname) {
  let best = {};
  let bestLen = -1;

  for (const app of apps) {
    for (const section of app.sections) {
      const prefixes = [section.path, ...(section.match || [])];

      for (const p of prefixes) {
        if (isPrefix(pathname, p) && p.length > bestLen) {
          best = { app, section };
          bestLen = p.length;
        }
      }
    }
  }

  return best;
}

export { isPrefix };
