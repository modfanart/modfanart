const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const attachDb = require('./src/middleware/attachDb');
dotenv.config();

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json());

app.use(attachDb);
// Routes

app.use("/api/tags", require("./src/routes/tagging.routes"))
app.use("/api/contest", require("./src/routes/contest.routes"))
app.use("/api/order", require("./src/routes/order.routes"))
app.use("/api/category", require("./src/routes/category.routes"))
app.use("/api/auth", require("./src/routes/auth.routes"))
app.use("/api/roles", require("./src/routes/role.routes"))
app.use("/api/artwork", require("./src/routes/artwork.routes"))
app.use('/api/licenses', require('./src/routes/license.routes'));
app.use('/api/users', require('./src/routes/user.routes'));
app.use('/api/brands', require("./src/routes/brand.routes"));
// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV || 'dev' });
});

// Global error handler (last)
const errorHandler = require('./src/middleware/error'); // adjust path
app.use(errorHandler);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});