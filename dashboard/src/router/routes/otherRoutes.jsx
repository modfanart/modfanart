// src/routes/otherRoutes.js
import { WarningCircle, Gear } from "@phosphor-icons/react";
import Settings from "../../concepts/settings/SettingsPage"; // adjust path if needed
import { User } from "lucide-react";
import ProfilePage from "../../concepts/profile/ProfilePage";

export const otherRoutes = [
  // SETTINGS ROUTE
  {
    path: "/settings",
    name: "Settings",
    icon: <Gear size={20} />,
    isSidebarActive: true, // set false if you don't want it in sidebar
    element: <Settings />,
  },
  {
    path: "/u/:id", name: "Profile", icon: <User size={20} />, isSidebarActive: true, element: <ProfilePage /> // set false if you don't want it in sidebar
  }
  // {
  //   path: "/no-access",
  //   name: "No Access",
  //   icon: <WarningCircle size={20} />,
  //   isSidebarActive: false,
  //   element: <NoAccess />,
  // },
];