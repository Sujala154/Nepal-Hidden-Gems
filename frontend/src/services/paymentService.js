import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

const paymentService = {
  createPayment: async (data) => {
    return api.post(API_ENDPOINTS.PAYMENTS.CREATE, data);
  },

  verifyPayment: async (paymentId, transactionId) => {
    return api.post(API_ENDPOINTS.PAYMENTS.VERIFY, {
      paymentId,
      transactionId,
    });
  },

  getHistory: async () => {
    return api.get(API_ENDPOINTS.PAYMENTS.HISTORY);
  },

  requestRefund: async (id, reason) => {
    return api.post(API_ENDPOINTS.PAYMENTS.REFUND(id), { reason });
  },
};

export default paymentService;

