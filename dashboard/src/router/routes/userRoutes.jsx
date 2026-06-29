// src/routes/userRoutes.js
import { WarningCircle } from "@phosphor-icons/react";

import ArtistDetails from "../../concepts/artists/ArtistDetail";
import JudgeDetailPage from "../../concepts/judges/JudgeDetailPage";
export const userRoutes = [


    {
        path: "/artist/:id", name: "Artist Details", icon: <WarningCircle size={20} />, isSidebarActive: true, element: <ArtistDetails />,
    },
    {
        path: "/judge/:id", name: "Judge Details", icon: <WarningCircle size={20} />, isSidebarActive: true, element: <JudgeDetailPage />,
    }
];