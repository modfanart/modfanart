// index.js

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const rateLimit = require("express-rate-limit");
const fs = require("fs");
const attachDb = require("./src/common/middleware/attachDb");
const requestLogger = require("./src/common/middleware/requestLogger");
const errorHandler = require("./src/common/middleware/error");

dotenv.config();
/** */
const app = express();
app.set('trust proxy', 1);

// ====================== GLOBAL ERROR HANDLERS ======================
process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught Exception:", err.message);
  console.error(err.stack);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("💥 Unhandled Rejection at:", promise);
  console.error("Reason:", reason);
  console.error(reason?.stack || reason);
});

// Keep process alive even if async tasks finish
const keepAlive = setInterval(() => {}, 60 * 60 * 1000); // 1 hour

const TEMP_DIR = process.env.TEMP_UPLOAD_DIR || "/tmp/cdn_uploads";
// ====================== RATE LIMITER ======================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    status: 429,
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// ====================== CORS ======================
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://www.modfanofficial.com",
  "https://modfanofficial.com",
  "https://workspace.modfanofficial.com",
  "http://nzncosjnx8014zyshs22q40y.2.25.128.115.sslip.io"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(null, false); // 👈 IMPORTANT CHANGE
    },
    credentials: true,
  })
);
// ====================== MIDDLEWARE ======================
app.use(express.json());
app.use(requestLogger);
app.use(attachDb);

// ====================== STATIC ======================
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}
// ====================== HEALTH ======================
app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// ====================== ROUTES ======================
const routes = [
  { path: "/api/tags", module: "./src/modules/tags/tagging.routes.js" },
  { path: "/api/contest", module: "./src/modules/contests/contest.routes.js" },
  { path: "/api/order", module: "./src/modules/licenses/order.routes.js" },
  {
    path: "/api/category",
    module: "./src/modules/artworks/category.routes.js",
  },
  { path: "/api/contact", module: "./src/modules/queries/contact.routes.js" },
  { path: "/api/auth", module: "./src/modules/auth/auth.routes.js" },
  { path: "/api/roles", module: "./src/modules/rbac/role.routes.js" },
  { path: "/api/artwork", module: "./src/modules/artworks/artwork.routes.js" },
  { path: "/api/licenses", module: "./src/modules/licenses/license.routes.js" },
  { path: "/api/users", module: "./src/modules/users/user.routes.js" },
  { path: "/api/brands", module: "./src/modules/brands/brand.routes.js" },
  {
    path: "/api/collections",
    module: "./src/modules/collections/collection.route.js",
  },
  { path: "/api/search", module: "./src/modules/search/search.routes.js" },
  { path: "/api/payout", module: "./src/modules/licenses/payout.routes.js" },
  {
    path: "/api/notifications",
    module: "./src/modules/notifications/notification.routes.js",
  },
  { path: "/api/tasks", module: "./src/modules/tasks/task.routes.js" },
  { path: "/api/projects", module: "./src/modules/tasks/project.routes.js" },
  {path: "/api/media", module: "./src/modules/cdn/cdn.routes.js"},
  {path: "/api/admin", module: "./src/modules/admin/admin.routes.js"}
];

routes.forEach(({ path, module: mod }) => {
  try {
    app.use(path, require(mod));
    console.log(`✅ Route loaded: ${path}`);
  } catch (err) {
    console.error(`❌ Failed to load ${path}`);
    console.error(err);
  }
});

// ====================== ERROR HANDLER ======================
app.use(errorHandler);

// ====================== START SERVER ======================
const PORT = 5000;

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 SIGTERM received, shutting down gracefully");
  server.close(() => process.exit(0));
});
