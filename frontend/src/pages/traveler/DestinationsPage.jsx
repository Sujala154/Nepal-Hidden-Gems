import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { FaMapMarkerAlt, FaStar, FaHeart, FaRegHeart } from 'react-icons/fa';
import api from '../../services/api';
import { useFavorites } from '../../hooks/useFavorites';
import { getImageUrl } from '../../utils/imageUtils';

const DestinationsPage = () => {
    const navigate = useNavigate();
    const { searchTerm = '' } = useOutletContext() || {};
    const { isFavorite, toggleFavorite } = useFavorites();

    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDestinations = async () => {
            try {
                setLoading(true);
                const response = await api.get('/destinations');
                const data = response.data || response;
                const destList = Array.isArray(data) ? data : (data.data || []);
                setDestinations(destList);
            } catch (err) {
                console.error('Error fetching destinations:', err);
                setError('An error occurred while loading destinations');
            } finally {
                setLoading(false);
            }
        };

        fetchDestinations();
    }, []);

    const filteredDestinations = (destinations || []).filter(dest => {
        const name = dest.name || '';
        const tagline = dest.tagline || '';
        const location = dest.location || '';
        const search = (searchTerm || '').toLowerCase();

        return name.toLowerCase().includes(search) ||
            tagline.toLowerCase().includes(search) ||
            location.toLowerCase().includes(search);
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-500">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-slate-100 rounded-lg hover:bg-slate-200"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            {filteredDestinations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredDestinations.map((destination) => (
                        <div
                            key={destination._id}
                            className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:border-amber-200 transition-all duration-300 group cursor-pointer flex flex-col h-full"
                            onClick={() => navigate(`/destinations/${destination.slug || destination._id}`)}
                        >
                            <div className="relative h-48 overflow-hidden shrink-0">
                                <img
                                    src={getImageUrl(destination.image)}
                                    alt={destination.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    onError={(e) => { e.target.src = 'https://placehold.co/400x300?text=No+Image'; }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute bottom-4 left-4 right-4 text-white">
                                    <h3 className="text-xl font-black text-white mb-1 leading-tight">{destination.name}</h3>
                                    <div className="flex items-center gap-1.5 text-slate-200 text-[10px] font-bold uppercase tracking-wider">
                                        <FaMapMarkerAlt className="text-amber-400" />
                                        {destination.location}
                                    </div>
                                </div>

                                <div className="absolute top-4 right-4 z-30">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleFavorite(destination._id);
                                        }}
                                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                                            isFavorite(destination._id) 
                                                ? 'bg-white text-red-500' 
                                                : 'bg-white/20 text-white hover:bg-white hover:text-red-500 backdrop-blur-md'
                                        }`}
                                    >
                                        {isFavorite(destination._id) ? <FaHeart className="w-4 h-4" /> : <FaRegHeart className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="p-4 flex flex-col flex-grow">
                                {destination.rating > 0 && (
                                    <div className="flex items-center gap-1 text-amber-500 text-xs font-black mb-2 uppercase tracking-widest">
                                        <FaStar className="animate-pulse" /> {destination.rating.toFixed(1)}
                                    </div>
                                )}
                                <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed flex-grow">
                                    {destination.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                    <h3 className="text-lg font-bold text-slate-700">No destinations found</h3>
                    <p className="text-slate-500 text-sm">Try adjusting your search terms.</p>
                </div>
            )}
        </div>
    );
};

export default DestinationsPage;
