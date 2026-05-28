import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaEnvelope, FaCheckCircle, FaTimesCircle, FaArrowLeft } from 'react-icons/fa';
import { buildApiUrl } from '../../utils/backendUrls';

const VerifyOTPPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [timer, setTimer] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    // Get email from location state or sessionStorage
    const userEmail = location.state?.email || JSON.parse(sessionStorage.getItem('pendingVerification') || '{}').email;

    if (!userEmail) {
      navigate('/signup');
      return;
    }

    setEmail(userEmail);

    // Start timer
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [location.state, navigate]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(buildApiUrl('/auth/verify-otp'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp: otpCode }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message);

        // Clear pending verification
        sessionStorage.removeItem('pendingVerification');

        // Handle Guide Approval Required state
        if (data.requiresApproval) {
          setTimeout(() => {
            navigate('/login', {
              state: {
                message: 'Email verified! Your account is now pending admin approval. You will be notified once you can log in.',
                email
              }
            });
          }, 3000);
          return;
        }

        // Auto-login logic for other roles
        if (data.token && data.user) {
          sessionStorage.setItem('token', data.token);
          sessionStorage.setItem('user', JSON.stringify(data.user));

          // Redirect based on role
          setTimeout(() => {
            if (data.user.role === 'admin') navigate('/admin');
            else if (data.user.role === 'contributor') navigate('/contributor-dashboard');
            else if (data.user.role === 'guide') navigate('/guide/tours');
            else navigate('/dashboard');
          }, 1500);
        } else {
          // Fallback if no token returned (legacy behavior)
          setTimeout(() => {
            navigate('/login', {
              state: {
                message: 'Email verified successfully! You can now login.',
                email
              }
            });
          }, 2000);
        }
      } else {
        setError(data.error || 'Verification failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(buildApiUrl('/auth/resend-otp'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage('New OTP sent to your email!');
        setTimer(300); // Reset timer to 5 minutes
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        document.getElementById('otp-0').focus();
      } else {
        setError(data.error || 'Failed to resend OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <button
          onClick={() => navigate('/signup')}
          className="flex items-center gap-2 text-slate-500 hover:text-[#0b1f3a] mb-8 font-bold uppercase text-xs tracking-widest transition-colors"
        >
          <FaArrowLeft className="w-3 h-3" />
          Back to Signup
        </button>

        {/* Main Card */}
        <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 p-8 md:p-10 border border-slate-100">
          <div className="text-center mb-10">
            <div className="w-16 h-16 mx-auto bg-[#0b1f3a] rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-slate-900/20">
              <FaEnvelope className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-black text-[#0b1f3a] tracking-tight mb-2">Verify Your Email</h1>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">
              Enter the 6-digit code sent to<br />
              <span className="font-bold text-[#0b1f3a]">{email}</span>
            </p>
          </div>

          {/* OTP Input */}
          <form onSubmit={handleSubmit} className="mb-8">
            <div className="flex justify-center gap-2 mb-8">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-bold bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-500/10 outline-none transition-all text-[#0b1f3a]"
                  autoFocus={index === 0}
                />
              ))}
            </div>

            {/* Timer */}
            <div className="text-center mb-8">
              <div className={`text-xs font-black uppercase tracking-widest ${timer < 60 ? 'text-red-500' : 'text-slate-400'}`}>
                Code expires in: <span className="text-slate-700 font-bold ml-1">{formatTime(timer)}</span>
              </div>
              {canResend && (
                <div className="text-xs text-amber-600 font-bold mt-2">
                  Code expired. Please request a new one.
                </div>
              )}
            </div>

            {/* Messages */}
            {message && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl flex items-center gap-3 text-sm font-bold">
                <FaCheckCircle className="w-4 h-4" />
                {message}
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-3 text-sm font-bold">
                <FaTimesCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || otp.join('').length !== 6}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-4 rounded-xl font-black uppercase tracking-[0.1em] text-xs hover:shadow-lg hover:shadow-orange-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4 active:scale-[0.98]"
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>

            {/* Resend Button */}
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={loading || !canResend}
              className="w-full bg-slate-50 text-slate-600 border border-slate-200 py-4 rounded-xl font-black uppercase tracking-[0.05em] text-xs hover:bg-slate-100 hover:text-[#0b1f3a] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Resend Code {canResend ? '' : `(${formatTime(timer)})`}
            </button>
          </form>

          {/* Help Text */}
          <div className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-wide">
            <p>Didn't receive the code? Check your spam folder</p>
          </div>
        </div>

        {/* Already Verified? */}
        <div className="text-center mt-8">
          <p className="text-slate-500 text-xs font-bold">
            Already verified?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-[#0b1f3a] hover:underline uppercase tracking-widest ml-1"
            >
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTPPage;