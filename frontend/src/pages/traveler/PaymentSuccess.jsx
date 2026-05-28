/**
 * PaymentSuccess.jsx
 *
 * Landing page after a successful eSewa payment redirect.
 * Reads `bookingId`, `txId`, and `amount` from URL query parameters
 * (set by the eSewa callback) and fetches the matching payment record
 * to render a downloadable receipt via ReceiptCard.
 *
 * Two-step view:
 *   1. Confirmation screen — shows the transaction ID and amount paid.
 *   2. Receipt view — renders the full ReceiptCard with autoDownload enabled.
 */
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaArrowLeft, FaFileInvoice, FaSpinner } from 'react-icons/fa';
import api from '../../services/api';
import ReceiptCard from '../../components/traveler/ReceiptCard';

/** Parses the current URL's query string into a URLSearchParams instance. */
const useQuery = () => new URLSearchParams(useLocation().search);

const PaymentSuccess = () => {
  const query = useQuery();
  const navigate = useNavigate();

  // ── State ──────────────────────────────────────────────────────────────────
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReceipt, setShowReceipt] = useState(false);
  const [error, setError] = useState(null);

  // Query params populated by eSewa's payment callback redirect
  const bookingId = query.get('bookingId');
  const txId = query.get('txId') || 'N/A';
  const amount = query.get('amount') || '0';

  // ── Data Fetching ──────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchPayment = async () => {
      if (!bookingId) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get(`/payments/receipt/${bookingId}`);
        if (res.success) {
          setPaymentData(res.data);
        } else {
          setError('Receipt not found. Please contact support.');
        }
      } catch (err) {
        setError(typeof err === 'string' ? err : 'Failed to load receipt details');
      } finally {
        setLoading(false);
      }
    };

    fetchPayment();
  }, [bookingId]);

  // ── Loading State ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <FaSpinner className="text-amber-500 text-4xl animate-spin" />
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 py-12 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] animate-in fade-in duration-500">
      {!showReceipt ? (
        /* ── Step 1: Confirmation screen ── */
        <div className="bg-white p-10 rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mt-16 -mr-16 blur-2xl group-hover:bg-emerald-100 transition-colors duration-700" />

          <div className="relative z-10 space-y-6">
            <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center text-5xl mx-auto shadow-sm ring-4 ring-emerald-100/50 mb-6 group-hover:scale-110 transition-transform duration-500">
              <FaCheckCircle />
            </div>

            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Payment Successful!</h1>

            <p className="text-sm font-bold text-slate-500 max-w-xs mx-auto">
              Your payment has been successfully processed and confirmed. You are ready to go!
            </p>

            {/* Transaction summary block */}
            <div className="bg-slate-50 rounded-2xl p-6 text-left border border-slate-100 space-y-4 shadow-inner">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Transaction ID</span>
                <span className="text-xs font-black text-slate-800">{txId}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Amount Paid</span>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-600 mr-1">NPR</span>
                  <span className="text-xl font-black text-slate-900 tracking-tighter">{Number(amount).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => setShowReceipt(true)}
                className="w-full py-4 bg-emerald-500 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
              >
                <FaFileInvoice /> View Official Receipt
              </button>
              <button
                onClick={() => navigate('/bookings')}
                className="w-full py-4 bg-[#0b1f3a] text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-[#0b1f3a]/20 hover:bg-amber-600 transition-all flex items-center justify-center gap-2"
              >
                <FaArrowLeft /> Back to My Bookings
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ── Step 2: Full receipt view — ReceiptCard handles the PDF download ── */
        <div className="w-full max-w-lg space-y-6 animate-in zoom-in-95 duration-300">
          {paymentData ? (
            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-slate-100">
              <ReceiptCard payment={paymentData} autoDownload={true} />
            </div>
          ) : (
            <div className="bg-white p-8 rounded-3xl shadow-xl text-center border border-slate-100">
              <div className="text-amber-500 text-4xl mb-4">⚠️</div>
              <h3 className="text-lg font-black text-slate-800 mb-2 uppercase tracking-widest">Receipt Unavailable</h3>
              <p className="text-xs text-slate-500 mb-6">{error || "We couldn't retrieve your official receipt at this moment."}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-colors"
              >
                Retry Loading
              </button>
            </div>
          )}

          <button
            onClick={() => setShowReceipt(false)}
            className="w-full py-3 bg-white border border-slate-200 text-slate-400 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-slate-50 transition-all print:hidden"
          >
            Back to Confirmation
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentSuccess;
