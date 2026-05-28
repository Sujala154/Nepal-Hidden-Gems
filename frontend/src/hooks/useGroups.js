import { useState, useEffect } from 'react';
import groupService from '../services/groupService';
import toast from 'react-hot-toast';

export const useGroups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [messages, setMessages] = useState([]);

  const fetchGroups = async (params = {}) => {
    try {
      setLoading(true);
      const response = await groupService.getGroups(params);
      setGroups(response.data.groups || response.data || []);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch groups';
      toast.error(message);
      return { groups: [] };
    } finally {
      setLoading(false);
    }
  };

  const fetchGroup = async (id) => {
    try {
      setLoading(true);
      const response = await groupService.getGroup(id);
      setCurrentGroup(response.data);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch group';
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async (data) => {
    try {
      setLoading(true);
      const response = await groupService.createGroup(data);
      toast.success('Group created successfully!');
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create group';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const joinGroup = async (id) => {
    try {
      setLoading(true);
      const response = await groupService.joinGroup(id);
      toast.success('Joined group successfully!');
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to join group';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const leaveGroup = async (id) => {
    try {
      setLoading(true);
      await groupService.leaveGroup(id);
      setGroups(groups.filter((g) => g._id !== id));
      toast.success('Left group successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to leave group';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (id) => {
    try {
      const response = await groupService.getMessages(id);
      setMessages(response.data.messages || response.data || []);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      return { messages: [] };
    }
  };

  const sendMessage = async (id, message) => {
    try {
      const response = await groupService.sendMessage(id, message);
      setMessages((prev) => [...prev, response.data.message]);
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send message';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const getMyGroups = async () => {
    try {
      setLoading(true);
      const response = await groupService.getMyGroups();
      setGroups(response.data.groups || response.data || []);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch your groups';
      toast.error(message);
      return { groups: [] };
    } finally {
      setLoading(false);
    }
  };

  return {
    groups,
    currentGroup,
    messages,
    loading,
    fetchGroups,
    fetchGroup,
    createGroup,
    joinGroup,
    leaveGroup,
    fetchMessages,
    sendMessage,
    getMyGroups,
  };
};

