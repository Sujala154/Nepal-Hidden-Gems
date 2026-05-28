import { createContext, useContext, useState } from 'react';
import destinationService from '../services/destinationService';
import toast from 'react-hot-toast';

const DestinationContext = createContext(null);

export const DestinationProvider = ({ children }) => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // Added error state
  const [pagination, setPagination] = useState({ // Added pagination state
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 12
  });
  const [filters, setFilters] = useState({
    search: '',
    activityType: '',
    difficulty: '',
    season: '',
    location: '',
  });

  const fetchDestinations = async (params = {}) => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      const response = await destinationService.getDestinations({ ...filters, ...params });
      
      // Update destinations
      const destArray = response.data.destinations || response.data || [];
      setDestinations(destArray);
      
      // Update pagination if backend provides it
      if (response.data.pagination) {
        setPagination(response.data.pagination);
      } else if (response.data.total !== undefined) {
        // Calculate pagination from total count
        setPagination(prev => ({
          ...prev,
          total: response.data.total || destArray.length,
          totalPages: Math.ceil((response.data.total || destArray.length) / prev.limit)
        }));
      }
      
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch destinations';
      setError(message); // Set error state
      toast.error(message);
      return { destinations: [], total: 0 };
    } finally {
      setLoading(false);
    }
  };

  // Added: Filter destinations function
  const filterDestinations = async (filterParams) => {
    return fetchDestinations(filterParams);
  };

  const getDestination = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await destinationService.getDestination(id);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch destination';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createDestination = async (data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await destinationService.createDestination(data);
      toast.success('Destination created successfully!');
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create destination';
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const updateDestination = async (id, data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await destinationService.updateDestination(id, data);
      toast.success('Destination updated successfully!');
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update destination';
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const deleteDestination = async (id) => {
    try {
      setLoading(true);
      setError(null);
      await destinationService.deleteDestination(id);
      setDestinations(destinations.filter((d) => d._id !== id));
      toast.success('Destination deleted successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete destination';
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const searchDestinations = async (query) => {
    try {
      setLoading(true);
      setError(null);
      const response = await destinationService.searchDestinations(query);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Search failed';
      setError(message);
      toast.error(message);
      return { destinations: [] };
    } finally {
      setLoading(false);
    }
  };

  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      activityType: '',
      difficulty: '',
      season: '',
      location: '',
    });
  };

  // Clear error function
  const clearError = () => {
    setError(null);
  };

  const value = {
    destinations,
    loading,
    error,           // Added
    pagination,      // Added
    filters,
    fetchDestinations,
    filterDestinations, // Added
    getDestination,
    createDestination,
    updateDestination,
    deleteDestination,
    searchDestinations,
    updateFilters,
    clearFilters,
    clearError,      // Added
  };

  return (
    <DestinationContext.Provider value={value}>
      {children}
    </DestinationContext.Provider>
  );
};

export const useDestinations = () => {
  const context = useContext(DestinationContext);
  if (!context) {
    throw new Error('useDestinations must be used within a DestinationProvider');
  }
  return context;
};

export default DestinationContext;