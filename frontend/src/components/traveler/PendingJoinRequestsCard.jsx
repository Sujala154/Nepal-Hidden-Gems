import React, { useState, useEffect } from 'react';
import { FaUser, FaCheckCircle, FaTimesCircle, FaSpinner, FaUsers, FaBell } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../services/api';

const PendingJoinRequestsCard = ({ booking, onRequestResolved }) => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [respondingTo, setRespondingTo] = useState(null);

  // Fetch pending requests when component mounts or booking changes
  useEffect(() => {
    fetchPendingRequests();
  }, [booking._id]);

  const fetchPendingRequests = async () => {
    try {
      setLoadingRequests(true);
      const response = await api.get(`/bookings/${booking._id}/pending-requests`);
      if (response.success) {
        setPendingRequests(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleAcceptRequest = async (requesterUserId, requesterBookingId) => {
    try {
      setRespondingTo(requesterUserId);
      const toastId = toast.loading('Accepting request...');

      const response = await api.put(`/bookings/${booking._id}/respond-to-join-request`, {
        requesterBookingId: requesterBookingId,
        response: 'accept'
      });

      if (response.success) {
        toast.success('Request accepted! You and your partner are now matched! 🎉', { id: toastId });
        // Refresh requests and notify parent
        fetchPendingRequests();
        onRequestResolved('accepted');
      } else {
        toast.error(response.message || 'Failed to accept request', { id: toastId });
      }
    } catch (error) {
      console.error('Accept request error:', error);
      toast.error(error || 'Error accepting request');
    } finally {
      setRespondingTo(null);
    }
  };

  const handleRejectRequest = async (requesterUserId, requesterBookingId) => {
    try {
      setRespondingTo(requesterUserId);
      const toastId = toast.loading('Declining request...');

      const response = await api.put(`/bookings/${booking._id}/respond-to-join-request`, {
        requesterBookingId: requesterBookingId,
        response: 'reject'
      });

      if (response.success) {
        toast.success('Request declined. They\'ve been notified and returned to searching.', { id: toastId });
        // Refresh requests
        fetchPendingRequests();
        onRequestResolved('rejected');
      } else {
        toast.error(response.message || 'Failed to decline request', { id: toastId });
      }
    } catch (error) {
      console.error('Reject request error:', error);
      toast.error(error || 'Error declining request');
    } finally {
      setRespondingTo(null);
    }
  };

  // Don't show if no pending requests or not searching
  if (!pendingRequests || pendingRequests.length === 0) {
    return null;
  }

  if (loadingRequests) {
    return (
      <section className="bg-blue-50 p-6 rounded-[24px] border-2 border-blue-200">
        <div className="flex items-center justify-center gap-3">
          <FaSpinner className="animate-spin text-blue-500" />
          <p className="text-sm font-bold text-blue-600">Loading requests...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-br from-blue-50 to-cyan-50 p-8 rounded-[32px] border-2 border-blue-200 shadow-lg shadow-blue-100/50">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-white border-2 border-blue-200 flex items-center justify-center">
          <FaBell className="text-blue-600 text-lg" />
        </div>
        <div>
          <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">
            ⏳ Pending Join Requests
          </h4>
          <p className="text-[9px] font-bold text-blue-500 uppercase tracking-tighter">
            {pendingRequests.length} traveler{pendingRequests.length !== 1 ? 's' : ''} want to join your group
          </p>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-3">
        {pendingRequests.map((request, idx) => (
          <div
            key={idx}
            className="bg-white p-5 rounded-[24px] border border-blue-100 shadow-sm hover:shadow-md transition-all"
          >
            {/* Requester Profile */}
            <div className="flex items-start gap-4 mb-5">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center overflow-hidden border-2 border-blue-200 shrink-0 shadow-sm">
                {request.profileImage ? (
                  <img
                    src={request.profileImage}
                    alt={request.userName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaUser className="text-blue-400 text-2xl" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <h5 className="text-sm font-black text-slate-900 mb-1">{request.userName}</h5>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-2">
                  Verified Traveler
                </p>
                <p className="text-[9px] text-slate-500">
                  Requested {new Date(request.requestedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              {/* Status Indicator */}
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center border border-blue-200">
                <FaUsers className="text-blue-400 text-lg" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => handleAcceptRequest(request.userId, request.requesterBookingId)}
                disabled={respondingTo === request.userId}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-[16px] font-black uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-500/20 hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {respondingTo === request.userId ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Accepting...
                  </>
                ) : (
                  <>
                    <FaCheckCircle />
                    Accept
                  </>
                )}
              </button>

              <button
                onClick={() => handleRejectRequest(request.userId, request.requesterBookingId)}
                disabled={respondingTo === request.userId}
                className="flex-1 py-3 px-4 bg-white border-2 border-red-200 text-red-600 rounded-[16px] font-black uppercase tracking-widest text-[10px] hover:bg-red-50 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {respondingTo === request.userId ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Declining...
                  </>
                ) : (
                  <>
                    <FaTimesCircle />
                    Decline
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Info Note */}
      <p className="text-[9px] text-blue-500 text-center mt-5 font-semibold italic">
        Accept someone to finalize the match. They'll get notified of your decision.
      </p>
    </section>
  );
};

export default PendingJoinRequestsCard;
