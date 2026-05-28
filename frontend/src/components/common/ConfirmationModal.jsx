import React from 'react';
import { FaTrash, FaTimes } from 'react-icons/fa';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'danger' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#0b1f3a]/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 font-sans">


        {/* Content - Tightened */}
        <div className="px-6 pt-6 pb-4 text-center">
          <div className={`w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center text-xl ${
            type === 'danger' ? 'bg-slate-50 text-[#0b1f3a]' : 'bg-primary-lightYellow text-primary-darkBrown'
          }`}>
            <FaTrash />
          </div>
          
          <h3 className="text-lg font-black text-[#0b1f3a] uppercase tracking-tight mb-1">
            {title}
          </h3>
          <p className="text-[11px] text-slate-500 leading-snug max-w-[240px] mx-auto">
            {message}
          </p>
        </div>

        {/* Footer Actions - Compact */}
        <div className="p-4 bg-slate-50 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-3 bg-white border border-slate-200 text-slate-400 rounded-lg font-black uppercase tracking-widest text-[9px] hover:bg-slate-100 transition-all font-sans"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 px-3 rounded-lg font-black uppercase tracking-widest text-[9px] shadow-lg transition-all transform active:scale-95 font-sans ${
              type === 'danger' 
                ? 'bg-[#0b1f3a] text-white shadow-blue-900/10 hover:bg-[#1a3a5f]' 
                : 'bg-[#0b1f3a] text-white shadow-blue-900/20 hover:bg-amber-600'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
