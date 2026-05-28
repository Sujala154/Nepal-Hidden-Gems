import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

const groupService = {
  getGroups: async (params = {}) => {
    return api.get(API_ENDPOINTS.GROUPS.LIST, { params });
  },

  getGroup: async (id) => {
    return api.get(API_ENDPOINTS.GROUPS.GET(id));
  },

  createGroup: async (data) => {
    return api.post(API_ENDPOINTS.GROUPS.CREATE, data);
  },

  joinGroup: async (id) => {
    return api.post(API_ENDPOINTS.GROUPS.JOIN(id));
  },

  leaveGroup: async (id) => {
    return api.delete(API_ENDPOINTS.GROUPS.LEAVE(id));
  },

  getMessages: async (id) => {
    return api.get(API_ENDPOINTS.GROUPS.MESSAGES(id));
  },

  sendMessage: async (id, message) => {
    return api.post(API_ENDPOINTS.GROUPS.MESSAGES(id), { message });
  },

  getMyGroups: async () => {
    return api.get(API_ENDPOINTS.GROUPS.MY_GROUPS);
  },
  getAvailableGroups: async (guideId, date) => {
    return api.get(`${API_ENDPOINTS.GROUPS.LIST}/available?guideId=${guideId}&date=${date}`);
  },
};

export default groupService;

