import React, { useEffect, useState } from 'react';
import { useOutletContext, Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaEdit, FaEye, FaSpinner, FaExclamationCircle, FaMapMarkerAlt, FaTimes, FaArrowRight, FaStar, FaExternalLinkAlt, FaPlus } from 'react-icons/fa';
import api from '../../services/api';
import DestinationForm from './DestinationForm';
import toast from 'react-hot-toast';

const MySubmissions = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const context = useOutletContext();
  const searchTerm = context?.searchTerm || '';
  const [error, setError] = useState('');
  const [editingDestination, setEditingDestination] = useState(null);
  const [editFormData, setEditFormData] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const navigate = useNavigate();

  const fetchDestinations = async () => {
    try {
      console.log('🔄 Fetching my destinations...');
      const response = await api.get('/destinations/user/my-destinations');
      console.log('✅ Response Body:', response);
      
      // Axios interceptor returns response.data
      // If backend returns { success: true, data: [...] }
      // then 'response' is that object.
      let destList = [];
      if (Array.isArray(response)) {
        destList = response;
      } else if (response && Array.isArray(response.data)) {
        destList = response.data;
      } else if (response && response.destinations && Array.isArray(response.destinations)) {
        destList = response.destinations;
      }
      
      console.log(`📊 Processing ${destList.length} destinations`);
      setDestinations(destList);
    } catch (err) {
      console.error('❌ Error fetching submissions:', err);
      setError('Failed to load your submissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDestinations();
  }, []);

  useEffect(() => {
    if (editingDestination) {
      setEditFormData({
        name: editingDestination.name || '',
        location: editingDestination.location || '',
        tagline: editingDestination.tagline || '',
        description: editingDestination.description || '',
        difficulty: editingDestination.difficulty || 'moderate',
        bestSeason: editingDestination.bestSeason || 'all',
        category: editingDestination.category || 'Nature',
        budgetLevel: editingDestination.budgetLevel || 'Mid-Range',
        specialty: editingDestination.specialty || '',
        hospitality: editingDestination.hospitality || '',
        accommodation: editingDestination.accommodation || '',
        tips: editingDestination.tips || '',
        image: editingDestination.image || null,
        images: editingDestination.multiple_images || editingDestination.images || [],
      });
    } else {
      setEditFormData(null);
    }
  }, [editingDestination]);

  const handleUpdate = async (submitData) => {
    setIsUpdating(true);
    try {
      const response = await api.put(`/destinations/${editingDestination._id}`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.success || response._id) {
        const updated = response.data || response;
        setDestinations(prev => prev.map(d => d._id === editingDestination._id ? updated : d));
        setEditingDestination(null);
        toast.success('Changes saved successfully!');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to update destination');
    } finally {
      setIsUpdating(false);
    }
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [destinationToDelete, setDestinationToDelete] = useState(null);

  const confirmDelete = (id) => {
    setDestinationToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!destinationToDelete) return;
    try {
      await api.delete(`/destinations/${destinationToDelete}`);
      setDestinations(prev => prev.filter(d => d._id !== destinationToDelete));
      toast.success('Destination deleted successfully!');
      setShowDeleteModal(false);
      setDestinationToDelete(null);
    } catch (err) {
      toast.error('Failed to delete destination');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <FaSpinner className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 text-red-600 bg-red-50 rounded-2xl">
        <FaExclamationCircle className="w-8 h-8 mx-auto mb-2" />
        <p>{error}</p>
      </div>
    );
  }

  const filteredDestinations = destinations.filter(dest => {
    const name = dest.name || '';
    const location = dest.location || '';
    const term = searchTerm.toLowerCase();
    return name.toLowerCase().includes(term) || location.toLowerCase().includes(term);
  });

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-black text-[#0b1f3a] uppercase tracking-tighter leading-none">Manage and track your submissions</h2>
        <button
          onClick={() => navigate('/contributor/upload')}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0b1f3a] text-white rounded-lg font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-900/10 hover:bg-amber-600 hover:-translate-y-0.5 transition-all active:scale-95"
        >
          <FaPlus className="w-3 h-3" /> Add New
        </button>
      </div>

      {filteredDestinations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredDestinations.map((dest) => {
            const isApproved = dest.status === 'approved' || dest.approved;
            const isRejected = dest.status === 'rejected';
            return (
            <div
              key={dest._id}
              className="bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-xl hover:border-amber-200 transition-all duration-300 group flex flex-col h-full"
            >
              {/* Image & Header Overlay */}
              <div className="relative h-44 overflow-hidden shrink-0">
                <img
                  src={dest.image?.startsWith('http') ? dest.image : (dest.image ? `http://localhost:5000${dest.image}` : 'https://placehold.co/400x300?text=No+Image')}
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => { e.target.src = 'https://placehold.co/400x300?text=No+Image'; }}
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Status Badge */}
                <div className="absolute top-3 left-3 z-10">
                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider shadow-lg backdrop-blur-md border border-white/20
                    ${dest.status === 'rejected'
                      ? 'bg-red-500/90 text-white'
                      : (dest.status === 'approved' || dest.approved)
                        ? 'bg-green-500/90 text-white'
                        : 'bg-amber-500/90 text-white'}`}
                  >
                    {dest.status === 'rejected' 
                      ? 'Declined' 
                      : (dest.status === 'approved' || dest.approved) 
                        ? 'Live' 
                        : 'Pending'}
                  </span>
                </div>

                {/* Title & Location Overlay (Bottom) */}
                <div className="absolute bottom-3 left-3 right-3 text-white z-10">
                  <h3 className="text-lg font-black text-white mb-0.5 line-clamp-1">{dest.name}</h3>
                  <div className="flex items-center gap-1.5 text-slate-200 text-[10px] font-bold">
                    <FaMapMarkerAlt className="w-2.5 h-2.5 text-amber-400" />
                    {dest.location}
                  </div>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2.5">
                    <p className="text-amber-600 font-black text-[9px] uppercase tracking-widest bg-amber-50 px-2 py-0.5 rounded-md">
                        {dest.category || 'Hidden Gem'}
                    </p>
                    {dest.rating > 0 && (
                        <div className="flex items-center gap-1 text-amber-500 text-[10px] font-black">
                            <FaStar className="w-2.5 h-2.5" /> {dest.rating.toFixed(1)}
                        </div>
                    )}
                </div>

                {/* Rejection Feedback - Prominent if exists */}
                {dest.status === 'rejected' && (dest.rejectionReason || dest.rejectionTitle) && (
                  <div className="mb-3 p-3 bg-red-50 border border-red-100 rounded-xl relative overflow-hidden group/feedback">
                    <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
                    <div className="flex items-center gap-2 mb-1">
                       <FaExclamationCircle className="text-red-500 text-[9px]" />
                       <p className="text-[9px] font-black uppercase tracking-[0.1em] text-red-500">
                         {dest.rejectionTitle ? `Issue: ${dest.rejectionTitle}` : 'Feedback'}
                       </p>
                    </div>
                    <p className="text-[10px] text-slate-600 font-bold leading-relaxed italic pr-2">"{dest.rejectionReason || 'Review submission.'}"</p>
                  </div>
                )}

                <p className="text-slate-500 text-[11px] mb-4 line-clamp-2 leading-relaxed font-medium">
                  {dest.description || dest.tagline}
                </p>

                {/* Action Buttons */}
                <div className="mt-auto flex gap-2">
                  {/* View Live — only for approved */}
                  {isApproved && (dest.slug || dest._id) && (
                    <button
                      onClick={() => navigate(`/contributor/destinations/${dest.slug || dest._id}`)}
                      className="w-10 h-10 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl flex items-center justify-center hover:bg-emerald-100 transition-all active:scale-95 shrink-0"
                      title="View Live Page"
                    >
                      <FaExternalLinkAlt className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={() => setEditingDestination(dest)}
                    className={`flex-1 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95
                      ${isRejected
                        ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/20'
                        : 'bg-slate-900 text-white hover:bg-black'}`}
                  >
                    {isRejected ? 'Fix' : 'Edit'} <FaEdit className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => confirmDelete(dest._id)}
                    className="w-10 h-10 bg-slate-50 text-slate-400 border border-slate-100 rounded-lg flex items-center justify-center hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all active:scale-95"
                    title="Delete Permanently"
                  >
                    <FaTrash className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl py-20 text-center border border-dashed border-slate-200">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaExclamationCircle className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No destinations found</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-xs mx-auto">
            {searchTerm ? `No results for "${searchTerm}". Try a different search.` : "You haven't shared any hidden gems yet. Start by adding a new one!"}
          </p>
          {!searchTerm && (
            <Link to="/contributor/upload" className="mt-6 inline-block px-8 py-3 bg-[#0b1f3a] text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-900/10 hover:bg-amber-600 hover:-translate-y-0.5 transition-all">
              Add New
            </Link>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {editingDestination && editFormData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl relative custom-scrollbar">
            <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black text-[#0b1f3a] uppercase tracking-tighter leading-none">Manage and track your submissions</h2>
              </div>
              <button
                onClick={() => setEditingDestination(null)}
                className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-6">
              <DestinationForm
                formData={editFormData}
                setFormData={setEditFormData}
                onSubmit={handleUpdate}
                loading={isUpdating}
                buttonText={editingDestination.status === 'rejected' ? 'Fix & Resubmit' : 'Save Changes'}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1f3a]/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-slate-100 text-center relative">


            <div className="px-6 pt-6 pb-4">
              <div className="w-14 h-14 bg-slate-50 text-[#0b1f3a] rounded-xl flex items-center justify-center mx-auto mb-4 text-xl">
                <FaTrash />
              </div>
              <h3 className="text-lg font-black text-[#0b1f3a] uppercase tracking-tight mb-1">Delete Destination?</h3>
              <p className="text-[11px] text-slate-500 leading-snug max-w-[240px] mx-auto font-medium">
                Are you sure you want to delete this destination? This action cannot be undone.
              </p>
            </div>

            <div className="p-4 bg-slate-50 flex gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 px-3 bg-white border border-slate-200 text-slate-400 rounded-lg font-black uppercase tracking-widest text-[9px] hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3 px-3 bg-[#0b1f3a] text-white rounded-lg font-black uppercase tracking-widest text-[9px] shadow-lg shadow-blue-900/10 hover:bg-[#1a3a5f] transition-all transform active:scale-95"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MySubmissions;
