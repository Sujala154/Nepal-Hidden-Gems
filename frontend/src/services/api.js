/**
 * api.js
 *
 * A customized Axios instance that serves as the central networking layer.
 * Includes automated request interceptors for JWT injection and response
 * interceptors for session-expiry detection (401) and error normalization.
 *
 * This ensures that the rest of the application can handle API responses
 * and errors in a consistent format.
 */
import axios from 'axios';
import { API_URL } from '../utils/backendUrls';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * Automatically attaches the JWT token from sessionStorage to every outgoing request.
 */
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/**
 * Response Interceptor
 * Normalizes the response data and handles global error cases like unauthorized access.
 */
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const { response } = error;

    // Auto-logout: If the server returns 401, the token is likely expired or invalid.
    if (response?.status === 401) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');

      // Only redirect if we are not already on the landing page to avoid infinite loops.
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }

    // Extract the most descriptive error message possible from the backend response.
    const errorMessage =
      response?.data?.error ||
      response?.data?.message ||
      error.message ||
      'An unexpected error occurred.';

    return Promise.reject(errorMessage);
  },
);

export default api;