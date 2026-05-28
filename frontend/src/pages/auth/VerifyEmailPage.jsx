import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaEnvelope } from 'react-icons/fa';
import { buildApiUrl } from '../../utils/backendUrls';

const VerifyEmailPage = () => {
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const verifyEmail = async () => {
      const queryParams = new URLSearchParams(location.search);
      const token = queryParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link');
        return;
      }

      try {
        const response = await fetch(buildApiUrl(`/auth/verify-email?token=${token}`));
        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message);
        } else {
          setStatus('error');
          setMessage(data.error || 'Verification failed');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Network error. Please try again.');
      }
    };

    verifyEmail();
  }, [location.search]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {status === 'verifying' && (
          <>
            <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <FaEnvelope className="h-10 w-10 text-blue-500 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Verifying Your Email</h2>
            <p className="text-slate-600">Please wait while we verify your email address...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
              <FaCheckCircle className="h-10 w-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Email Verified!</h2>
            <p className="text-slate-600 mb-6">{message}</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-bold hover:from-blue-600 hover:to-blue-700 transition-all"
            >
              Go to Login
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6">
              <FaTimesCircle className="h-10 w-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Verification Failed</h2>
            <p className="text-slate-600 mb-6">{message}</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-bold hover:from-blue-600 hover:to-blue-700 transition-all mb-3"
            >
              Go to Login
            </button>
            <button
              onClick={() => navigate('/resend-verification')}
              className="w-full bg-slate-100 text-slate-700 py-3 rounded-lg font-bold hover:bg-slate-200 transition-all"
            >
              Resend Verification Email
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;