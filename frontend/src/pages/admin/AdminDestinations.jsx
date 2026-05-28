import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../services/api';
import { buildBackendUrl } from '../../utils/backendUrls';
import { FaCheck, FaTimes, FaEye, FaSpinner, FaMapMarkerAlt, FaUser, FaInfoCircle, FaExclamationCircle, FaBan } from 'react-icons/fa';
import toast from 'react-hot-toast';
import UnifiedDestinationContainer from '../../components/common/UnifiedDestinationContainer';

const AdminDestinations = () => {
  const [pendingDestinations, setPendingDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDest, setSelectedDest] = useState(null);
  const [actionLoading, setActionLoading] = useState(null); // id of destination being processed
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [rejectionTitle, setRejectionTitle] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const { searchTerm = '' } = useOutletContext() || {};

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/destinations/pending');
      if (res.success) {
        setPendingDestinations(res.data);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async () => {
    const id = selectedDest._id;
    try {
      setActionLoading(id);
      const res = await api.put(`/admin/destinations/${id}/approve`);
      if (res.success) {
        setPendingDestinations(prev => prev.filter(d => d._id !== id));
        if (selectedDest?._id === id) setSelectedDest(null);
        setShowApproveModal(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to approve');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    if (!rejectionTitle.trim() || !rejectionReason.trim()) {
      toast.error('Please provide both a summary and a detailed reason');
      return;
    }

    try {
      setActionLoading(id);
      const res = await api.put(`/admin/destinations/${id}/reject`, {
        rejectionTitle,
        rejectionReason
      });
      if (res.success) {
        setPendingDestinations(prev => prev.filter(d => d._id !== id));
        if (selectedDest?._id === id) setSelectedDest(null);
        setShowRejectModal(false);
        setRejectionTitle('');
        setRejectionReason('');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to reject');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <FaSpinner className="text-amber-500 text-4xl animate-spin mb-4" />
        <p className="text-slate-500 font-bold tracking-widest uppercase text-xs">Loading Submissions...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="flex justify-between items-center mb-0">
        <div>
          <h2 className="text-xl font-black text-[#0b1f3a] uppercase tracking-tighter leading-none">Review and approve submissions</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-xl font-bold text-[9px] uppercase tracking-widest shadow-sm border border-amber-200">
            {pendingDestinations.filter(d => d.status === 'pending' || !d.status).length} Pending
          </div>
          <div className="bg-red-100 text-red-600 px-3 py-1.5 rounded-xl font-bold text-[9px] uppercase tracking-widest shadow-sm border border-red-200">
            {pendingDestinations.filter(d => d.status === 'rejected').length} Declined
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-start">
        {/* List of Pending */}
        <div className="xl:col-span-1 space-y-4 pr-2">
          {pendingDestinations.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-10 text-center">
              <FaCheck className="text-slate-200 text-4xl mx-auto mb-4" />
              <p className="text-slate-500 font-bold">Queue is empty!</p>
            </div>
          ) : (
            pendingDestinations.map(dest => (
              <div
                key={dest._id}
                onClick={() => setSelectedDest(dest)}
                className={`p-3 rounded-xl border transition-all cursor-pointer group
                  ${selectedDest?._id === dest._id
                    ? 'bg-amber-50 border-amber-200 shadow-md ring-1 ring-amber-200'
                    : 'bg-white border-slate-100 hover:border-amber-200 shadow-sm'}`}
              >
                <div className="flex gap-3">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                    <img
                      src={buildBackendUrl(dest.image)}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 truncate text-sm">{dest.name}</h4>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <FaMapMarkerAlt className="text-amber-500" /> {dest.location}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex items-center gap-1 text-[9px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-600 font-bold">
                        <FaUser className="text-[7px]" /> {dest.createdBy?.name || 'Unknown'}
                      </div>
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${dest.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                        {dest.status === 'rejected' ? 'Declined' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detailed View */}
        <div className="xl:col-span-2">
          {selectedDest ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
              {/* Review Header / Actions */}
              <div className="bg-white px-4 py-3 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 text-sm">
                    <FaEye />
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Moderation Queue</p>
                    <h3 className="font-bold text-base text-slate-900 leading-tight">{selectedDest.name}</h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowRejectModal(true)}
                    disabled={actionLoading === selectedDest._id}
                    className={`px-3 py-1.5 bg-white text-red-500 border border-red-100 rounded-lg font-bold text-[9px] uppercase tracking-widest hover:bg-red-50 transition-all disabled:opacity-50 ${selectedDest.status === 'rejected' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {selectedDest.status === 'rejected' ? 'Declined' : 'Decline'}
                  </button>
                  <button
                    onClick={() => setShowApproveModal(true)}
                    disabled={actionLoading === selectedDest._id}
                    className="px-4 py-1.5 bg-slate-900 text-white rounded-lg font-bold text-[9px] uppercase tracking-widest hover:bg-black active:scale-95 transition-all shadow-lg shadow-slate-900/10 disabled:opacity-50 flex items-center gap-2"
                  >
                    {actionLoading === selectedDest._id ? <FaSpinner className="animate-spin text-[8px]" /> : 'Approve & Publish'}
                  </button>
                </div>
              </div>

              <div className="p-4">
                <UnifiedDestinationContainer destination={selectedDest} />

                <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-3">
                  <FaInfoCircle className="text-amber-500 text-base mt-1" />
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs mb-0.5">Moderator Note</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Ensure accuracy. Approved destinations go live instantly.
                    </p>
                  </div>
                </div>

                {selectedDest.status === 'rejected' && (
                  <div className="mt-8 p-6 bg-red-50 rounded-2xl border border-red-100 flex items-start gap-4">
                    <FaExclamationCircle className="text-red-500 text-xl mt-1" />
                    <div>
                      <h4 className="font-bold text-red-800 mb-1">Previous Rejection Feedback</h4>
                      <p className="text-[10px] font-black uppercase tracking-widest text-red-500/60 mb-2">Issue: {selectedDest.rejectionTitle || 'General'}</p>
                      <p className="text-sm text-red-600 leading-relaxed font-medium bg-white/50 p-4 rounded-xl border border-red-100/50">
                        "{selectedDest.rejectionReason || 'No detailed reason provided.'}"
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center text-slate-400">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <FaEye className="text-3xl" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Select a submission to review</h3>
              <p className="max-w-xs text-sm">Choose a pending destination from the left list to view its full details and take action.</p>
            </div>
          )}
        </div>
      </div>

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[24px] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-slate-100 p-5 relative">
            <button
              onClick={() => setShowApproveModal(false)}
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-slate-50/60 hover:bg-slate-100/80 flex items-center justify-center transition-all text-slate-400 z-10"
            >
              <FaTimes />
            </button>

            <div className="mb-4">
              <h3 className="text-xl font-black text-slate-900 tracking-tight mb-0.5">Publish Destination?</h3>
              <p className="text-sm text-slate-500 font-medium leading-snug">
                You are authorizing <span className="text-slate-900 font-bold">{selectedDest.name}</span> to be visible to all travelers. This action will send it live instantly.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowApproveModal(false)}
                className="flex-1 py-3 rounded-xl font-bold uppercase tracking-widest text-[9px] text-slate-600 border border-slate-200 bg-transparent hover:bg-slate-50 transition-all"
              >
                Keep in Review
              </button>
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="flex-1 py-3 rounded-xl font-bold uppercase tracking-widest text-[9px] text-white bg-[#0b1f3a] shadow-xl shadow-[#0b1f3a]/20 hover:bg-[#0a1a2e] transition-all flex items-center justify-center gap-2"
              >
                {actionLoading === selectedDest?._id ? <FaSpinner className="animate-spin" /> : 'Confirm & Publish'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-slate-100 p-8 relative">
            <button
              onClick={() => setShowRejectModal(false)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-all text-slate-400 z-10"
            >
              <FaTimes />
            </button>

            <div className="mb-6 space-y-4">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-1">Decline Submission</h3>
              <p className="text-slate-500 font-medium leading-relaxed mb-2">
                Please specify exactly what needs to be fixed.
              </p>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block mx-2">Exact Problem (Short)</label>
                <input
                  type="text"
                  value={rejectionTitle}
                  onChange={(e) => setRejectionTitle(e.target.value)}
                  placeholder="e.g. Blurry Cover Image"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-red-500 transition-all text-slate-700 font-bold placeholder:text-slate-300"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block mx-2">Detailed Advice for Contributor</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain the specific problem and how they can fix it..."
                  className="w-full h-32 px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-red-500 transition-all resize-none text-slate-700 font-medium placeholder:text-slate-300"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] text-slate-500 bg-slate-50 hover:bg-slate-100 transition-all"
              >
                Go Back
              </button>
              <button
                onClick={() => handleReject(selectedDest._id)}
                disabled={actionLoading || !rejectionReason.trim() || !rejectionTitle.trim()}
                className="flex-1 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] text-white bg-slate-900 shadow-xl shadow-slate-900/20 hover:bg-black transition-all flex items-center justify-center gap-2"
              >
                {actionLoading === selectedDest?._id ? <FaSpinner className="animate-spin" /> : 'Confirm Decline'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDestinations;
