/**
 * AdminTravelers.jsx
 *
 * Lists all registered travelers on the platform with basic profile info.
 * Admins can ban/unban or permanently delete any traveler account.
 * All destructive actions are confirmed via a modal before executing.
 */
import React, { useState, useEffect } from 'react';
import {
  FaUser,
  FaEnvelope,
  FaSpinner,
  FaSearch,
  FaHistory,
  FaBan,
  FaTrash,
  FaCheckCircle,
} from 'react-icons/fa';
import api from '../../services/api';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const AdminTravelers = () => {
  // ── State ──────────────────────────────────────────────────────────────────
  const [travelers, setTravelers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [banTarget, setBanTarget] = useState(null);   // { id, currentStatus }
  const [deleteTarget, setDeleteTarget] = useState(null); // traveler._id

  // ── Data Fetching ──────────────────────────────────────────────────────────
  const fetchTravelers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users/travelers');
      if (res.success) {
        setTravelers(res.data);
      }
    } catch (err) {
      toast.error('Failed to load travelers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTravelers();
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
        // Optimistic update — flip the banned flag without a full re-fetch
        setTravelers((prev) =>
          prev.map((t) => (t._id === id ? { ...t, isBanned: !currentStatus } : t)),
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
        toast.success('User permanently deleted');
        setTravelers((prev) => prev.filter((t) => t._id !== id));
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete user');
    }
  };

  // Client-side search filter — matches name or email
  const filteredTravelers = travelers.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // ── Loading State ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <FaSpinner className="text-amber-500 text-4xl animate-spin mb-4" />
        <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">Loading Travelers...</p>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="space-y-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-900 text-white">
                <tr className="text-xs uppercase font-black tracking-widest whitespace-nowrap">
                  <th className="px-6 py-4">Traveler Name</th>
                  <th className="px-6 py-4">Email Address</th>
                  <th className="px-6 py-4">Join Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredTravelers.length > 0 ? (
                  filteredTravelers.map((traveler) => {
                    const { _id, name, email, createdAt, isBanned } = traveler;
                    return (
                      <tr key={_id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center text-sm font-bold">
                              {name.charAt(0)}
                            </div>
                            <h4 className="font-bold text-slate-900 text-[15px] flex items-center gap-2">
                              {name}
                              {isBanned && (
                                <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-1">
                                  <FaBan /> Banned
                                </span>
                              )}
                            </h4>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-slate-600 flex items-center gap-2">
                            <FaEnvelope className="text-slate-400" /> {email}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-500 flex items-center gap-2">
                            <FaHistory className="text-slate-400" />
                            {new Date(createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleToggleBan(_id, isBanned)}
                              className={`p-2 rounded-lg text-xs font-bold transition-all ${
                                isBanned
                                  ? 'bg-green-50 text-green-600 hover:bg-green-100'
                                  : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                              }`}
                              title={isBanned ? 'Unban User' : 'Ban User'}
                            >
                              {isBanned ? <FaCheckCircle className="text-sm" /> : <FaBan className="text-sm" />}
                            </button>
                            <button
                              onClick={() => handleDelete(_id)}
                              className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all"
                              title="Permanently Delete User"
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
                    <td colSpan="4" className="px-8 py-20 text-center text-slate-400">
                      <div className="flex flex-col items-center">
                        <FaSearch className="text-4xl text-slate-100 mb-4" />
                        <p className="font-bold uppercase tracking-widest text-xs">No travelers found</p>
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
        title={banTarget?.currentStatus ? 'Unban Traveler' : 'Ban Traveler'}
        message={`Are you sure you want to ${banTarget?.currentStatus ? 'unban' : 'ban'} this traveler?`}
        confirmText={banTarget?.currentStatus ? 'Yes, Unban' : 'Yes, Ban'}
        cancelText="Cancel"
        type="danger"
      />
      <ConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Traveler"
        message="Are you ABSOLUTELY sure? This will permanently delete this traveler and all their data."
        confirmText="Delete Permanently"
        cancelText="Keep Account"
        type="danger"
      />
    </>
  );
};

export default AdminTravelers;
