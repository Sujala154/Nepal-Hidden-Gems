import React, { useEffect } from 'react';
import { MdClose } from 'react-icons/md';

const Modal = ({ isOpen, onClose, title, children, size = 'md', id }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        <div id={id} className={`inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle ${sizes[size]} w-full`}>
          <div className="bg-white p-4 sm:p-5 relative">
            {title && (
              <h3 className="text-lg font-medium text-gray-900 mb-4 pr-8">{title}</h3>
            )}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 focus:outline-none p-1 hover:bg-slate-50 rounded-full transition-colors z-10"
            >
              <MdClose className="h-6 w-6" />
            </button>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;

