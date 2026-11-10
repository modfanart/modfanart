// src/routes/sidebarRoutes.jsx
//
// Protected pages that belong to an app (see router/apps.jsx for the app/section
// grouping). The file name is kept so routes.jsx doesn't change, but there is no
// sidebar any more: "isSidebarActive" now only means "render inside MainLayout".
import { Navigate } from "react-router-dom";
import Launcher from "../../concepts/launcher/LauncherPage";
import ComingSoon from "../../concepts/launcher/ComingSoonPage";
import Dashboard from "../../concepts/dashboard/DashboardPage";
import WorkbookPage from "../../concepts/tasks/WorkbookPage";
import ProjectsPage from "../../concepts/tasks/ProjectsPage";
import MyTasksPage from "../../concepts/tasks/MyTasksPage";
import RolesPage from "../../concepts/team-permissions/RolesPage";
import ActivityLogsPage from "../../concepts/admin/ActivityLogsPage";
import SellersList from "../../concepts/sellers/SellersList";
import ArtistsList from "../../concepts/artists/ArtistList";
import BrandsListPage from "../../concepts/brands/BrandsList";
import UsersPage from "../../concepts/team-permissions/UsersPage";
import OpportunitiesPage from "../../concepts/opportunities/OpportunitiesPage";
import SubmissionsPage from "../../concepts/submissions/SubmissionsPage";
import Queries from "../../concepts/queries/QueriesPage";
import JudgeList from "../../concepts/judges/JudgesList";
import LicensesList from "../../concepts/licensing/LicensingList";
import MediaList from "../../concepts/media/MediaList";
import ShopPage from "../../concepts/merch-on-demand/ShopPage";
import ProductDetailPage from "../../concepts/merch-on-demand/ProductDetailPage";

export const sidebarRoutes = [
  // Launcher
  { path: "/", name: "Workspace", isSidebarActive: true, element: <Launcher /> },

  // Admin Console
  { path: "/team-permissions", name: "Users", isSidebarActive: true, element: <UsersPage /> },
  { path: "/team-permissions/roles", name: "Roles", isSidebarActive: true, element: <RolesPage /> },
  {
    path: "/admin/activity-logs",
    name: "Activity Logs",
    isSidebarActive: true,
    element: <ActivityLogsPage />,
  },
  { path: "/queries", name: "Queries", isSidebarActive: true, element: <Queries /> },

  // Directory
  { path: "/artists", name: "Artists", isSidebarActive: true, element: <ArtistsList /> },
  { path: "/brands", name: "Brands", isSidebarActive: true, element: <BrandsListPage /> },
  { path: "/judging", name: "Judges", isSidebarActive: true, element: <JudgeList /> },
  { path: "/sellers", name: "Sellers", isSidebarActive: true, element: <SellersList /> },

  // Storefront
  { path: "/storefront", name: "Storefront", isSidebarActive: true, element: <ShopPage /> },
  { path: "/storefront/product/:productId", name: "Product", isSidebarActive: true, element: <ProductDetailPage /> },
  { path: "/storefront/:brandId", name: "Brand store", isSidebarActive: true, element: <ShopPage /> },
  { path: "/licensing", name: "Licensing", isSidebarActive: true, element: <LicensesList /> },

  // Campaigns
  { path: "/opportunities", name: "Contests", isSidebarActive: true, element: <OpportunitiesPage /> },
  { path: "/submissions", name: "Participants", isSidebarActive: true, element: <SubmissionsPage /> },
  { path: "/media-library", name: "Materials", isSidebarActive: true, element: <MediaList /> },

  // Ledger
  { path: "/ledger", name: "Ledger", isSidebarActive: true, element: <Navigate to="/ledger/payouts" replace /> },
  {
    path: "/ledger/payouts",
    name: "Payouts",
    isSidebarActive: true,
    element: <ComingSoon title="Payouts" description="Every payout across sellers" />,
  },
  {
    path: "/ledger/pricing",
    name: "Pricing",
    isSidebarActive: true,
    element: <ComingSoon title="Pricing" description="Platform fees and all price data" />,
  },

  // Pipeline (existing moderation dashboard, unchanged)
  { path: "/pipeline", name: "Pipeline", isSidebarActive: true, element: <Dashboard /> },

  // Agenda — each section is its own page
  { path: "/tickets", name: "Workbook", isSidebarActive: true, element: <WorkbookPage /> },
  { path: "/tickets/workbook", name: "Workbook", isSidebarActive: true, element: <WorkbookPage /> },
  { path: "/tickets/projects", name: "Projects", isSidebarActive: true, element: <ProjectsPage /> },
  { path: "/tickets/tasks", name: "My Tasks", isSidebarActive: true, element: <MyTasksPage /> },
];
