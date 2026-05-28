/**
 * BookingsPage.jsx
 *
 * The primary dashboard for travelers to manage their upcoming and past trips.
 * This is the most complex component in the traveler workspace, handling:
 * - Real-time partner search timeouts via `usePartnerSearchTimeout`.
 * - eSewa payment initiation (via hidden form submission to the gateway).
 * - Refund requests and booking cancellations.
 * - Group Hub: A side-panel interface for split/group tour coordination.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  FaTicketAlt,
  FaCalendarAlt,
  FaUser,
  FaCheckCircle,
  FaClock,
  FaSpinner,
  FaHiking,
  FaUsers,
  FaArrowRight,
  FaCommentDots,
  FaCreditCard,
  FaLock,
  FaFileInvoice,
  FaUndo,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../services/api';
import PartnerSuggestionCard from '../../components/traveler/PartnerSuggestionCard';
import SearchTimeoutModal from '../../components/traveler/SearchTimeoutModal';
import PendingJoinRequestsCard from '../../components/traveler/PendingJoinRequestsCard';
import ReceiptCard from '../../components/traveler/ReceiptCard';
import Modal from '../../components/common/Modal';
import { usePartnerSearchTimeout } from '../../hooks/usePartnerSearchTimeout';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const BookingsPage = () => {
  const navigate = useNavigate();
  const { searchTerm = '' } = useOutletContext() || {};

  // ── State ──────────────────────────────────────────────────────────────────
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroupBooking, setSelectedGroupBooking] = useState(null);
  const [selectedPaymentRecord, setSelectedPaymentRecord] = useState(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundTarget, setRefundTarget] = useState(null);
  const [refundReason, setRefundReason] = useState('');
  const [dismissedTimeouts, setDismissedTimeouts] = useState(new Set());
  const [showRefundConfirm, setShowRefundConfirm] = useState(false);
  const [refundConfirmBooking, setRefundConfirmBooking] = useState(null);

  // Detect bookings that have exceeded the search time limit (30 mins default)
  const timedOutBooking = usePartnerSearchTimeout(bookings, 30);

  // ── Data Fetching ──────────────────────────────────────────────────────────
  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/bookings/my-bookings');
      if (res.success) {
        setBookings(res.data);
      }
    } catch (err) {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  /**
   * Action handler for the partner search timeout modal.
   * If 'extended', the booking remains in searching mode.
   * Otherwise, it's marked as dismissed for the current session.
   */
  const handleTimeoutAction = (action, updatedBooking) => {
    if (action === 'extended') {
      setDismissedTimeouts((prev) => {
        const updated = new Set(prev);
        updated.delete(updatedBooking._id);
        return updated;
      });
    } else {
      setDismissedTimeouts((prev) => new Set([...prev, updatedBooking._id]));
    }
    fetchBookings();
    setSelectedGroupBooking(null);
  };

  const shouldShowTimeoutModal = () => {
    return timedOutBooking && !dismissedTimeouts.has(timedOutBooking._id);
  };

  /**
   * eSewa Payment Integration
   * Orchestrates the redirect to the eSewa payment gateway.
   * 1. Fetches a signed transaction payload from our backend.
   * 2. Dynamically builds a hidden HTML form with eSewa required fields.
   * 3. Submits the form via standard POST redirect.
   */
  const handleEsewaPayment = async (booking) => {
    try {
      const toastId = toast.loading('Initiating eSewa payment...');
      const res = await api.post('/esewa/initiate-booking-payment', {
        booking_id: booking._id,
        amount: booking.amount,
      });

      if (res.success) {
        toast.dismiss(toastId);
        const { signature, transaction_uuid, amount, product_code } = res;

        const form = document.createElement('form');
        form.setAttribute('method', 'POST');
        form.setAttribute('action', 'https://rc-epay.esewa.com.np/api/epay/main/v2/form');
        form.setAttribute('target', '_self');
        form.style.display = 'none';

        const inputs = {
          amount: amount,
          tax_amount: '0',
          total_amount: amount,
          transaction_uuid: transaction_uuid,
          product_code: product_code,
          product_service_charge: '0',
          product_delivery_charge: '0',
          success_url: `http://localhost:5000/api/esewa/verify-payment`,
          failure_url: `${window.location.origin}/payment/failure`,
          signed_field_names: 'total_amount,transaction_uuid,product_code',
          signature: signature,
        };

        Object.entries(inputs).forEach(([key, value]) => {
          const hiddenField = document.createElement('input');
          hiddenField.setAttribute('type', 'hidden');
          hiddenField.setAttribute('name', key);
          hiddenField.setAttribute('value', value);
          form.appendChild(hiddenField);
        });

        document.body.appendChild(form);
        form.submit();
      } else {
        toast.error(res.message || 'Failed to initiate payment', { id: toastId });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error occurred during payment initiation');
    }
  };

  const handleViewReceipt = async (bookingId) => {
    try {
      const res = await api.get(`/payments/receipt/${bookingId}`);
      if (res.success) {
        setSelectedPaymentRecord(res.data);
        setIsReceiptModalOpen(true);
      }
    } catch (err) {
      toast.error('Receipt not available yet. Please try again later.');
    }
  };

  const handleRequestRefund = async () => {
    if (!refundTarget || !refundReason.trim()) return;

    try {
      const toastId = toast.loading('Processing refund request...');
      const receiptRes = await api.get(`/payments/receipt/${refundTarget._id}`);
      if (!receiptRes.success || !receiptRes.data) {
        throw new Error('Payment record not found');
      }

      const res = await api.put(`/payments/request-refund/${receiptRes.data._id}`, {
        reason: refundReason,
      });

      if (res.success) {
        toast.success('Refund requested and booking cancelled', { id: toastId });
        setIsRefundModalOpen(false);
        setRefundReason('');
        fetchBookings();
      } else {
        toast.error(res.message || 'Failed to request refund', { id: toastId });
      }
    } catch (error) {
      toast.error(typeof error === 'string' ? error : 'Error requesting refund');
    }
  };

  const openRefundModal = (booking) => {
    setRefundTarget(booking);
    setIsRefundModalOpen(true);
  };

  // ── Client-Side Filter ─────────────────────────────────────────────────────
  const term = searchTerm.toLowerCase();
  const displayedBookings = bookings.filter(
    (b) =>
      !term ||
      b.destinationName?.toLowerCase().includes(term) ||
      b.guideName?.toLowerCase().includes(term),
  );

  // ── Sub-Components ────────────────────────────────────────────────────────

  /**
   * GroupHub Component
   * A side-drawer that provides deep control over a specific booking,
   * including partner management, switching to private, and cancelling.
   */
  const GroupHub = ({ booking, onClose }) => {
    const userRaw = JSON.parse(sessionStorage.getItem('user') || '{}');
    const currentUser = { ...userRaw, id: userRaw.id || userRaw._id };
    const { guide, groupId, type, matchStatus, _id, guideName, travelerName, destinationName, amount } = booking;

    const otherTravelers = groupId?.members?.filter((m) => m.user?._id !== currentUser.id) || [];
    const [actionsLoading, setActionsLoading] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    const handleSwitchToPrivate = async () => {
      try {
        setActionsLoading(true);
        const toastId = toast.loading('Switching to private tour...');
        const response = await api.put(`/bookings/${_id}/switch-to-private`);

        if (response.success) {
          toast.success('Switched to private tour', { id: toastId });
          fetchBookings();
          onClose();
        } else {
          toast.error(response.message || 'Failed to switch to private', { id: toastId });
        }
      } catch (error) {
        toast.error('Error switching to private tour');
      } finally {
        setActionsLoading(false);
      }
    };

    const handleCancelBooking = async () => {
      setShowCancelConfirm(false);
      try {
        setActionsLoading(true);
        const toastId = toast.loading('Cancelling booking...');
        const response = await api.put(`/bookings/${_id}/cancel`, {
          reason: 'Cancelled by traveler',
        });

        if (response.success) {
          toast.success('Booking cancelled', { id: toastId });
          fetchBookings();
          onClose();
        } else {
          toast.error(response.message || 'Failed to cancel booking', { id: toastId });
        }
      } catch (error) {
        toast.error('Error cancelling booking');
      } finally {
        setActionsLoading(false);
      }
    };

    const handleGoToChat = async () => {
      try {
        setActionsLoading(true);
        const toastId = toast.loading('Initializing chat...');
        const response = await api.get(`/bookings/${_id}/chat`);

        if (response.success && response.data) {
          toast.dismiss(toastId);
          navigate('/chats', {
            state: {
              chatId: response.data._id,
              chatData: response.data,
              bookingType: type,
              guideName: guideName,
              destinationName: destinationName,
              travelerName: travelerName,
            },
          });
          toast.success('Chat initialized successfully');
        } else {
          toast.error(response.message || 'Failed to initialize chat', { id: toastId });
        }
      } catch (error) {
        const errorMsg = error?.response?.data?.error || error?.message || 'Error opening chat';
        toast.error(errorMsg);
      } finally {
        setActionsLoading(false);
      }
    };

    return (
      <>
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-[#0b1f3a]/40 backdrop-blur-sm" onClick={onClose} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter">
                  {destinationName}
                </h3>
                <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mt-0.5">
                  {type === 'split' ? 'Group Trip Hub' : 'Private Trip Hub'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
              >
                <FaArrowRight className="text-xs" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {matchStatus === 'partner_found' && (
                <PartnerSuggestionCard
                  booking={booking}
                  onRespond={(updatedBooking) => {
                    setSelectedGroupBooking(updatedBooking);
                    fetchBookings();
                  }}
                />
              )}

              {type === 'split' && matchStatus === 'searching' && (
                <PendingJoinRequestsCard
                  booking={booking}
                  onRequestResolved={(action) => {
                    fetchBookings();
                    if (action === 'accepted') {
                      toast.success('Match finalized! Check your group details below.');
                    }
                  }}
                />
              )}

              {/* Guide Section */}
              <section>
                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.28em] mb-3">
                  Your Guide
                </h4>
                <div className="flex items-center gap-3 bg-[#f8fafc] p-3.5 rounded-[16px] border border-slate-100 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.12)]">
                  <div className="w-12 h-12 rounded-[16px] bg-white shadow-sm overflow-hidden border border-slate-100 p-0.5">
                    <img
                      src={guide?.profileImage || 'https://ui-avatars.com/api/?name=Guide'}
                      alt=""
                      className="w-full h-full object-cover rounded-[16px]"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-black text-slate-900 leading-tight">{guideName}</p>
                    <p className="text-[9px] font-bold text-slate-500 mt-0.5">Local Expert • Trekking</p>
                  </div>
                  <div className="px-2.5 py-0.5 bg-amber-50 rounded-full border border-amber-100">
                    <span className="text-[8px] font-black text-amber-600 uppercase">Verified</span>
                  </div>
                </div>
              </section>

              {/* Travel Partners */}
              {type === 'split' && (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      Travel Partners
                    </h4>
                    {matchStatus === 'matched' && (
                      <span className="text-[9px] font-black text-emerald-500 uppercase bg-emerald-50 px-2 py-0.5 rounded-md">
                        Partner Matched!
                      </span>
                    )}
                    {matchStatus === 'partner_found' && (
                      <span className="text-[9px] font-black text-orange-500 uppercase bg-orange-50 px-2 py-0.5 rounded-md">
                        Review Suggestion
                      </span>
                    )}
                    {matchStatus === 'searching' && (
                      <span className="text-[9px] font-black text-amber-500 uppercase bg-amber-50 px-2 py-0.5 rounded-md">
                        Searching...
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    {otherTravelers.length > 0 ? (
                      otherTravelers.map((partner, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:border-emerald-200 transition-all group"
                        >
                          <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center overflow-hidden border border-emerald-100/50">
                            {partner.user?.profileImage ? (
                              <img
                                src={partner.user.profileImage}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <FaUser className="text-emerald-300 text-sm" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-black text-slate-900">{partner.user?.name}</p>
                              <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                            </div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">
                              Verified Traveler & Partner
                            </p>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center">
                            <FaCheckCircle className="text-emerald-500 text-sm" />
                          </div>
                        </div>
                      ))
                    ) : matchStatus === 'searching' ? (
                      <div className="text-center py-12 bg-slate-50/50 rounded-[32px] border-2 border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                          <FaUsers className="text-slate-200 text-xl" />
                        </div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
                          Searching for Partner
                        </p>
                        <p className="text-[9px] font-bold text-slate-300 uppercase">
                          Wait for one more traveler to join for 50% discount
                        </p>
                      </div>
                    ) : matchStatus === 'partner_found' ? (
                      <div className="text-center py-12 bg-orange-50/50 rounded-[32px] border-2 border-dashed border-orange-200">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                          <span className="text-2xl">✨</span>
                        </div>
                        <p className="text-xs font-black text-orange-600 uppercase tracking-widest mb-1">
                          Match Found!
                        </p>
                        <p className="text-[9px] font-bold text-orange-500 uppercase">
                          Scroll up to review & accept your partner
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-slate-50/50 rounded-[32px] border-2 border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                          <FaUsers className="text-slate-200 text-xl" />
                        </div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
                          No Partners Yet
                        </p>
                        <p className="text-[9px] font-bold text-slate-300 uppercase">
                          Check back soon for matches
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Cost Info */}
              <section className="bg-[#f8fafc] p-5 rounded-[16px] text-slate-900 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.12)] border border-slate-200">
                {type === 'split' ? (
                  <>
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.35em]">
                        Group Saving
                      </h4>
                      <span className="text-[9px] bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full font-black uppercase tracking-[0.2em]">
                        50% Off
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-slate-500 font-medium">Standard Guide Fee</span>
                        <span className="font-semibold text-slate-500 line-through opacity-70">NPR 2500</span>
                      </div>
                      <div className="flex justify-between items-end border-t border-slate-200/80 pt-2.5">
                        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500">
                          Your Share
                        </span>
                        <div className="text-right">
                          <div className="text-2xl font-extrabold tracking-tight leading-tight text-slate-900">
                            NPR {amount?.toLocaleString()}
                          </div>
                          <p className="text-[9px] text-slate-500 uppercase opacity-80 italic">
                            Price inclusive of all fees
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.35em]">
                        Trip Cost
                      </h4>
                    </div>
                    <div className="flex justify-between items-end border-t border-slate-200/80 pt-2.5">
                      <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500">
                        Total Amount
                      </span>
                      <div className="text-right">
                        <div className="text-2xl font-extrabold tracking-tight leading-tight text-slate-900">
                          NPR {amount?.toLocaleString()}
                        </div>
                        <p className="text-[9px] text-slate-500 uppercase opacity-80 italic">
                          Price inclusive of all fees
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </section>
            </div>

            <div className="p-5 bg-slate-50/50 border-t border-slate-100 flex flex-col gap-2">
              {booking.status === 'Accepted' && booking.paymentStatus === 'Unpaid' && (
                <button
                  onClick={() => handleEsewaPayment(booking)}
                  className="w-full py-3 bg-emerald-700 text-white rounded-[16px] font-black uppercase tracking-widest text-[9px] shadow-[0_20px_40px_-25px_rgba(16,185,129,0.35)] hover:bg-emerald-800 transition-all flex items-center justify-center gap-2"
                >
                  <FaCreditCard className="text-[10px]" /> Complete Payment
                </button>
              )}

              {booking.status === 'Accepted' ? (
                <button
                  onClick={handleGoToChat}
                  disabled={actionsLoading}
                  className="w-full py-3 bg-slate-900 text-white rounded-[16px] font-black uppercase tracking-widest text-[9px] shadow-[0_20px_40px_-25px_rgba(15,23,42,0.25)] hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <FaCommentDots className="text-[10px]" />{' '}
                  {type === 'split' ? 'Go to Group Chat' : 'Go to Chat'}
                </button>
              ) : (
                <div className="flex items-center justify-center gap-2 py-3 bg-slate-200 rounded-xl opacity-60">
                  <FaLock className="text-[9px] text-slate-400" />
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                    Chat unlocks on acceptance
                  </span>
                </div>
              )}

              {type === 'split' && ['searching', 'partner_found'].includes(matchStatus) && (
                <button
                  onClick={handleSwitchToPrivate}
                  disabled={actionsLoading}
                  className="w-full py-2.5 px-4 border border-amber-200 bg-amber-50 text-amber-700 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-amber-100 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {actionsLoading ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <span className="text-[10px]">🔒</span>
                  )}
                  Private Tour
                </button>
              )}

              {!['Cancelled', 'Paid', 'Declined'].includes(booking.status) && (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  disabled={actionsLoading}
                  className="w-full py-2.5 px-4 border border-red-200 bg-transparent text-red-600 rounded-[16px] font-black uppercase tracking-widest text-[9px] hover:bg-red-50 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {actionsLoading ? <FaSpinner className="animate-spin" /> : <span className="text-[10px]">✕</span>}
                  Cancel Booking
                </button>
              )}
            </div>
          </div>
        </div>

        <ConfirmationModal
          isOpen={showCancelConfirm}
          onClose={() => setShowCancelConfirm(false)}
          onConfirm={handleCancelBooking}
          title="Cancel Booking"
          message="Are you sure you want to cancel this booking? This action cannot be undone."
          confirmText="Yes, Cancel"
          cancelText="Keep Booking"
          type="danger"
        />

      </>
    );
  };

  /**
   * BookingCard Component
   * Individual row in the bookings list. Highlights status through color bars
   * and provides quick-action buttons for receipts or refunds.
   */
  const BookingCard = ({ booking }) => {
    const userRaw = JSON.parse(sessionStorage.getItem('user') || '{}');
    const currentUser = { ...userRaw, id: userRaw.id || userRaw._id };
    const {
      _id,
      destinationName,
      status,
      paymentStatus,
      type,
      guideName,
      date,
      amount,
      groupId,
      matchStatus,
      pendingRequestsList,
    } = booking;

    const otherMembers = groupId?.members?.filter((m) => m.user?._id !== currentUser.id) || [];

    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-3.5 flex flex-col md:flex-row items-center justify-between gap-3.5 transition-all group relative overflow-hidden">
        {/* Status Bar */}
        <div
          className={`absolute top-0 left-0 bottom-0 w-1.5 ${
            status === 'Cancelled' || status === 'Declined'
              ? 'bg-red-400'
              : paymentStatus === 'Paid' || status === 'Accepted'
              ? 'bg-emerald-400'
              : 'bg-amber-400'
          }`}
        />

        <div className="flex items-center gap-3.5 flex-1 w-full">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 shadow-sm transition-transform group-hover:scale-110 ${
              paymentStatus !== 'Paid' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
            }`}
          >
            <FaTicketAlt />
          </div>

          <div className="space-y-1 flex-1">
            <h3 className="text-base font-black text-slate-900 tracking-tighter flex items-center gap-2 flex-wrap">
              {destinationName}
              <div className="flex gap-2 flex-wrap">
                {pendingRequestsList?.length > 0 && (
                  <button
                    onClick={() => setSelectedGroupBooking(booking)}
                    className="text-[9px] bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-200 uppercase tracking-widest font-black hover:bg-blue-600 hover:text-white transition-all shadow-sm animate-pulse"
                  >
                    🔔 {pendingRequestsList.length} Request{pendingRequestsList.length > 1 ? 's' : ''} Waiting
                  </button>
                )}
                {matchStatus === 'partner_found' && (
                  <button
                    onClick={() => setSelectedGroupBooking(booking)}
                    className="text-[9px] bg-orange-50 text-orange-600 px-3 py-1 rounded-full border border-orange-200 uppercase tracking-widest font-black hover:bg-orange-600 hover:text-white transition-all shadow-sm animate-pulse"
                  >
                    🔔 Partner Waiting
                  </button>
                )}
                {status === 'Accepted' && paymentStatus === 'Unpaid' && (
                  <button
                    onClick={() => setSelectedGroupBooking(booking)}
                    className="text-[9px] bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full border border-emerald-100 uppercase tracking-widest font-black hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                  >
                    Ready to Pay
                  </button>
                )}
                {status === 'Pending' && (
                  <button
                    disabled
                    className="text-[9px] bg-amber-50 text-amber-600 px-3 py-1 rounded-full border border-amber-100 uppercase tracking-widest font-black opacity-60 cursor-not-allowed"
                  >
                    Awaiting Guide
                  </button>
                )}
                {type === 'split' && (
                  <span className="text-[9px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded-lg border border-orange-100 uppercase tracking-[0.1em] font-black">
                    Split Tour
                  </span>
                )}
              </div>
            </h3>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-bold items-center">
              <div className="flex items-center gap-2 text-slate-500 hover:text-slate-600 transition-colors">
                <FaUser className="text-amber-500 text-xs" />
                <span>
                  Guide: <span className="text-slate-800">{guideName}</span>
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <FaCalendarAlt className="text-emerald-500 text-xs" />
                <span className="text-slate-800">
                  {new Date(date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>

              {type === 'split' && (
                <div className="flex items-center gap-3 pl-4 border-l border-slate-200 ml-2">
                  <FaUsers className="text-orange-500 text-sm" />
                  {otherMembers.length > 0 ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 uppercase tracking-tighter font-black">
                        Partner:
                      </span>
                      <div className="flex items-center gap-1.5 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100 shadow-sm">
                        <div className="w-4 h-4 rounded-full bg-orange-200 overflow-hidden border border-white">
                          {otherMembers[0].user?.profileImage ? (
                            <img
                              src={otherMembers[0].user.profileImage}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[8px] text-orange-600 font-black">
                              {otherMembers[0].user?.name?.[0]}
                            </div>
                          )}
                        </div>
                        <span className="text-[11px] text-orange-700 font-black tracking-tight">
                          {otherMembers[0].user?.name}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-black italic animate-pulse tracking-tight">
                      Searching for Partner...
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end bg-slate-50/50 p-4 md:p-0 rounded-2xl md:bg-transparent">
          <div className="text-right min-w-[80px]">
            <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-0.5">
              Estimated Cost
            </p>
            <div className="flex items-center justify-end gap-1 font-black text-slate-900 text-xl tracking-tighter">
              <span className="text-[10px] font-bold text-slate-400">NPR</span>
              {amount?.toLocaleString() || '0'}
            </div>
          </div>

          <div className="min-w-[120px] flex justify-end gap-2">
            {paymentStatus === 'Refunded' ? (
              <div className="flex flex-col items-center gap-2 text-red-600 bg-red-50 p-2 rounded-xl border border-red-100 w-full">
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Refunded</span>
                <span className="text-[8px] font-bold text-red-400 uppercase">Amount Returned</span>
              </div>
            ) : paymentStatus === 'Refund Pending' ? (
              <div className="flex flex-col items-center gap-2 text-orange-600 bg-orange-50 p-2 rounded-xl border border-orange-100 animate-pulse w-full">
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Refund Pending</span>
                <span className="text-[8px] font-bold text-orange-400 uppercase">Processing...</span>
              </div>
            ) : status === 'Cancelled' ? (
              <div className="flex flex-col items-center gap-2 text-red-600 w-full">
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Cancelled</span>
              </div>
            ) : status === 'Declined' ? (
              <div className="flex flex-col items-center gap-2 text-red-600 w-full">
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Declined</span>
                <span className="text-[8px] font-bold text-red-400 uppercase">Guide declined this booking</span>
              </div>
            ) : paymentStatus === 'Paid' ? (
              <div className="flex gap-2">
                <button
                  onClick={() => handleViewReceipt(_id)}
                  className="px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg font-black uppercase tracking-widest text-[9px] hover:bg-emerald-100 transition-all"
                  title="View Official Receipt"
                >
                  Receipt
                </button>
                <button
                  onClick={() => {
                    setRefundConfirmBooking(booking);
                    setShowRefundConfirm(true);
                  }}
                  className="px-4 py-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg font-black uppercase tracking-widest text-[9px] hover:bg-slate-100 transition-all"
                  title="Request Refund & Cancel"
                >
                  Request Refund
                </button>
              </div>
            ) : status === 'Accepted' ? (
              <div className="flex flex-col items-center gap-2 text-emerald-600">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 shadow-sm animate-pulse">
                  <FaClock />
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Awaiting Payment</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-amber-600">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-50 border border-amber-100 shadow-sm animate-pulse">
                  <FaClock />
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Pending</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-xl font-black text-[#0b1f3a] uppercase tracking-tighter">My Bookings</h2>
        <FaTicketAlt className="text-amber-500 w-5 h-5" />
      </div>

      <div className="flex-1 min-h-0">
        {displayedBookings.length > 0 ? (
          <div className="space-y-3.5">
            {displayedBookings.map((booking) => (
              <BookingCard key={booking._id} booking={booking} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
              <FaHiking />
            </div>
            {bookings.length > 0 && searchTerm ? (
              <>
                <h3 className="text-lg font-bold text-slate-700 uppercase tracking-tight">No matching bookings</h3>
                <p className="text-slate-500 mt-1 mb-8 text-sm italic">Try a different destination or guide name.</p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold text-slate-700 uppercase tracking-tight">No past bookings found</h3>
                <p className="text-slate-500 mt-1 mb-8 text-sm italic">You haven't booked any local guides yet.</p>
                <button
                  onClick={() => navigate('/guides')}
                  className="px-8 py-3 bg-[#0b1f3a] text-white rounded-lg font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-blue-900/10 hover:bg-amber-600 transition-all font-black"
                >
                  Find a Local Guide
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {selectedGroupBooking && (
        <GroupHub booking={selectedGroupBooking} onClose={() => setSelectedGroupBooking(null)} />
      )}

      {/* Search Timeout Modal */}
      {shouldShowTimeoutModal() && (
        <SearchTimeoutModal
          booking={timedOutBooking}
          onClose={() => setDismissedTimeouts((prev) => new Set([...prev, timedOutBooking._id]))}
          onAction={handleTimeoutAction}
        />
      )}

      {/* Receipt Modal */}
      <Modal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        title={null}
        size="md"
        id="receipt-modal"
      >
        <ReceiptCard payment={selectedPaymentRecord} />
      </Modal>

      {/* Refund Request Modal */}
      <Modal
        isOpen={isRefundModalOpen}
        onClose={() => setIsRefundModalOpen(false)}
        title={null}
        size="md"
      >
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Reason for cancellation
              </label>
              <span className="text-[9px] font-black text-slate-300 uppercase italic">Required</span>
            </div>
            <textarea
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="Please tell us why you are requesting a refund..."
              className="w-full h-32 bg-slate-50 border border-slate-100 rounded-[20px] p-4 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0b1f3a]/10 transition-all resize-none shadow-inner"
            />
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center">
              Cancelling trip to <span className="text-slate-900 font-black">{refundTarget?.destinationName}</span>.
            </p>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={() => setIsRefundModalOpen(false)}
              className="flex-1 py-3 bg-slate-50 text-slate-400 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-slate-100 transition-all"
            >
              Back
            </button>
            <button
              onClick={handleRequestRefund}
              className="flex-[2] py-3 bg-red-600 text-white rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-red-700 transition-all shadow-lg shadow-red-500/20"
            >
              Confirm Cancellation <FaUndo className="inline ml-1 text-[8px]" />
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmationModal
        isOpen={showRefundConfirm}
        onClose={() => setShowRefundConfirm(false)}
        onConfirm={() => {
          setShowRefundConfirm(false);
          openRefundModal(refundConfirmBooking);
          setRefundConfirmBooking(null);
        }}
        title="Request Refund"
        message="Are you sure you want to request a refund for this booking?"
        confirmText="Yes, Request Refund"
        cancelText="Cancel"
        type="warning"
      />
    </div>
  );
};

export default BookingsPage;
