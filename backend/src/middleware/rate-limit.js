// backend/src/middleware/rate-limit.js
const rateLimitMap = new Map();

module.exports = function rateLimit(options = {}) {
  const { windowMs = 60_000, limit = 500 } = options;

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const key = `rate:${ip}`;
    const now = Date.now();

    let entry = rateLimitMap.get(key) || {
      count: 0,
      resetTime: now + windowMs,
    };

    // Reset if window expired
    if (now > entry.resetTime) {
      entry = { count: 0, resetTime: now + windowMs };
    }

    entry.count += 1;
    rateLimitMap.set(key, entry);

    if (entry.count > limit) {
      return res.status(429).json({
        success: false,
        error: 'Too Many Requests - Rate limit exceeded',
        retryAfter: Math.ceil((entry.resetTime - now) / 1000),
      });
    }

    res.set('X-RateLimit-Remaining', limit - entry.count);
    next();
  };
};
