// src/routes/otherRoutes.js
import { WarningCircle, Gear } from "@phosphor-icons/react";
import Settings from "../../concepts/settings/SettingsPage"; // adjust path if needed

export const otherRoutes = [
  // SETTINGS ROUTE
  {
    path: "/settings",
    name: "Settings",
    icon: <Gear size={20} />,
    isSidebarActive: true, // set false if you don't want it in sidebar
    element: <Settings />,
  },

  // {
  //   path: "/no-access",
  //   name: "No Access",
  //   icon: <WarningCircle size={20} />,
  //   isSidebarActive: false,
  //   element: <NoAccess />,
  // },
];