// backend/src/utils/logger.js
// Simple logger – copy/adapt your original

const levels = { info: 'INFO', warn: 'WARN', error: 'ERROR', debug: 'DEBUG' };

function log(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  console[level.toLowerCase() === 'error' ? 'error' : 'log'](
    `[${timestamp}] [${levels[level]}] ${message}`,
    meta
  );
}

module.exports = {
  info: (msg, meta) => log('info', msg, meta),
  warn: (msg, meta) => log('warn', msg, meta),
  error: (msg, meta) => log('error', msg, meta),
  debug: (msg, meta) => log('debug', msg, meta),
};
