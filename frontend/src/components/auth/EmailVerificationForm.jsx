import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';

const EmailVerificationForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const { verifyEmail } = useAuth();

  React.useEffect(() => {
    if (token) {
      handleVerify();
    }
  }, [token]);

  const handleVerify = async () => {
    if (!token) return;
    
    setLoading(true);
    const result = await verifyEmail(token);
    setLoading(false);

    if (result.success) {
      setVerified(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }
  };

  if (verified) {
    return (
      <div className="text-center">
        <div className="mb-4">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Email Verified!</h3>
        <p className="text-sm text-gray-600">Redirecting to login...</p>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="text-center">
        <p className="text-red-600 mb-4">Invalid verification token</p>
        <Button onClick={() => navigate('/login')}>Go to Login</Button>
      </div>
    );
  }

  return (
    <div className="text-center">
      {loading ? (
        <>
          <div className="mb-4">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
              <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          </div>
          <p className="text-gray-600">Verifying your email...</p>
        </>
      ) : (
        <Button onClick={handleVerify}>Verify Email</Button>
      )}
    </div>
  );
};

export default EmailVerificationForm;

