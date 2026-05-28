import { useState } from 'react';
import adminService from '../services/adminService';
import toast from 'react-hot-toast';

export const useAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [stats, setStats] = useState(null);

  const fetchUsers = async (params = {}) => {
    try {
      setLoading(true);
      const response = await adminService.getUsers(params);
      setUsers(response.data.users || response.data || []);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch users';
      toast.error(message);
      return { users: [] };
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (id, data) => {
    try {
      setLoading(true);
      const response = await adminService.updateUser(id, data);
      setUsers(users.map((u) => (u._id === id ? response.data : u)));
      toast.success('User updated successfully!');
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update user';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    try {
      setLoading(true);
      await adminService.deleteUser(id);
      setUsers(users.filter((u) => u._id !== id));
      toast.success('User deleted successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete user';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const fetchDestinations = async (params = {}) => {
    try {
      setLoading(true);
      const response = await adminService.getDestinations(params);
      setDestinations(response.data.destinations || response.data || []);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch destinations';
      toast.error(message);
      return { destinations: [] };
    } finally {
      setLoading(false);
    }
  };

  const approveDestination = async (id) => {
    try {
      setLoading(true);
      const response = await adminService.approveDestination(id);
      setDestinations(
        destinations.map((d) => (d._id === id ? { ...d, status: 'approved' } : d))
      );
      toast.success('Destination approved successfully!');
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to approve destination';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const rejectDestination = async (id, reason) => {
    try {
      setLoading(true);
      const response = await adminService.rejectDestination(id, reason);
      setDestinations(
        destinations.map((d) => (d._id === id ? { ...d, status: 'rejected' } : d))
      );
      toast.success('Destination rejected');
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to reject destination';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const deleteDestination = async (id) => {
    try {
      setLoading(true);
      await adminService.deleteDestination(id);
      setDestinations(destinations.filter((d) => d._id !== id));
      toast.success('Destination deleted successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete destination';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAnalytics();
      setAnalytics(response.data);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch analytics';
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await adminService.getStats();
      setStats(response.data);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch stats';
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    users,
    destinations,
    analytics,
    stats,
    fetchUsers,
    updateUser,
    deleteUser,
    fetchDestinations,
    approveDestination,
    rejectDestination,
    deleteDestination,
    fetchAnalytics,
    fetchStats,
  };
};

