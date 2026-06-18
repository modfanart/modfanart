// src/routes/merchRoutes.js
import { WarningCircle, Gear } from "@phosphor-icons/react";
import ShopPage from "../../concepts/merch-on-demand/ShopPage";

export const merchRoutes = [
  // SETTINGS ROUTE
  {
    path: "/merches",
    name: "Merch",
    icon: <Gear size={20} />,
    isSidebarActive: true, // set false if you don't want it in sidebar
    element: <ShopPage />,
  },

];