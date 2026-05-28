import React, { useState } from 'react';
import { FaUser, FaCheckCircle, FaTimesCircle, FaStar, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../services/api';

const PartnerSuggestionCard = ({ booking, onRespond }) => {
  const [responding, setResponding] = useState(false);
  const suggestedPartner = booking.suggestedPartnerId;

  if (!suggestedPartner) {
    return null;
  }

  const handleAcceptPartner = async () => {
    try {
      setResponding(true);
      const toastId = toast.loading('Accepting partner match...');

      const response = await api.put(`/bookings/${booking._id}/respond-to-partner`, {
        response: 'accept'
      });

      if (response.success) {
        toast.success('Partner matched! 🎉', { id: toastId });
        onRespond(response.data);
      } else {
        toast.error(response.message || 'Failed to accept partner', { id: toastId });
      }
    } catch (error) {
      console.error('Accept partner error:', error);
      toast.error(error || 'Error accepting partner');
    } finally {
      setResponding(false);
    }
  };

  const handleDeclinePartner = async () => {
    try {
      setResponding(true);
      const toastId = toast.loading('Declining partner suggestion...');

      const response = await api.put(`/bookings/${booking._id}/respond-to-partner`, {
        response: 'reject'
      });

      if (response.success) {
        toast.success('Continuing search for a better match', { id: toastId });
        onRespond(response.data);
      } else {
        toast.error(response.message || 'Failed to decline partner', { id: toastId });
      }
    } catch (error) {
      console.error('Decline partner error:', error);
      toast.error(error || 'Error declining partner');
    } finally {
      setResponding(false);
    }
  };

  return (
    <section className="bg-gradient-to-br from-orange-50 to-amber-50 p-8 rounded-[32px] border-2 border-orange-200 shadow-lg shadow-orange-100/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em] mb-2">
            ⚡ New Match Found!
          </h4>
          <p className="text-xs text-orange-700/70 font-semibold">
            We found someone heading on the same trip. Review below.
          </p>
        </div>
        <div className="w-12 h-12 rounded-full bg-white border-2 border-orange-200 flex items-center justify-center shadow-sm">
          <span className="text-xl">✨</span>
        </div>
      </div>

      {/* Partner Profile Card */}
      <div className="bg-white p-6 rounded-[24px] border border-orange-100 shadow-md mb-6">
        <div className="flex items-start gap-4 mb-6">
          {/* Partner Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center overflow-hidden border-2 border-orange-200 shrink-0 shadow-sm">
            {suggestedPartner?.profileImage ? (
              <img
                src={suggestedPartner.profileImage}
                alt={suggestedPartner?.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <FaUser className="text-orange-400 text-2xl" />
            )}
          </div>

          {/* Partner Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h5 className="text-lg font-black text-slate-900">{suggestedPartner?.name}</h5>
              <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-200">
                <FaCheckCircle className="text-emerald-600 text-xs" />
              </div>
            </div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter mb-3">
              Verified Traveler
            </p>
            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={`text-xs ${
                      i < (suggestedPartner?.rating || 4.5)
                        ? 'text-amber-400'
                        : 'text-slate-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[10px] font-black text-slate-500">
                {(suggestedPartner?.rating || 4.5).toFixed(1)} • Traveler
              </span>
            </div>
          </div>
        </div>

        {/* Bio / About Section */}
        {suggestedPartner?.bio && (
          <div className="mb-5 p-4 bg-slate-50 rounded-[16px] border border-slate-100">
            <p className="text-xs text-slate-700 leading-relaxed">
              "{suggestedPartner.bio}"
            </p>
          </div>
        )}

        {/* Trip Match Details */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
          <div className="bg-slate-50 p-3 rounded-lg">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-1">
              Destination
            </p>
            <p className="text-sm font-black text-slate-900">{booking.destinationName}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-1">
              Date
            </p>
            <p className="text-sm font-black text-slate-900">
              {new Date(booking.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="bg-white p-4 rounded-[20px] border border-slate-100 mb-6 shadow-sm">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-3">
          💰 Your Benefits
        </p>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-bold text-slate-700">
              <span className="text-emerald-600 font-black">50% discount</span> on guide fee
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-bold text-slate-700">
              Share costs with a <span className="text-emerald-600 font-black">verified traveler</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-bold text-slate-700">
              <span className="text-emerald-600 font-black">Chat &amp; coordinate</span> before the trip
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleDeclinePartner}
          disabled={responding}
          className="flex-1 py-4 px-4 bg-white border-2 border-slate-200 text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {responding ? (
            <>
              <FaSpinner className="animate-spin" />
              Declining...
            </>
          ) : (
            <>
              <FaTimesCircle />
              Keep Searching
            </>
          )}
        </button>
        <button
          onClick={handleAcceptPartner}
          disabled={responding}
          className="flex-1 py-4 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-500/30 hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {responding ? (
            <>
              <FaSpinner className="animate-spin" />
              Accepting...
            </>
          ) : (
            <>
              <FaCheckCircle />
              Accept Match!
            </>
          )}
        </button>
      </div>

      {/* Info Note */}
      <p className="text-[9px] text-slate-400 text-center mt-4 font-semibold">
        You can decline and continue searching for other matches
      </p>
    </section>
  );
};

export default PartnerSuggestionCard;
