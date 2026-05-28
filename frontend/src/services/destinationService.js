import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Utility to convert plan objects to FormData for multipart uploads
 */
const prepareFormData = (data) => {
  if (data instanceof FormData) return data;
  
  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    if (key === 'images' && Array.isArray(data[key])) {
      data[key].forEach((file) => formData.append('images', file));
    } else if (data[key] !== null && data[key] !== undefined) {
      formData.append(key, data[key]);
    }
  });
  return formData;
};

const destinationService = {
  getDestinations: (params = {}) => {
    return api.get(API_ENDPOINTS.DESTINATIONS.LIST, { params });
  },

  getDestination: (id) => {
    return api.get(API_ENDPOINTS.DESTINATIONS.GET(id));
  },

  createDestination: (data) => {
    const formData = prepareFormData(data);
    return api.post(API_ENDPOINTS.DESTINATIONS.CREATE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  updateDestination: (id, data) => {
    const formData = prepareFormData(data);
    return api.put(API_ENDPOINTS.DESTINATIONS.UPDATE(id), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deleteDestination: (id) => {
    return api.delete(API_ENDPOINTS.DESTINATIONS.DELETE(id));
  },

  searchDestinations: (query) => {
    return api.get(API_ENDPOINTS.DESTINATIONS.SEARCH, {
      params: { q: query },
    });
  },

  getMyDestinations: () => {
    return api.get(API_ENDPOINTS.DESTINATIONS.MY_DESTINATIONS);
  },

  approveDestination: (id) => {
    return api.post(API_ENDPOINTS.DESTINATIONS.APPROVE(id));
  },

  rejectDestination: (id, { reason, title }) => {
    // Expecting both title and reason for decline feedback
    return api.post(API_ENDPOINTS.DESTINATIONS.REJECT(id), { 
      rejectionReason: reason, 
      rejectionTitle: title 
    });
  },
};

export default destinationService;

