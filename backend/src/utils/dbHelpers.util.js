// src/utils/dbHelpers.util.js

function escapeLike(value) {
  if (!value) return '';
  return value.replace(/[\\%_]/g, '\\$&');
}

function toTsQueryPrefix(text) {
  if (!text?.trim()) return '';
  return text
    .trim()
    .split(/\s+/)
    .filter(w => w.length > 0)
    .map(word => `${word}:*`)
    .join(' & ') || '';
}

module.exports = {
  escapeLike,
  toTsQueryPrefix,
};