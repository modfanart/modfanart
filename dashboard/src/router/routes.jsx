// src/routes/index.js  (or masterRoutes.js)

import { sidebarRoutes } from "./routes/sidebarRoutes";
import { authRoutes } from "./routes/authRoutes";
import { errorRoutes } from "./routes/errorRoutes";
import { otherRoutes } from "./routes/otherRoutes";
import {contestRoutes } from "./routes/contestRoutes";
import {projectTasksRoutes }from "./routes/projectTaskRoutes";
import { userRoutes } from "./routes/userRoutes";
import { merchRoutes } from "./routes/merchRoutes";
import { brandRoutes } from "./routes/brandRoutes";
const masterRoutes = [
...authRoutes,
  ...sidebarRoutes, ...errorRoutes, ...otherRoutes, ...contestRoutes, ...projectTasksRoutes, ...userRoutes, ...merchRoutes, ...brandRoutes
];

export default masterRoutes;
