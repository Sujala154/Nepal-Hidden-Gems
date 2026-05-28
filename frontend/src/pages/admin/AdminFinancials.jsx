/**
 * AdminFinancials.jsx
 *
 * Displays the complete transaction ledger for the platform.
 * Admins can release guide payouts and manage eSewa refunds from here.
 *
 * Refund flow:
 *   1. A traveler's booking is cancelled → payment becomes "Refund Pending".
 *   2. Admin manually processes the refund in the eSewa dashboard.
 *   3. Admin enters the eSewa refund ID here to confirm and notify the traveler.
 */
import React, { useState, useEffect } from 'react';
import {
  FaWallet,
  FaCheckCircle,
  FaSpinner,
  FaUndo,
  FaFileInvoice,
  FaExclamationTriangle,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Modal from '../../components/common/Modal';

const AdminFinancials = () => {
  // ── State ──────────────────────────────────────────────────────────────────
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Refund modal state — two separate modals for "initiate" vs "confirm" flows
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isInitiateModalOpen, setIsInitiateModalOpen] = useState(false);
  const [activePayment, setActivePayment] = useState(null);
  const [refundReason, setRefundReason] = useState('');
  const [esewaRefundId, setEsewaRefundId] = useState('');
  const [refundIdError, setRefundIdError] = useState('');

  // ── Data Fetching ──────────────────────────────────────────────────────────
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/payments');
      if (res.success) {
        setPayments(res.data);
      }
    } catch (error) {
      toast.error('Failed to load financials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // ── Actions ────────────────────────────────────────────────────────────────

  const handleRelease = async (paymentId) => {
    try {
      const toastId = toast.loading('Releasing payout...');
      const res = await api.put(`/admin/payments/${paymentId}/release`);
      if (res.success) {
        toast.success('Payout released successfully', { id: toastId });
        fetchPayments();
      } else {
        toast.error(res.error || 'Failed to release payout', { id: toastId });
      }
    } catch (error) {
      toast.error('Error occurred while releasing payout');
    }
  };

  /**
   * Step 2 of the refund flow: admin enters the eSewa refund transaction ID
   * to officially close the refund and trigger a notification to the traveler.
   */
  const handleConfirmRefund = async () => {
    if (!esewaRefundId) return;

    const trimmedId = esewaRefundId.trim();
    if (trimmedId !== activePayment?.transactionId) {
      setRefundIdError('Refund ID must exactly match the original payment transaction ID.');
      return;
    }

    try {
      const toastId = toast.loading('Confirming refund...');
      const res = await api.put(`/admin/payments/${activePayment._id}/confirm-refund`, {
        esewaRefundId: trimmedId,
      });
      if (res.success) {
        toast.success('Refund confirmed and user notified', { id: toastId });
        setIsConfirmModalOpen(false);
        setEsewaRefundId('');
        setRefundIdError('');
        fetchPayments();
      } else {
        toast.error(res.message || 'Failed to confirm refund', { id: toastId });
      }
    } catch (error) {
      toast.error('Error occurred while confirming refund');
    }
  };

  /**
   * Step 1 of the refund flow: marks the payment as "Refund Pending" in the DB
   * and stores an internal reason note for admin records.
   */
  const handleInitiateRefund = async () => {
    try {
      const toastId = toast.loading('Initiating refund process...');
      const res = await api.put(`/admin/payments/${activePayment._id}/initiate-refund`, {
        reason: refundReason,
      });
      if (res.success) {
        toast.success('Transaction marked for refund', { id: toastId });
        setIsInitiateModalOpen(false);
        setRefundReason('');
        fetchPayments();
      } else {
        toast.error(res.message || 'Failed to initiate refund', { id: toastId });
      }
    } catch (error) {
      toast.error('Error occurred while initiating refund');
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="mb-4 flex justify-between items-end">
        <div>
          <h1 className="text-xl font-black text-[#0b1f3a] uppercase tracking-tighter flex items-center gap-2 leading-none">
            System Payouts &amp; Transaction History <FaWallet className="text-emerald-500 text-lg" />
          </h1>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest whitespace-nowrap w-[25%]">Entity Details</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest whitespace-nowrap w-[15%] text-center">Total Paid</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest whitespace-nowrap w-[22%] text-center">Distribution</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest whitespace-nowrap w-[18%] text-center">Payment Status</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest whitespace-nowrap text-right w-[20%]">Status &amp; Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-20 text-center">
                    <FaSpinner className="text-amber-500 text-4xl animate-spin mx-auto mb-4" />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Compiling Database...</p>
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-20 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200">
                      <FaFileInvoice className="text-3xl" />
                    </div>
                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Zero Transactions Found</p>
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="space-y-1">
                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{payment.traveler?.name}</p>
                        <p className="text-xs font-bold text-slate-400">Booking: {payment.bookingId?.destinationName || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-center">
                      <div className="flex flex-col items-center space-y-1">
                        <p className="text-lg font-black text-emerald-600 tracking-tighter leading-tight">NPR {payment.totalPaid?.toLocaleString()}</p>
                        <p className="text-[11px] font-bold text-slate-400 uppercase break-all font-mono leading-none">{payment.transactionId}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-center">
                      <div className="flex flex-col items-center gap-1.5 text-xs font-bold uppercase tracking-tight text-slate-500 max-w-[140px] mx-auto">
                        <div className="flex justify-between w-full gap-4">
                          <span>App Fee</span>
                          <span className="text-slate-900">NPR {payment.appFee}</span>
                        </div>
                        <div className="flex justify-between w-full gap-4">
                          <span>Guide Share</span>
                          <span className="text-amber-600">NPR {payment.guideShare}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest ${
                        payment.paymentStatus === 'Refunded'
                          ? 'bg-red-50 text-red-600 border border-red-100'
                          : payment.paymentStatus === 'Refund Pending'
                          ? 'bg-orange-50 text-orange-600 border border-orange-100 animate-pulse'
                          : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      }`}>
                        {payment.paymentStatus === 'Paid' && <FaCheckCircle />}
                        {payment.paymentStatus || 'Paid'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right whitespace-nowrap">
                      <div className="flex justify-end items-center gap-3">
                        {/* Payout status badge */}
                        <div className="flex items-center gap-2">
                          {payment.paymentStatus === 'Refunded' ? (
                            <span className="text-xs font-black text-red-500 uppercase tracking-tighter opacity-70 flex items-center gap-1">
                              <FaUndo size={10} /> Reversed
                            </span>
                          ) : payment.payoutStatus === 'Released' ? (
                            <span className="bg-blue-50 text-blue-600 border border-blue-100 px-3.5 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest flex items-center gap-1.5">
                              <FaCheckCircle size={10} /> Released
                            </span>
                          ) : (
                            <span className="bg-slate-50 text-slate-400 border border-slate-100 px-3.5 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest">
                              {payment.payoutStatus || 'Pending'}
                            </span>
                          )}
                        </div>

                        {/* Action buttons — conditional on payment/payout state */}
                        {payment.paymentStatus === 'Refund Pending' && (
                          <button
                            onClick={() => {
                              setActivePayment(payment);
                              setIsConfirmModalOpen(true);
                            }}
                            className="px-5 py-2.5 bg-orange-500 text-white rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-orange-600 transition-all flex items-center gap-2 shadow-lg shadow-orange-500/10"
                          >
                            Confirm Refund
                          </button>
                        )}
                        {payment.payoutStatus === 'Pending' && payment.paymentStatus === 'Paid' && (
                          <button
                            onClick={() => handleRelease(payment._id)}
                            className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center gap-2 shadow-lg shadow-slate-900/10"
                          >
                            Release Payout
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm Refund Modal — admin supplies the eSewa transaction ID */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title={null}
        size="md"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">
              eSewa Refund ID (Required)
            </label>
            <input
              type="text"
              value={esewaRefundId}
              onChange={(e) => {
                const value = e.target.value;
                setEsewaRefundId(value);
                if (activePayment?.transactionId && value.trim() !== activePayment.transactionId) {
                  setRefundIdError('Refund ID must exactly match the original payment transaction ID.');
                } else {
                  setRefundIdError('');
                }
              }}
              placeholder="e.g. 000X-XXXX-XXXX"
              className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0b1f3a]/10 transition-all shadow-inner"
            />
            {activePayment?.transactionId && (
              <p className="text-[10px] text-slate-500">
                Original payment transaction ID: <span className="font-mono text-slate-700">{activePayment.transactionId}</span>
              </p>
            )}
            {refundIdError && (
              <p className="text-[10px] text-red-600 font-bold">{refundIdError}</p>
            )}
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={() => setIsConfirmModalOpen(false)}
              className="flex-1 py-3 bg-slate-50 text-slate-400 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-slate-100 transition-all border border-slate-100"
            >
              Back
            </button>
            <button
              onClick={handleConfirmRefund}
              disabled={!esewaRefundId || esewaRefundId.trim() !== activePayment?.transactionId}
              className="flex-[2] py-3 bg-[#0b1f3a] text-white rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-emerald-600 transition-all disabled:opacity-30 flex items-center justify-center gap-2"
            >
              Finalize <FaCheckCircle className="text-[8px]" />
            </button>
          </div>
        </div>
      </Modal>

      {/* Initiate Refund Modal — marks transaction for refund with an internal note */}
      <Modal
        isOpen={isInitiateModalOpen}
        onClose={() => setIsInitiateModalOpen(false)}
        title={null}
        size="md"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">
              Reason for Reversal
            </label>
            <textarea
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="Internal note..."
              className="w-full h-24 bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0b1f3a]/10 transition-all resize-none shadow-inner"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={() => setIsInitiateModalOpen(false)}
              className="flex-1 py-3 bg-slate-50 text-slate-400 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-slate-100 transition-all border border-slate-100"
            >
              Back
            </button>
            <button
              onClick={handleInitiateRefund}
              className="flex-[2] py-3 bg-red-600 text-white rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-red-700 transition-all flex items-center justify-center gap-2"
            >
              Execute Refund <FaUndo className="text-[8px]" />
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminFinancials;
