// src/routes/authRoutes.js
import { SignIn, WarningCircle } from "@phosphor-icons/react";

import Login from "../../concepts/auth/LoginPage";
import NoAccess from "../../concepts/auth/NoAccessPage";

const iconProps = {
  size: 20,
  weight: "duotone",
};

export const authRoutes = [
  {
    path: "/login",
    name: "Login",
    icon: <SignIn {...iconProps} />,
    isSidebarActive: false,
    element: <Login />,
  },
  {
    path: "/no-access",
    name: "No Access",
    icon: <WarningCircle {...iconProps} />,
    isSidebarActive: false,
    element: <NoAccess />,
  },
];