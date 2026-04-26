// backend/src/cache.js
const cache = new Map();

function createCacheKey(prefix, params) {
  return `${prefix}:${JSON.stringify(params)}`;
}

function getOrSet(key, fetchFn, ttlMs) {
  if (cache.has(key)) {
    const entry = cache.get(key);
    if (Date.now() < entry.expiry) {
      return Promise.resolve(entry.value);
    }
  }

  return fetchFn().then((value) => {
    cache.set(key, {
      value,
      expiry: Date.now() + ttlMs,
    });
    return value;
  });
}

function deleteKey(key) {
  cache.delete(key);
}

module.exports = {
  dbCache: {
    getOrSet,
    delete: deleteKey,
  },
  createCacheKey,
};
