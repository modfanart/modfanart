export const API_BASE_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8080/api'
    : 'https://modfanart-9x6b.onrender.com/api';
