import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendarCheck, FaUser, FaClock, FaCheck, FaTimes, FaMapMarkerAlt, FaMoneyBillWave, FaUsers } from 'react-icons/fa';
import api from '../../services/api';
import toast from 'react-hot-toast';

const GuideBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/bookings/guide-bookings');
      if (res.success) {
        setBookings(res.data);
      }
    } catch (err) {
      console.error('Error fetching guide bookings:', err);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleGoToChat = async (booking) => {
    try {
      const toastId = toast.loading('Opening chat...');
      const res = await api.get(`/bookings/${booking._id}/chat`);
      if (res.success && res.data) {
        toast.dismiss(toastId);
        navigate('/guide/chats', {
          state: {
            chatId: res.data._id,
            bookingType: booking.type,
            guideName: booking.guideName,
            destinationName: booking.destinationName,
            travelerName: booking.user?.name
          }
        });
      }
    } catch (err) {
      console.error('Go to chat error:', err);
      toast.error('Failed to open chat');
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      const res = await api.put(`/bookings/${bookingId}/status`, { status: newStatus });
      if (res.success) {
        toast.success(`Booking ${newStatus.toLowerCase()} successfully!`);
        // Update local state
        setBookings(bookings.map(b => b._id === bookingId ? { ...b, status: newStatus } : b));
      }
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error('Failed to update booking');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
        <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">Loading bookings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pt-0 pb-8">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-[#0b1f3a] uppercase tracking-tighter flex items-center gap-2">
            Review Traveler Requests <FaCalendarCheck className="text-amber-500 text-lg" />
          </h1>
        </div>
      </header>

      {bookings.length > 0 ? (
        <div className="grid gap-3">
          {bookings.map(booking => (
            <div key={booking._id} className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col lg:flex-row items-center justify-between gap-4 hover:shadow-lg transition-all group overflow-hidden relative">
              {/* Status Indicator Bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-2 ${
                booking.status === 'Accepted' ? 'bg-emerald-500' : 
                booking.status === 'Declined' ? 'bg-red-500' : 'bg-amber-400'
              }`} />

              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-200">
                  {booking.user?.profileImage ? (
                    <img src={booking.user.profileImage} alt={booking.user.name} className="w-full h-full object-cover" />
                  ) : (
                    <FaUser className="text-slate-300 text-2xl" />
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-black text-slate-800 tracking-tight leading-none mb-1">
                    {booking.user?.name || 'Unknown Traveler'}
                  </h3>
                  <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-400">
                    <span className="flex items-center gap-1.5"><FaMapMarkerAlt className="text-amber-500" /> {booking.destinationName}</span>
                    <span className="flex items-center gap-1.5"><FaClock className="text-emerald-500" /> {new Date(booking.date).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1.5"><FaMoneyBillWave className="text-emerald-500" /> NPR {booking.amount}</span>
                  </div>
                  <div className="pt-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      booking.type === 'split' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                      {booking.type} Tour
                    </span>
                    {booking.type === 'split' && booking.groupId && booking.groupId.members?.length > 1 && (
                      <div className="mt-2 flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-teal-600 border border-teal-100 rounded-full text-[9px] font-black uppercase tracking-widest w-fit">
                        <FaUsers className="text-teal-500" /> Group: {booking.groupId.members.length} Members
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {booking.status === 'Pending' ? (
                  <>
                    <button 
                      onClick={() => handleStatusUpdate(booking._id, 'Accepted')}
                      className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                    >
                      <FaCheck /> Accept
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(booking._id, 'Declined')}
                      className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-100 text-slate-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:border-red-200 hover:text-red-500 active:scale-95 transition-all"
                    >
                      <FaTimes /> Decline
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    {booking.status === 'Accepted' && (
                      <button 
                        onClick={() => handleGoToChat(booking)}
                        className="flex items-center gap-2 px-6 py-3 bg-[#0b1f3a] text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-600 shadow-lg shadow-blue-500/10 active:scale-95 transition-all"
                      >
                        Go to Chat
                      </button>
                    )}
                    <div className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 border ${
                      booking.status === 'Accepted' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
                    }`}>
                      {booking.status === 'Accepted' ? <FaCheck /> : <FaTimes />} {booking.status}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="h-[50vh] flex flex-col items-center justify-center text-center p-8 bg-white rounded-3xl border border-dashed border-slate-200">
          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 text-slate-200">
            <FaCalendarCheck size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">No Booking Requests</h2>
          <p className="text-slate-500 max-w-sm mx-auto mb-8 font-medium">You haven't received any booking requests yet. They will appear here once travelers start booking your tours.</p>
        </div>
      )}
    </div>
  );
};

export default GuideBookings;
