import React, { useState, useEffect } from 'react';
import { FaCalendarDay, FaUser, FaMapMarkerAlt, FaToggleOn, FaToggleOff, FaMapMarkedAlt, FaTrash, FaPlus, FaCheckCircle, FaClock, FaTag } from 'react-icons/fa';
import api from '../../services/api';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const GuideTours = () => {
  const [isAvailable, setIsAvailable] = useState(true);
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTourTarget, setDeleteTourTarget] = useState(null);

  // Fetch live tours
  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    try {
      const res = await api.get('/tours/my');
      if (res.success) {
        setTours(res.data);
      }
    } catch (error) {
      console.error('Error fetching tours:', error);
      toast.error('Failed to load your tours');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTour = (id) => {
    setDeleteTourTarget(id);
  };

  const confirmDeleteTour = async () => {
    const id = deleteTourTarget;
    setDeleteTourTarget(null);
    try {
      const res = await api.delete(`/tours/${id}`);
      if (res.success) {
        toast.success('Tour deleted');
        setTours(tours.filter(t => t._id !== id));
      }
    } catch (error) {
      toast.error('Failed to delete tour');
    }
  };

  // Mock data for Bookings (from previous Dashboard)
  const todaysBookings = [
    {
      id: 1,
      tourName: 'Heritage Walk of Kathmandu',
      guestName: 'Sarah Johnson',
      time: '10:00 AM',
      participants: 2,
      location: 'Patan Durbar Square',
      status: 'Confirmed'
    }
  ];

  return (
    <>
      <div className="max-w-7xl mx-auto space-y-4 pb-20 w-full animate-in fade-in duration-500">
        <div>
          <h1 className="text-xl font-black text-[#0b1f3a] uppercase tracking-tighter leading-none">Manage your experiences</h1>
        </div>
      
      {/* Top Status Bar */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-100 p-4 flex items-center justify-between shadow-sm sticky top-20 z-10">
        <div className="flex items-center gap-6">
           <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total Active Tours</span>
              <span className="text-xl font-bold text-[#0b1f3a]">{tours.length}</span>
           </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Accepting Duty</span>
            <span className={`text-[10px] font-black uppercase tracking-widest ${isAvailable ? 'text-emerald-500' : 'text-slate-400'}`}>
              {isAvailable ? 'Active' : 'Offline'}
            </span>
          </div>
          <button onClick={() => setIsAvailable(!isAvailable)} className={`transition-all duration-300 ${isAvailable ? 'text-emerald-500' : 'text-slate-300'}`}>
            {isAvailable ? <FaToggleOn className="text-4xl" /> : <FaToggleOff className="text-4xl" />}
          </button>
          <button 
            onClick={() => window.location.href = '/guide/create-tour'} 
            className="px-6 py-3 bg-[#0b1f3a] text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg active:scale-95 whitespace-nowrap"
          >
             Build New Experience
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
           <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
              <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <FaTag className="text-amber-500" /> My Official Experiences
              </h2>
              <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Database Sync Active</span>
           </div>
           
           <div className="p-4">
              {loading ? (
                  <div className="py-20 text-center">
                      <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Updating Collection...</p>
                  </div>
              ) : tours.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {tours.map((tour) => (
                        <div key={tour._id} className="flex items-center gap-4 p-4 rounded-3xl border border-slate-50 hover:border-blue-100 hover:bg-blue-50/10 transition-all group relative overflow-hidden">
                           {/* Trash Icon */}
                           <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                              <button onClick={() => handleDeleteTour(tour._id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                                 <FaTrash className="text-xs" />
                              </button>
                           </div>

                           {/* Tour Image */}
                           <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                              {tour.photos && tour.photos.length > 0 ? (
                                  <img src={tour.photos[0].startsWith('http') ? tour.photos[0] : `http://localhost:5000/${tour.photos[0]}`} alt={tour.title} className="w-full h-full object-cover" />
                              ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-300"><FaMapMarkedAlt className="text-2xl" /></div>
                              )}
                           </div>
                           
                           {/* Tour Metadata */}
                           <div className="flex-1 min-w-0 pr-8">
                              <h3 className="font-black text-slate-800 text-sm truncate uppercase tracking-tighter mb-1">{tour.title}</h3>
                              <div className="flex flex-wrap items-center gap-2">
                                 <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg uppercase tracking-widest">
                                    {tour.currency} {tour.price}
                                 </span>
                                 <div className="flex items-center gap-3 border-l border-slate-100 pl-3">
                                    <span className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                       <FaClock className="text-blue-300" /> {tour.duration}
                                    </span>
                                    <div className="flex gap-1">
                                       {tour.categories && tour.categories.slice(0, 2).map((cat, idx) => (
                                          <span key={idx} className="text-[8px] font-black text-slate-300 uppercase tracking-tighter bg-slate-50 px-1.5 rounded-md">
                                             {cat}
                                          </span>
                                       ))}
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                      ))}
                  </div>
              ) : (
                  <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/50">
                      <FaMapMarkedAlt className="text-4xl text-slate-200 mx-auto mb-4" />
                      <h3 className="text-xs font-black text-slate-800 uppercase mb-2 leading-relaxed">No expertise listed yet</h3>
                      <button onClick={() => window.location.href = '/guide/create-tour'} className="px-6 py-3 bg-[#0b1f3a] text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all active:scale-95">
                         Add Your Experience
                      </button>
                  </div>
              )}
           </div>
        </div>
      </div>
    </div>

    <ConfirmationModal
      isOpen={!!deleteTourTarget}
      onClose={() => setDeleteTourTarget(null)}
      onConfirm={confirmDeleteTour}
      title="Delete Tour"
      message="Are you sure you want to delete this tour? This action cannot be undone."
      confirmText="Delete"
      cancelText="Keep Tour"
      type="danger"
    />
    </>
  );
};

export default GuideTours;
