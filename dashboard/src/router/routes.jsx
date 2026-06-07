// src/routes/index.js  (or masterRoutes.js)

import { sidebarRoutes } from "./routes/sidebarRoutes";
import { authRoutes } from "./routes/authRoutes";
import { errorRoutes } from "./routes/errorRoutes";
import { otherRoutes } from "./routes/otherRoutes";
import {contestRoutes } from "./routes/contestRoutes";
const masterRoutes = [
...authRoutes,
  ...sidebarRoutes, ...errorRoutes, ...otherRoutes, ...contestRoutes
];

export default masterRoutes;
