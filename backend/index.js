// index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const rateLimit = require('express-rate-limit');

const attachDb = require('./src/middleware/attachDb');
const requestLogger = require('./src/middleware/requestLogger');
const errorHandler = require('./src/middleware/error');

dotenv.config();

const app = express();

// ====================== GLOBAL ERROR HANDLERS ======================
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err.message);
  console.error(err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
  console.error(reason?.stack || reason);
});

// Keep process alive even if async tasks finish
const keepAlive = setInterval(() => {}, 60 * 60 * 1000); // 1 hour

// ====================== RATE LIMITER ======================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    status: 429,
    message: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// ====================== CORS ======================
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  })
);

// ====================== MIDDLEWARE ======================
app.use(express.json());
app.use(requestLogger);
app.use(attachDb);

// ====================== STATIC ======================
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ====================== HEALTH ======================
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// ====================== ROUTES ======================
const routes = [
  { path: '/api/tags', module: './src/routes/tagging.routes' },
  { path: '/api/contest', module: './src/routes/contest.routes' },
  { path: '/api/order', module: './src/routes/order.routes' },
  { path: '/api/category', module: './src/routes/category.routes' },
  { path: '/api/contact', module: './src/routes/contact.routes' },
  { path: '/api/auth', module: './src/routes/auth.routes' },
  { path: '/api/roles', module: './src/routes/role.routes' },
  { path: '/api/artwork', module: './src/routes/artwork.routes' },
  { path: '/api/licenses', module: './src/routes/license.routes' },
  { path: '/api/users', module: './src/routes/user.routes' },
  { path: '/api/brands', module: './src/routes/brand.routes' },
  { path: '/api/collections', module: './src/routes/collection.route' },
  { path: '/api/search', module: './src/routes/search.routes' },
  { path: '/api/payout', module: './src/routes/payout.routes' },
  { path: '/api/webhook', module: './src/routes/webhooks' },
  { path: '/api/notifications', module: './src/routes/notification.routes' },
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
const PORT = process.env.PORT || 8080;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => process.exit(0));
});
