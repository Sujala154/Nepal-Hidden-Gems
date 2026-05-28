import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

const adminService = {
  getUsers: async (params = {}) => {
    return api.get(API_ENDPOINTS.ADMIN.USERS, { params });
  },

  updateUser: async (id, data) => {
    return api.put(`${API_ENDPOINTS.ADMIN.USERS}/${id}`, data);
  },

  deleteUser: async (id) => {
    return api.delete(`${API_ENDPOINTS.ADMIN.USERS}/${id}`);
  },

  getDestinations: async (params = {}) => {
    return api.get(API_ENDPOINTS.ADMIN.DESTINATIONS, { params });
  },

  approveDestination: async (id) => {
    return api.post(`${API_ENDPOINTS.ADMIN.DESTINATIONS}/${id}/approve`);
  },

  rejectDestination: async (id, reason) => {
    return api.post(`${API_ENDPOINTS.ADMIN.DESTINATIONS}/${id}/reject`, { reason });
  },

  deleteDestination: async (id) => {
    return api.delete(`${API_ENDPOINTS.ADMIN.DESTINATIONS}/${id}`);
  },

  getAnalytics: async () => {
    return api.get(API_ENDPOINTS.ADMIN.ANALYTICS);
  },

  getStats: async () => {
    return api.get(API_ENDPOINTS.ADMIN.STATS);
  },
};

export default adminService;

