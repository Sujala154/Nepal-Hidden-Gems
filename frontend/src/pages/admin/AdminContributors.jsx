/**
 * AdminContributors.jsx
 *
 * Management panel for contributor accounts.
 * Admins can view contributor bios, ban/unban, permanently delete,
 * and navigate to a contributor's submitted destinations for content review.
 *
 * All destructive actions are gated behind confirmation modals.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaUsers,
  FaEnvelope,
  FaSpinner,
  FaSearch,
  FaBan,
  FaTrash,
  FaCheckCircle,
} from 'react-icons/fa';
import api from '../../services/api';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const AdminContributors = () => {
  const navigate = useNavigate();

  // ── State ──────────────────────────────────────────────────────────────────
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [banTarget, setBanTarget] = useState(null);     // { id, currentStatus }
  const [deleteTarget, setDeleteTarget] = useState(null); // contributor._id

  // ── Data Fetching ──────────────────────────────────────────────────────────
  const fetchContributors = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users/contributors');
      if (res.success) {
        setContributors(res.data);
      }
    } catch (err) {
      toast.error('Failed to load contributors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContributors();
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
        // Optimistic update — flip banned flag without re-fetching the full list
        setContributors((prev) =>
          prev.map((c) => (c._id === id ? { ...c, isBanned: !currentStatus } : c)),
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
        toast.success('Contributor permanently deleted');
        setContributors((prev) => prev.filter((c) => c._id !== id));
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete contributor');
    }
  };

  // Client-side search filter — matches name or email
  const filteredContributors = contributors.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // ── Loading State ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <FaSpinner className="text-amber-500 text-4xl animate-spin mb-4" />
        <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">Loading Contributors...</p>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="space-y-4">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-900 text-white">
                <tr className="text-xs uppercase font-black tracking-widest whitespace-nowrap">
                  <th className="px-6 py-4">Contributor Identity</th>
                  <th className="px-6 py-4">Bio / Experience</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Joined On</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredContributors.length > 0 ? (
                  filteredContributors.map((contributor) => {
                    const { _id, name, email, bio, verified, isBanned, createdAt } = contributor;
                    return (
                      <tr key={_id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-md">
                              <FaUsers className="text-xl" />
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
                        <td className="px-6 py-4 max-w-xs">
                          <div className="relative pl-3 border-l-2 border-slate-200 italic text-slate-500 text-sm line-clamp-2">
                            {bio || 'No bio provided yet.'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase ${
                            verified
                              ? 'bg-green-100 text-green-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {verified ? 'Verified' : 'Unverified'}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-sm text-slate-500 font-medium">
                          {new Date(createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="px-6 py-3 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={() => navigate(`/admin/contributors/${_id}/destinations`)}
                              className="text-[10px] font-black uppercase text-amber-600 tracking-widest hover:text-amber-800 underline underline-offset-4 mr-2"
                            >
                              View Contributions
                            </button>
                            <button
                              onClick={() => handleToggleBan(_id, isBanned)}
                              className={`p-2 rounded-lg text-xs font-bold transition-all ${
                                isBanned
                                  ? 'bg-green-50 text-green-600 hover:bg-green-100'
                                  : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                              }`}
                              title={isBanned ? 'Unban Contributor' : 'Ban Contributor'}
                            >
                              {isBanned ? <FaCheckCircle className="text-sm" /> : <FaBan className="text-sm" />}
                            </button>
                            <button
                              onClick={() => handleDelete(_id)}
                              className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all"
                              title="Permanently Delete Contributor"
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
                        <p className="font-bold uppercase tracking-widest text-xs">No contributors found</p>
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
        title={banTarget?.currentStatus ? 'Unban Contributor' : 'Ban Contributor'}
        message={`Are you sure you want to ${banTarget?.currentStatus ? 'unban' : 'ban'} this contributor?`}
        confirmText={banTarget?.currentStatus ? 'Yes, Unban' : 'Yes, Ban'}
        cancelText="Cancel"
        type="danger"
      />
      <ConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Contributor"
        message="Are you ABSOLUTELY sure? This will permanently delete this contributor and all their data."
        confirmText="Delete Permanently"
        cancelText="Keep Account"
        type="danger"
      />
    </>
  );
};

export default AdminContributors;
