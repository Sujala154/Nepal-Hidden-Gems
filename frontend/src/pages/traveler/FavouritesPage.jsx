/**
 * FavouritesPage.jsx
 *
 * Displays the traveler's saved (favourited) destinations in a responsive grid.
 * Receives a `searchTerm` from TravelerLayout's Outlet context and filters
 * the list client-side — no extra network call needed.
 *
 * Removing a favourite calls the shared toggle endpoint, which handles
 * both adding and removing server-side.
 */
import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { FaHeart, FaMapMarkerAlt, FaStar, FaTrash } from 'react-icons/fa';
import api from '../../services/api';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import toast from 'react-hot-toast';

const FavouritesPage = () => {
  const navigate = useNavigate();
  const { searchTerm = '' } = useOutletContext() || {};

  // ── State ──────────────────────────────────────────────────────────────────
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [targetDest, setTargetDest] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Data Fetching ──────────────────────────────────────────────────────────
  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await api.get('/favorites');
      if (response.success) {
        setFavorites(response.data);
      }
    } catch (err) {
      setError('Failed to load your favorites');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  // ── Actions ────────────────────────────────────────────────────────────────

  const handleRemoveClick = (e, destination) => {
    // stopPropagation prevents the card's onClick (navigate) from firing
    e.stopPropagation();
    setTargetDest(destination);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!targetDest || isDeleting) return;

    try {
      setIsDeleting(true);
      const response = await api.post(`/favorites/toggle/${targetDest._id}`);
      if (response.success) {
        // Optimistically remove from local state instead of re-fetching
        setFavorites((prev) => prev.filter((f) => f._id !== targetDest._id));
        toast.success('Removed from favourites', {
          icon: '🗑️',
          style: { borderRadius: '10px', background: '#333', color: '#fff', fontSize: '12px' },
        });
        setShowDeleteModal(false);
      }
    } catch (err) {
      toast.error('Failed to remove from favourites');
    } finally {
      setIsDeleting(false);
      setTargetDest(null);
    }
  };

  // ── Loading State ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  // Client-side filter — runs after data is loaded, on every searchTerm change
  const term = searchTerm.toLowerCase();
  const displayedFavorites = favorites.filter(
    (d) => !term || d.name?.toLowerCase().includes(term) || d.location?.toLowerCase().includes(term),
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-xl font-black text-[#0b1f3a] uppercase tracking-tighter">My Favourites</h2>
        <FaHeart className="text-red-500 w-5 h-5 animate-pulse" />
      </div>

      {displayedFavorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayedFavorites.map((destination) => {
            const { _id, name, image, location, rating, tagline, description, slug } = destination;
            return (
              <div
                key={_id}
                className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:border-amber-200 transition-all duration-300 group cursor-pointer flex flex-col h-full"
                onClick={() => navigate(`/destinations/${slug}`)}
              >
                {/* Image hero */}
                <div className="relative h-48 overflow-hidden shrink-0">
                  <img
                    src={image || 'https://placehold.co/400x300?text=No+Image'}
                    alt={name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-xl font-black text-white mb-1">{name}</h3>
                    <div className="flex items-center gap-1.5 text-slate-200 text-xs font-medium">
                      <FaMapMarkerAlt className="w-3 h-3 text-amber-400" />
                      {location}
                    </div>
                  </div>

                  {/* Remove button — stopPropagation prevents card navigation */}
                  <button
                    onClick={(e) => handleRemoveClick(e, destination)}
                    className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-all duration-300 shadow-lg group/remove"
                    title="Remove from favorites"
                  >
                    <FaTrash className="w-4 h-4 group-hover/remove:scale-110 transition-transform" />
                  </button>
                </div>

                {/* Card body */}
                <div className="p-4 flex flex-col flex-grow">
                  {rating > 0 && (
                    <div className="flex items-center gap-1 text-amber-500 text-sm mb-2">
                      <FaStar />
                      <span className="font-bold">{rating.toFixed(1)}</span>
                    </div>
                  )}
                  <p className="text-slate-600 text-sm mb-4 line-clamp-2 leading-relaxed flex-grow">
                    {tagline || description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── Empty state — distinguishes between "no results" and "no favourites" */
        <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-2xl border border-dashed border-slate-200 min-h-[400px]">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <FaHeart className="w-10 h-10 text-red-500 opacity-50" />
          </div>
          {favorites.length > 0 && searchTerm ? (
            <>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">No matches found</h2>
              <p className="text-slate-500 max-w-sm">Try a different destination name or location.</p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Your wishlist is empty</h2>
              <p className="text-slate-500 max-w-sm mb-8">
                You haven't saved any hidden gems yet. Start exploring to build your dream itinerary!
              </p>
              <button
                onClick={() => navigate('/destinations')}
                className="px-8 py-3 bg-[#0b1f3a] text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-900/10 hover:bg-amber-600 transition-all transform hover:-translate-y-0.5"
              >
                Start Exploring
              </button>
            </>
          )}
        </div>
      )}

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Remove Gem?"
        message={`Are you sure you want to remove ${targetDest?.name} from your favourites? This action cannot be undone.`}
        confirmText={isDeleting ? 'Removing...' : 'Remove'}
        cancelText="Keep it"
        type="danger"
      />
    </div>
  );
};

export default FavouritesPage;
