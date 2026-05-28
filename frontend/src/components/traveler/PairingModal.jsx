import React from 'react';

const PairingModal = ({ isOpen, partnerName, onAccept, onDecline }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 font-sans">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
        {/* Header */}
        <div className="p-6 bg-primary-lightYellow border-b border-primary-darkBrown border-opacity-10">
          <h3 className="text-xl font-bold text-primary-darkBrown uppercase tracking-tight">
            Split Tour Found!
          </h3>
        </div>

        {/* Body */}
        <div className="p-8 text-center">
          <div className="w-20 h-20 bg-primary-red bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">✨</span>
          </div>
          <p className="text-lg font-medium text-slate-800 leading-relaxed mb-2">
            Would you like to get paired with <span className="font-bold text-primary-red">{partnerName}</span>?
          </p>
          <p className="text-sm text-slate-500 italic">
            Pairing with another traveler saves you 50% on guide fees!
          </p>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 flex gap-4">
          <button
            onClick={onAccept}
            className="flex-1 py-3 bg-primary-red text-white rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-red-500/20 hover:bg-primary-maroon transition-all transform active:scale-95"
          >
            Accept
          </button>
          <button
            onClick={onDecline}
            className="flex-1 py-3 bg-primary-lightYellow text-primary-darkBrown rounded-xl font-bold uppercase tracking-widest text-xs border border-primary-darkBrown border-opacity-10 hover:bg-opacity-80 transition-all transform active:scale-95"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
};

export default PairingModal;
