// API base URL.
//
// Was `process.env.NODE_ENV === 'development' ? localhost : prod`. In Vite,
// `process` doesn't exist at runtime and the .env file's VITE_API_BASE_URL was
// ignored, so the workspace couldn't be pointed at staging. Vite exposes
// VITE_* variables on import.meta.env.
const fromEnv = import.meta.env?.VITE_API_BASE_URL;

export const API_BASE_URL = (
  fromEnv ||
  (import.meta.env?.DEV ? 'http://localhost:5000/api' : 'https://api.modfanofficial.com/api')
).replace(/\/$/, '');
