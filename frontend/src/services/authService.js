import api from './api';

// ─────────────────────────────────────────────────────────────────────────────
// AUTH SERVICE
// Uses sessionStorage so each browser tab has its own isolated session.
// Logging in as User A in Tab 1 and User B in Tab 2 will NOT cross-contaminate.
// ─────────────────────────────────────────────────────────────────────────────

export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.token) {
      sessionStorage.setItem('token', response.token);
      sessionStorage.setItem('user', JSON.stringify(response.user));
    }
    return response;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.token) {
      sessionStorage.setItem('token', response.token);
      sessionStorage.setItem('user', JSON.stringify(response.user));
    }
    return response;
  },

  logout: () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = sessionStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return sessionStorage.getItem('token') !== null;
  },
};