import { useState } from 'react';
import paymentService from '../services/paymentService';
import toast from 'react-hot-toast';

export const usePayment = () => {
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);

  const createPayment = async (data) => {
    try {
      setLoading(true);
      const response = await paymentService.createPayment(data);
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Payment creation failed';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (paymentId, transactionId) => {
    try {
      setLoading(true);
      const response = await paymentService.verifyPayment(paymentId, transactionId);
      toast.success('Payment verified successfully!');
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Payment verification failed';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await paymentService.getHistory();
      setTransactions(response.data.transactions || response.data || []);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch transaction history';
      toast.error(message);
      return { transactions: [] };
    } finally {
      setLoading(false);
    }
  };

  const requestRefund = async (id, reason) => {
    try {
      setLoading(true);
      const response = await paymentService.requestRefund(id, reason);
      toast.success('Refund request submitted successfully!');
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Refund request failed';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    transactions,
    createPayment,
    verifyPayment,
    fetchHistory,
    requestRefund,
  };
};

