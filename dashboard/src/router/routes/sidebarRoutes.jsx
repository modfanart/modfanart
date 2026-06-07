// src/routes/sidebarRoutes.js
import {
Users, Storefront, ShieldCheck, Trophy, ClipboardTextIcon, SquaresFour, Question, 
} from "@phosphor-icons/react"
import Dashboard from "../../concepts/dashboard/DashboardPage"
import ArtistsList from "../../concepts/artists/ArtistList"
import BrandsListPage from "../../concepts/brands/BrandsList"
import UsersPage from "../../concepts/team-permissions/UsersPage";
import OpportunitiesPage from "../../concepts/opportunities/OpportunitiesPage";
import SubmissionsPage from "../../concepts/submissions/SubmissionsPage";
import Queries from "../../concepts/queries/QueriesPage";
import JudgeList from "../../concepts/judges/JudgesList";
import { File } from "@phosphor-icons/react/dist/ssr";
import LicensesList from "../../concepts/licensing/LicensingList";
import { FileText } from "lucide-react";
const iconProps = {
  size: 20,
  weight: "duotone",
};

export const sidebarRoutes = [
 {
  path: "/",
  name: "Overview",
     icon: <SquaresFour {...iconProps} />,
    isSidebarActive: true,
    element: <Dashboard />,
 },
{
   path: "/brands",
   name: "Brands",
  icon: <Storefront {...iconProps} />,
   isSidebarActive: true,
   element: <BrandsListPage />,
  },
  {
    path: "/artists",
    name: "Artists",
    icon: <Users {...iconProps} />,
    isSidebarActive: true,
    element: <ArtistsList />,
  },
{
  path: "/opportunities",
   name: "Opportunities",
  icon: <Trophy {...iconProps} />,
   isSidebarActive: true,
  element: <OpportunitiesPage />,
   },
 {
   path: "/submissions",
   name: "Submissions",
  icon: <ClipboardTextIcon {...iconProps} />,
   isSidebarActive: true,
    element: <SubmissionsPage />,
  },
 {
   path: "/judging",
   name: "Judging",
 icon: <File {...iconProps} />,
   isSidebarActive: true,
   element: <JudgeList />,
 },
 {
  path: "/licensing",
   name: "Licensing",
 icon: <FileText {...iconProps} />,
  isSidebarActive: true,
 element: <LicensesList />,
 },
  // {
  //   path: "/storefront",
  //   name: "Storefront",
  //   icon: <ShoppingBag {...iconProps} />,
  //   isSidebarActive: true,
  //   element: null,
  // },
  // {
  //   path: "/content",
  //   name: "Content",
  //   icon: <Newspaper {...iconProps} />,
  //   isSidebarActive: true,
  //   element: null,
  // },
  // {
  //   path: "/review-automation",
  //   name: "Review Automation",
  //   icon: <Robot {...iconProps} />,
  //   isSidebarActive: true,
  //   element: null,
  // },
{
   path: "/team-permissions",
 name: "Team & Permissions",
   icon: <ShieldCheck {...iconProps} />,
   isSidebarActive: true,
  element: <UsersPage />,
  },
 {
   path: "/queries",
  name: "Queries",
 icon: <Question {...iconProps} />,
   isSidebarActive: true,
   element: <Queries />,
 },
];