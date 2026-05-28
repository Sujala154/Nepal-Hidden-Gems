import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTimesCircle } from 'react-icons/fa';

const PaymentFailure = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-sm w-full bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
        {/* Error Icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-500 mb-4 shadow-sm">
          <FaTimesCircle className="text-3xl" />
        </div>
        
        {/* Heading */}
        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2 text-center">Payment Failed</h1>
        
        {/* Message */}
        <p className="text-xs text-slate-500 text-center mb-5 leading-relaxed">
          Your eSewa payment could not be completed. Please try again or contact support if the issue persists.
        </p>
        
        {/* Button */}
        <button
          onClick={() => navigate('/bookings')}
          className="w-full py-3 bg-[#0b1f3a] text-white rounded-xl font-black uppercase tracking-widest text-[9px] shadow-md hover:bg-slate-800 transition-all active:scale-95"
        >
          Back to My Bookings
        </button>
      </div>
    </div>
  );
};

export default PaymentFailure;
