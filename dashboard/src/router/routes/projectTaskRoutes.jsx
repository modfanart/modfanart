// src/routes/projectTaskRoutes.js
import { WarningCircle } from "@phosphor-icons/react";
import {ProjectDetailPage} from "../../concepts/tasks/ProjectDetailsPage";
export const projectTasksRoutes = [

{
    path: "/project/:projectId", name: "Project Details", icon: <WarningCircle size={20} />, isSidebarActive: true, element: <ProjectDetailPage />,
}
];