// src/routes/authRoutes.js
import { SignIn, WarningCircle } from "@phosphor-icons/react";

import {DashboardPage} from "../../concepts/dashboard/DashboardPage";
const iconProps = {
  size: 20,
  weight: "duotone",
};

export const dashboardRoutes = [
  {
    path: "/",
    name: "Dashboard",
    icon: <SignIn {...iconProps} />,
    isSidebarActive: false,
    element: <DashboardPage />,
  },

];