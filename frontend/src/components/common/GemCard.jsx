import React from 'react';
import { FaStar, FaMapMarkerAlt } from 'react-icons/fa';
import { buildBackendUrl } from '../../utils/backendUrls';

/**
 * GemCard - A reusable card component for displaying hidden gems across 
 * the Landing, Explore, and Profile pages.
 */
const GemCard = ({ gem }) => {
    const imageUrl = gem.image?.startsWith('http')
        ? gem.image
        : (gem.image ? buildBackendUrl(gem.image) : 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=900');

    return (
        <div className="relative overflow-hidden rounded-[2rem] aspect-[3/4] bg-slate-900 group shadow-2xl shadow-slate-200 cursor-pointer overflow-hidden">
            <img
                src={imageUrl}
                alt={gem.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />

            {/* Dynamic Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b1f3a] via-[#0b1f3a]/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

            <div className="absolute bottom-0 left-0 right-0 p-6 text-left transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                <div className="flex items-center gap-2 text-amber-500 text-[10px] font-black mb-2">
                    <FaStar /> {gem.rating || (4.5).toFixed(1)}
                    <span className="text-white/40 ml-1 uppercase tracking-widest">Verified</span>
                </div>

                <h3 className="text-xl font-black text-white uppercase tracking-tight mb-1 leading-tight group-hover:text-amber-400 transition-colors">
                    {gem.name}
                </h3>

                <div className="flex items-center gap-2 text-slate-300 text-[9px] font-bold uppercase tracking-widest">
                    <FaMapMarkerAlt className="text-amber-500" />
                    {gem.location}
                </div>
            </div>
        </div>
    );
};

export default GemCard;
