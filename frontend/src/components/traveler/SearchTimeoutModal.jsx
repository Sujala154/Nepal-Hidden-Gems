import React, { useState } from 'react';
import { FaTimesCircle, FaLock, FaTrash, FaSpinner, FaTimes, FaSearch } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../services/api';

const SearchTimeoutModal = ({ booking, onClose, onAction }) => {
  const [actionLoading, setActionLoading] = useState(false);
  const timeoutMinutes = 30;

  if (!booking) {
    return null;
  }

  const handleSwitchToPrivate = async () => {
    try {
      setActionLoading(true);
      const toastId = toast.loading('Converting to private tour...');

      const response = await api.put(`/bookings/${booking._id}/switch-to-private`);

      if (response.success) {
        toast.success('Switched to private tour! Proceeding to payment...', { id: toastId });
        onAction('private', response.data);
      } else {
        toast.error(response.message || 'Failed to switch to private', { id: toastId });
      }
    } catch (error) {
      console.error('Switch to private error:', error);
      toast.error(error || 'Error converting to private tour');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to cancel this booking? You may be eligible for a refund.'
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);
      const toastId = toast.loading('Cancelling booking...');

      const response = await api.put(`/bookings/${booking._id}/cancel`, {
        reason: 'Cancelled due to no partner found after 30 minutes'
      });

      if (response.success) {
        toast.success('Booking cancelled. Refund will be processed.', { id: toastId });
        onAction('cancelled', response.data);
      } else {
        toast.error(response.message || 'Failed to cancel booking', { id: toastId });
      }
    } catch (error) {
      console.error('Cancel booking error:', error);
      toast.error(error || 'Error cancelling booking');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExtendSearch = async () => {
    try {
      setActionLoading(true);
      const toastId = toast.loading('Extending search window...');

      const response = await api.put(`/bookings/${booking._id}/extend-search`);

      if (response.success) {
        toast.success('Search window extended! We will keep looking.', { id: toastId });
        onAction('extended', response.data);
      } else {
        toast.error(response.message || 'Failed to extend search', { id: toastId });
      }
    } catch (error) {
      console.error('Extend search error:', error);
      toast.error(error || 'Error extending search window');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#0b1f3a]/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-[24px] shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-300 border border-slate-100 overflow-hidden font-sans">
        {/* Clean Neutral Header */}
        <div className="pt-4 pb-1 px-5 bg-white border-b border-slate-50 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-[#0b1f3a] uppercase tracking-tight">
              No Partner Found
            </h3>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              Search Window: {timeoutMinutes}m
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-[#0b1f3a] transition-all"
          >
            <FaTimes size={10} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 pt-3 pb-4 space-y-2.5">
          {/* Message */}
          <div className="bg-slate-50/50 p-3 rounded-[16px] border border-slate-100 mb-1">
            <p className="text-xs text-slate-600 leading-relaxed">
              We couldn't find a partner for your <span className="font-bold text-[#0b1f3a]">{booking.destinationName}</span> trip within the search limit. How would you like to proceed?
            </p>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 gap-2">
            {/* Option 1 */}
            <div className="p-3 rounded-[16px] bg-white border border-slate-100 hover:border-amber-200 transition-all group">
              <div className="flex items-center gap-3 mb-1">
                <span className="w-6 h-6 rounded-full bg-[#0b1f3a] text-white flex items-center justify-center text-[10px] font-black">
                  1
                </span>
                <h4 className="text-[11px] font-black text-[#0b1f3a] uppercase tracking-widest">
                  Switch to Private
                </h4>
              </div>
              <p className="text-[10px] text-slate-500 ml-9 leading-tight">
                Book exclusively for yourself. Total Fee: NPR {(booking.amount * 2)?.toLocaleString()}.
              </p>
            </div>

            {/* Option 2 */}
            <div className="p-3 rounded-[16px] bg-white border border-slate-100 hover:border-red-100 transition-all group">
              <div className="flex items-center gap-3 mb-1">
                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-[10px] font-black">
                  2
                </span>
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  Cancel Booking
                </h4>
              </div>
              <p className="text-[10px] text-slate-400 ml-9 leading-tight italic">
                Forfeit the trip. Any initial payments for this booking will be refunded.
              </p>
            </div>

            {/* Option 3 - Continue Searching */}
            <div className="p-3 rounded-[16px] bg-white border border-slate-100 hover:border-emerald-100 transition-all group relative">
              {booking.date && (new Date(booking.date) - new Date() > 3 * 24 * 60 * 60 * 1000) && (
                <div className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full shadow-sm uppercase tracking-widest z-10">
                  Highly Recommended
                </div>
              )}
              <div className="flex items-center gap-3 mb-1">
                <span className="w-6 h-6 rounded-full bg-slate-100 text-emerald-500 flex items-center justify-center text-[10px] font-black">
                  3
                </span>
                <h4 className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">
                  Continue Searching
                </h4>
              </div>
              <p className="text-[10px] text-slate-500 ml-9 leading-tight">
                Keep waiting for a partner. Recommended if your trip is not immediately starting.
              </p>
            </div>
          </div>

          {/* Mini Cost Breakdown - Neural Colors */}
          <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-100">
             <div className="text-center flex-1 border-r border-slate-200 pb-1">
                <p className="text-[8px] font-bold text-slate-400 uppercase mb-1 whitespace-nowrap">Current Share</p>
                <p className="text-xs font-black text-slate-600">NPR {booking.amount?.toLocaleString()}</p>
             </div>
             <div className="text-center flex-1 pb-1">
                <p className="text-[8px] font-bold text-slate-400 uppercase mb-1 whitespace-nowrap">Private Total</p>
                <p className="text-xs font-black text-[#0b1f3a]">NPR {(booking.amount * 2)?.toLocaleString()}</p>
             </div>
          </div>
        </div>

        {/* Action Buttons - Navy Style */}
        <div className="px-5 pb-5 space-y-2">
          {/* Switch to Private Button */}
          <button
            onClick={handleSwitchToPrivate}
            disabled={actionLoading}
            className="w-full py-3 bg-[#0b1f3a] text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-900/20 hover:bg-amber-600 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {actionLoading ? (
              <>
                <FaSpinner className="animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <FaLock className="text-amber-500" />
                Confirm Private Tour
              </>
            )}
          </button>

          <div className="grid grid-cols-2 gap-2">
            {/* Continue Searching Button */}
            <button
              onClick={handleExtendSearch}
              disabled={actionLoading}
              className="py-3 bg-emerald-50 border-2 border-emerald-100 text-emerald-700 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-100 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <FaSearch size={10} />
              Keep Searching
            </button>

            {/* Cancel Button */}
            <button
              onClick={handleCancelBooking}
              disabled={actionLoading}
              className="py-3 bg-white border-2 border-slate-100 text-slate-400 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {actionLoading ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <>
                  <FaTrash size={10} className="text-slate-300 group-hover:text-red-400" />
                  Cancel Booking
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchTimeoutModal;
