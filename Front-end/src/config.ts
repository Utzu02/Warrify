// Central place for runtime configuration that can be reused across the app.
export const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:8080';

console.log('BASE_URL configured:', BASE_URL);
