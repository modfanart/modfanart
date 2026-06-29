// src/routes/authRoutes.js
import { SignIn, WarningCircle } from "@phosphor-icons/react";

import OpportunityDetailPage from "../../concepts/opportunities/OpportunityDetailPage";
import OpportunityEntriesPage from "../../concepts/opportunities/OppotunityEntriesPage";
import OpportunityLeaderboardPage from "../../concepts/opportunities/OppotunityLeaderboardPage";
import ContestFormPage from "../../concepts/opportunities/ContestFormPage";
const iconProps = {
  size: 20,
  weight: "duotone",
};

export const contestRoutes = [
  {
    path: "/opportunity/:id",
    name: "Contest",
    icon: <SignIn {...iconProps} />,
    isSidebarActive: true,
    element: <OpportunityDetailPage />,
  },
  {
    path: "/opportunity/add",
    name: "Add Contest",
    icon: <SignIn {...iconProps} />,
    isSidebarActive: true,
    element: <ContestFormPage />,
  },
  {
    path: "/opportunity/:id/entries",
    name: "Contest",
    icon: <SignIn {...iconProps} />,
    isSidebarActive: true,
    element: <OpportunityEntriesPage />,
  },
  {
    path: "/opportunity/:id/leaderboard",
    name: "Contest",
    icon: <SignIn {...iconProps} />,
    isSidebarActive: true,
    element: <OpportunityLeaderboardPage />,
  },
];