const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const rateLimit = require('express-rate-limit');

const attachDb = require('./src/middleware/attachDb');
const requestLogger = require('./src/middleware/requestLogger');

dotenv.config();

const app = express();

/* ---------------- RATE LIMITER ---------------- */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100, // limit each IP
  message: {
    status: 429,
    message: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/* Apply globally */
app.use(limiter);

/* ---------------- CORS ---------------- */
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);

/* ---------------- MIDDLEWARE ---------------- */
app.use(express.json());
app.use(requestLogger);
app.use(attachDb);

/* ---------------- STATIC (index.html) ---------------- */
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/* ---------------- HEALTH ---------------- */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: Date.now(),
    env: process.env.NODE_ENV || 'dev',
  });
});

/* ---------------- ROUTES ---------------- */
app.use('/api/tags', require('./src/routes/tagging.routes'));
app.use('/api/contest', require('./src/routes/contest.routes'));
app.use('/api/order', require('./src/routes/order.routes'));
app.use('/api/category', require('./src/routes/category.routes'));
app.use('/api/contact', require('./src/routes/contact.routes'));
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/roles', require('./src/routes/role.routes'));
app.use('/api/artwork', require('./src/routes/artwork.routes'));
app.use('/api/licenses', require('./src/routes/license.routes'));
app.use('/api/users', require('./src/routes/user.routes'));
app.use('/api/brands', require('./src/routes/brand.routes'));
app.use('/api/collections', require('./src/routes/collection.route'));
app.use('/api/search', require('./src/routes/search.routes'));
app.use('/api/payout', require('./src/routes/payout.routes'));
app.use('/api/webhook', require('./src/routes/webhooks'));
app.use('/api/notifications', require('./src/routes/notification.routes'));

/* ---------------- ERROR HANDLER ---------------- */
const errorHandler = require('./src/middleware/error');
app.use(errorHandler);

/* ---------------- SERVER ---------------- */
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
