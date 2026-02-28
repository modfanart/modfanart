// src/middleware/requestLogger.js

const logger = (req, res, next) => {
  const start = Date.now();

  // Capture the original res.json / res.send so we can log status + response time
  const oldJson = res.json;
  const oldSend = res.send;

  let responseBody;
  let captured = false;

  // Monkey-patch res.json to capture what was sent
  res.json = function (body) {
    responseBody = body;
    captured = true;
    return oldJson.apply(res, arguments);
  };

  // Monkey-patch res.send too (some routes use send instead of json)
  res.send = function (body) {
    responseBody = body;
    captured = true;
    return oldSend.apply(res, arguments);
  };

  // Log when response finishes
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;

    const logEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      path: req.path,
      query: req.query,
      ip: req.ip || req.headers['x-forwarded-for'] || 'unknown',
      userAgent: req.get('user-agent') || 'unknown',
      statusCode: status,
      responseTimeMs: duration,
      // Optional: only log small bodies or skip large ones
      bodySize: req.body ? JSON.stringify(req.body).length : 0,
      // responseBody: captured && status < 400 ? responseBody : undefined, // ← comment in only in dev
    };

    // You can customize the output format
    console.log(
      `[${logEntry.timestamp}] ${logEntry.method} ${logEntry.url} → ${logEntry.statusCode} (${logEntry.responseTimeMs}ms)`
    );

    // More detailed logging (good for development)
    if (process.env.NODE_ENV !== 'production') {
      console.log('  Query:', logEntry.query);
      if (logEntry.bodySize > 0 && logEntry.bodySize < 2000) {
        console.log('  Body :', req.body);
      }
      console.log('  IP   :', logEntry.ip);
      console.log('  UA   :', logEntry.userAgent);
      // console.log('  Resp :', responseBody); // ← uncomment only when debugging
    }
  });

  next();
};

module.exports = logger;