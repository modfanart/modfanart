// src/routes/userRoutes.js
import { WarningCircle } from "@phosphor-icons/react";

import ArtistDetails from "../../concepts/artists/ArtistDetail";
export const userRoutes = [


{
    path: "/artist/:id", name: "Artist Details", icon: <WarningCircle size={20} />, isSidebarActive: true, element: <ArtistDetails />,
}
];