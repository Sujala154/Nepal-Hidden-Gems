import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FaLock, FaEye, FaEyeSlash, FaMountain, FaCheck } from "react-icons/fa";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError("Invalid reset token");
      return;
    }
    if (!formData.password || formData.password !== formData.confirmPassword) {
      setError("Passwords must match and not be empty");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: formData.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reset failed");
      setSuccess(true);
      setTimeout(() => navigate("/"), 1800); // Redirect to home/login
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-6 md:p-8 flex flex-col justify-center">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-[#0b1f3a] flex items-center justify-center border border-slate-700 shadow-sm">
              <FaMountain className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Nepal Hidden Gems</p>
              <p className="text-sm font-bold text-[#0b1f3a] leading-none">Recovery Portal</p>
            </div>
          </Link>

          {success ? (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 text-center animate-in fade-in zoom-in-95 duration-500">
               <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCheck className="text-xl" />
               </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Password reset successful</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                Your password has been successfully updated. Redirecting you to the login portal...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <h1 className="text-2xl font-black text-[#0b1f3a] mb-1.5 tracking-tight">Set a new password</h1>
                <p className="text-slate-500 text-sm font-medium">Use a strong password to keep your account secure.</p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-xs font-bold animate-in slide-in-from-top-2">
                  {error}
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">New password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <FaLock className="h-3.5 w-3.5 text-slate-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter new password"
                      className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-900 placeholder:text-slate-300 transition-all text-sm font-medium"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-amber-500 transition-colors"
                    >
                      {showPassword ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Confirm password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <FaLock className="h-3.5 w-3.5 text-slate-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm new password"
                      className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-900 placeholder:text-slate-300 transition-all text-sm font-medium"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-amber-500 transition-colors"
                    >
                      {showConfirmPassword ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0b1f3a] text-white py-3 rounded-xl font-black uppercase tracking-[0.1em] text-xs hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 disabled:opacity-50 active:scale-[0.98]"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <Link to="/login" className="text-[10px] font-bold text-slate-400 hover:text-[#0b1f3a] transition-colors uppercase tracking-widest flex items-center gap-1.5">
                  <span className="text-sm">←</span> Back to login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
