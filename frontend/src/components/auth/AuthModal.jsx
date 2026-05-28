import React, { useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

const AuthModal = () => {
  const { isAuthModalOpen, authModalMode, openAuthModal, closeAuthModal } = useAuth();
  const modalRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") closeAuthModal();
    };

    if (isAuthModalOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEscape);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isAuthModalOpen, closeAuthModal]);

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      closeAuthModal();
    }
  };

  if (!isAuthModalOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-slate-900/60 backdrop-blur-sm transition-all duration-300 animate-in fade-in"
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalRef}
        className="relative w-full max-w-6xl animate-in zoom-in-95 duration-300 pointer-events-auto"
      >
        {authModalMode === 'login' ? (
          <LoginForm 
            onSignupClick={() => openAuthModal('signup')} 
            onSuccess={closeAuthModal} 
            onClose={closeAuthModal}
          />
        ) : (
          <SignupForm 
            onLoginClick={() => openAuthModal('login')} 
            onSuccess={closeAuthModal} 
            onClose={closeAuthModal}
          />
        )}
      </div>
    </div>
  );
};

export default AuthModal;
