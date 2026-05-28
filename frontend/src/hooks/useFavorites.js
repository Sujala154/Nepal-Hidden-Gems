import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const useFavorites = () => {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchFavorites = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/favorites');
            if (response.success) {
                setFavorites(response.data.map(f => f._id || f)); // Store as IDs for easy checking
            }
        } catch (err) {
            console.error('Error fetching favorites:', err);
            setError('Failed to load favorites');
        } finally {
            setLoading(false);
        }
    }, []);

    const toggleFavorite = async (destinationId) => {
        try {
            const response = await api.post(`/favorites/toggle/${destinationId}`);
            if (response.success) {
                if (response.isFavorite) {
                    setFavorites(prev => [...prev, destinationId]);
                } else {
                    setFavorites(prev => prev.filter(id => id !== destinationId));
                }
                return { success: true, isFavorite: response.isFavorite };
            }
        } catch (err) {
            console.error('Error toggling favorite:', err);
            return { success: false, error: err.message };
        }
    };

    const isFavorite = (destinationId) => {
        return favorites.some(id => id.toString() === destinationId?.toString());
    };

    useEffect(() => {
        const token = sessionStorage.getItem('token');
        if (token) {
            fetchFavorites();
        }
    }, [fetchFavorites]);

    return {
        favorites,
        loading,
        error,
        toggleFavorite,
        isFavorite,
        refreshFavorites: fetchFavorites
    };
};
