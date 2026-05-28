import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { FaMapMarkerAlt, FaArrowRight, FaSearch } from 'react-icons/fa';

const TravelerDashboard = () => {
  const navigate = useNavigate();
  // Get search term from the Layout
  const { searchTerm = '' } = useOutletContext() || {};

  const [loading, setLoading] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState('');

  const [allDestinations, setAllDestinations] = useState([]);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/destinations');
        const data = await response.json();
        const destinations = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
        setAllDestinations(destinations);
      } catch (error) {
        console.error('Error fetching destinations:', error);
        setAllDestinations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, []);


  const filteredDestinations = Array.isArray(allDestinations)
    ? allDestinations.filter(opt => {
        const searchQuery = localSearchTerm || searchTerm;
        return (
          (opt.name || '')
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (opt.tagline || '')
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (opt.location || '')
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        );
      })
    : [];

  return (
    <div className="w-full px-4 pt-4">
      {/* Section Header */}
      <div className="mb-4">
        <h2 className="text-2xl font-black text-[#0b1f3a] uppercase tracking-tighter">Hidden Gems</h2>
      </div>

      {/* Search Bar */}
      <div className="mb-4 px-0">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by destination name, tagline, or location..."
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
              className="w-full px-4 py-2.5 pl-10 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-transparent transition-all bg-white shadow-sm font-bold text-sm text-slate-700"
            />
            <FaSearch className="absolute left-3.5 top-3.5 text-slate-400 text-xs" />
          </div>
          <button
            onClick={() => setLocalSearchTerm('')}
            className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all border border-slate-200"
          >
            Clear
          </button>
          <button
            onClick={() => setLocalSearchTerm('')}
            className="px-6 py-2.5 bg-[#0b1f3a] text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-amber-600 transition-all shadow-lg shadow-slate-900/10 active:scale-95"
          >
            Continue Searching
          </button>
        </div>
        {localSearchTerm && (
          <div className="mt-2 text-sm text-slate-500">
            Found <span className="font-bold text-amber-600">{filteredDestinations.length}</span> result{filteredDestinations.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Grid */}
      {filteredDestinations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDestinations.map((destination) => (
            <div
              key={destination.slug}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:border-amber-200 transition-all duration-300 group cursor-pointer"
              onClick={() => navigate(`/destinations/${destination.slug || destination._id}`)}
            >
              {/* Image */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={destination.image?.startsWith('http') ? destination.image : `http://localhost:5000${destination.image}`}
                  alt={destination.name}
                  onError={(e) => { e.target.src = 'https://placehold.co/800x600?text=No+Image'; }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-xl font-black text-white mb-1">{destination.name}</h3>
                  <div className="flex items-center gap-1.5 text-slate-200 text-xs font-medium">
                    <FaMapMarkerAlt className="w-3 h-3 text-amber-400" />
                    {destination.location}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <p className="text-amber-600 font-black text-[10px] uppercase tracking-widest mb-1.5">
                  Featured
                </p>
                <p className="text-slate-500 text-xs mb-4 line-clamp-2 leading-relaxed font-medium">
                  {destination.description}
                </p>

                <button className="w-full py-2 bg-slate-50 text-slate-700 border border-slate-100 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-[#0b1f3a] hover:text-white transition-all flex items-center justify-center gap-2 active:scale-95">
                  Explore Guide <FaArrowRight className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
          <div className="text-slate-300 text-6xl mb-4">?</div>
          <h3 className="text-lg font-bold text-slate-700">No destinations found</h3>
          <p className="text-slate-500">Try searching for something else.</p>
        </div>
      )}
    </div>
  );
};

export default TravelerDashboard;
