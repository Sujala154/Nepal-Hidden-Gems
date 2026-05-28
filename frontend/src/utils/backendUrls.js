export const API_URL = import.meta.env.VITE_API_URL || '/api';

const rawBackendUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '');
const fallbackBackend = typeof window !== 'undefined' ? window.location.origin : '';

export const BACKEND_BASE_URL = rawBackendUrl || fallbackBackend;
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || BACKEND_BASE_URL;

export const buildApiUrl = (path) => {
  if (!path) return API_URL;
  return `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;
};

export const buildBackendUrl = (path) => {
  if (!path) return '';
  if (/^https?:\/\//.test(path)) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${BACKEND_BASE_URL}${normalized}`;
};
