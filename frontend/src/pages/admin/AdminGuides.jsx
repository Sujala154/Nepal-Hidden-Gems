/**
 * AdminGuides.jsx
 *
 * Management panel for guide accounts. Supports two views:
 *   - "All Guides" — full list with search, ban/unban, and delete.
 *   - "Pending Approvals" — filters to guides awaiting admin review,
 *     with Approve / Reject actions shown inline.
 *
 * All destructive and status-change actions route through confirmation
 * modals to prevent accidental clicks.
 */
import React, { useState, useEffect } from 'react';
import {
  FaUserTie,
  FaCheckCircle,
  FaExclamationCircle,
  FaSpinner,
  FaSearch,
  FaEnvelope,
  FaLanguage,
  FaBan,
  FaTrash,
} from 'react-icons/fa';
import api from '../../services/api';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const AdminGuides = () => {
  // ── State ──────────────────────────────────────────────────────────────────
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState('all'); // 'all' | 'pending'
  const [banTarget, setBanTarget] = useState(null);    // { id, currentStatus }
  const [deleteTarget, setDeleteTarget] = useState(null); // guide._id
  const [statusTarget, setStatusTarget] = useState(null); // { id, status }

  // ── Data Fetching ──────────────────────────────────────────────────────────
  const fetchGuides = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users/guides');
      if (res.success) {
        setGuides(res.data);
      }
    } catch (err) {
      toast.error('Failed to load guides');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuides();
  }, []);

  // ── Actions ────────────────────────────────────────────────────────────────

  const handleToggleBan = (id, currentStatus) => {
    setBanTarget({ id, currentStatus });
  };

  const confirmToggleBan = async () => {
    const { id, currentStatus } = banTarget;
    setBanTarget(null);
    try {
      const res = await api.put(`/admin/users/${id}/ban`);
      if (res.success) {
        toast.success(res.message || 'User status updated');
        setGuides((prev) =>
          prev.map((g) => (g._id === id ? { ...g, isBanned: !currentStatus } : g)),
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update user status');
    }
  };

  const handleDelete = (id) => {
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    const id = deleteTarget;
    setDeleteTarget(null);
    try {
      const res = await api.delete(`/admin/users/${id}`);
      if (res.success) {
        toast.success('Guide permanently deleted');
        setGuides((prev) => prev.filter((g) => g._id !== id));
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete guide');
    }
  };

  const handleUpdateStatus = (id, status) => {
    setStatusTarget({ id, status });
  };

  /**
   * Approve or reject a pending guide.
   * Uses an optimistic local update so the table reflects the change instantly,
   * without requiring a full re-fetch of the guide list.
   */
  const confirmUpdateStatus = async () => {
    const { id, status } = statusTarget;
    setStatusTarget(null);
    try {
      const res = await api.put(`/admin/guides/${id}/status`, { status });
      if (res.success) {
        toast.success(res.message || `Guide ${status}`);
        setGuides((prev) =>
          prev.map((g) => (g._id === id ? { ...g, approvalStatus: status } : g)),
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update status');
    }
  };

  // Derive counts before filtering so the badge always shows the true total
  const pendingCount = guides.filter((g) => g.approvalStatus === 'pending').length;

  const filteredGuides = guides.filter((guide) => {
    const matchesSearch =
      guide.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guide.email.toLowerCase().includes(searchTerm.toLowerCase());
    return view === 'pending'
      ? matchesSearch && guide.approvalStatus === 'pending'
      : matchesSearch;
  });

  // ── Loading State ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <FaSpinner className="text-amber-500 text-4xl animate-spin mb-4" />
        <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">Loading Guide Data...</p>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="space-y-4">
        {/* View toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setView('all')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              view === 'all'
                ? 'bg-[#0b1f3a] text-white shadow-lg'
                : 'bg-white text-slate-400 border border-slate-100 hover:border-slate-200'
            }`}
          >
            All Guides
          </button>
          <button
            onClick={() => setView('pending')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all relative ${
              view === 'pending'
                ? 'bg-[#0b1f3a] text-white shadow-lg'
                : 'bg-white text-slate-400 border border-slate-100 hover:border-slate-200'
            }`}
          >
            Pending Approvals
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-red-500 text-white text-[9px] flex items-center justify-center rounded-full animate-pulse">
                {pendingCount}
              </span>
            )}
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-900 text-white">
                <tr className="text-xs uppercase font-black tracking-widest whitespace-nowrap">
                  <th className="px-6 py-4">Guide Identity</th>
                  <th className="px-6 py-4">Specialty</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Joined On</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredGuides.length > 0 ? (
                  filteredGuides.map((guide) => {
                    const { _id, name, email, specialty, languages, verified, approvalStatus, isBanned, createdAt } = guide;
                    return (
                      <tr key={_id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-md">
                              <FaUserTie className="text-xl" />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 leading-none mb-1 text-[15px] flex items-center gap-2">
                                {name}
                                {isBanned && (
                                  <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-1">
                                    <FaBan /> Banned
                                  </span>
                                )}
                              </h4>
                              <p className="text-xs text-slate-500 flex items-center gap-1">
                                <FaEnvelope className="text-xs" /> {email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            {specialty?.map((s, idx) => (
                              <span key={idx} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                                {s}
                              </span>
                            ))}
                          </div>
                          <div className="mt-2.5 flex items-center gap-1 text-xs text-slate-400 font-bold uppercase">
                            <FaLanguage className="text-amber-500" /> {languages?.join(', ')}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-2">
                            {/* Email verification status */}
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase w-fit ${
                              verified
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                : 'bg-amber-50 text-amber-600 border border-amber-100'
                            }`}>
                              {verified ? <FaCheckCircle /> : <FaExclamationCircle />}
                              {verified ? 'Email Verified' : 'OTP Pending'}
                            </span>
                            {/* Admin approval status */}
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase w-fit ${
                              approvalStatus === 'approved'
                                ? 'bg-blue-50 text-blue-600 border border-blue-100'
                                : approvalStatus === 'rejected'
                                ? 'bg-red-50 text-red-600 border border-red-100'
                                : 'bg-slate-50 text-slate-600 border border-slate-100'
                            }`}>
                              {approvalStatus || 'pending'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-sm text-slate-500 font-medium">
                          {new Date(createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="px-6 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Approve / Reject only visible for pending guides */}
                            {approvalStatus === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(_id, 'approved')}
                                  className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-all shadow-sm"
                                  title="Approve Guide"
                                >
                                  <FaCheckCircle className="text-sm" />
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(_id, 'rejected')}
                                  className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all shadow-sm"
                                  title="Reject Guide"
                                >
                                  <FaBan className="text-sm" />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleToggleBan(_id, isBanned)}
                              className={`p-2 rounded-lg text-xs font-bold transition-all ${
                                isBanned
                                  ? 'bg-green-50 text-green-600 hover:bg-green-100'
                                  : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                              }`}
                              title={isBanned ? 'Unban Guide' : 'Ban Guide'}
                            >
                              {isBanned ? <FaCheckCircle className="text-sm" /> : <FaBan className="text-sm" />}
                            </button>
                            <button
                              onClick={() => handleDelete(_id)}
                              className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all shadow-sm"
                              title="Permanently Delete Guide"
                            >
                              <FaTrash className="text-sm" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="px-8 py-20 text-center text-slate-400">
                      <div className="flex flex-col items-center">
                        <FaSearch className="text-4xl text-slate-100 mb-4" />
                        <p className="font-bold uppercase tracking-widest text-xs">No guides matching your search</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={!!banTarget}
        onClose={() => setBanTarget(null)}
        onConfirm={confirmToggleBan}
        title={banTarget?.currentStatus ? 'Unban Guide' : 'Ban Guide'}
        message={`Are you sure you want to ${banTarget?.currentStatus ? 'unban' : 'ban'} this guide?`}
        confirmText={banTarget?.currentStatus ? 'Yes, Unban' : 'Yes, Ban'}
        cancelText="Cancel"
        type="danger"
      />
      <ConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Guide"
        message="Are you ABSOLUTELY sure? This will permanently delete this guide and all their data."
        confirmText="Delete Permanently"
        cancelText="Keep Account"
        type="danger"
      />
      <ConfirmationModal
        isOpen={!!statusTarget}
        onClose={() => setStatusTarget(null)}
        onConfirm={confirmUpdateStatus}
        title={`${statusTarget?.status === 'approved' ? 'Approve' : 'Reject'} Guide`}
        message={`Are you sure you want to mark this guide as ${statusTarget?.status}?`}
        confirmText="Yes, Confirm"
        cancelText="Cancel"
        type="danger"
      />
    </>
  );
};

export default AdminGuides;
