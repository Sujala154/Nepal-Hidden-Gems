import { GoogleLogin } from '@react-oauth/google';
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaMountain, FaGoogle, FaTimes } from "react-icons/fa";

const LoginForm = ({ onSignupClick, onSuccess, onClose }) => {
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name] || errors.general) {
      setErrors({ ...errors, [e.target.name]: "", general: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    if (!formData.email || !formData.password) {
      setErrors({ general: "Please fill in all fields" });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        if (data.requiresVerification) {
          if (onSuccess) onSuccess();
          navigate("/verify-otp", {
            state: { email: formData.email, message: "Please verify your email before logging in." },
          });
          return;
        }
        throw new Error(data.error || "Login failed");
      }



      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("user", JSON.stringify(data.user));

      if (onSuccess) onSuccess();

      if (data.user.role === 'admin') navigate("/admin");
      else if (data.user.role === 'contributor') navigate("/contributor");
      else if (data.user.role === 'guide') navigate("/guide/tours");
      else navigate("/dashboard");
    } catch (error) {
      setErrors({ general: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[500px] bg-white rounded-lg border border-slate-200 overflow-hidden relative shadow-lg">
      {/* Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 w-8 h-8 bg-slate-50 hover:bg-slate-100 text-slate-400 border border-slate-100 rounded-lg flex items-center justify-center transition-all active:scale-95"
        >
          <FaTimes className="text-xs" />
        </button>
      )}

      {/* Form Container */}
      <div className="p-8 md:p-10 flex flex-col custom-scrollbar">
        <div className="flex flex-col items-center text-center mb-8 pt-4">
          <div>
            <h1 className="text-2xl font-black text-[#0b1f3a] tracking-tight">
              Welcome back
            </h1>
          </div>
        </div>

        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm font-bold animate-in slide-in-from-top-2">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaEnvelope className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="sujalaadhikari918@gmail.com"
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-lg 
                           focus:outline-none focus:ring-1 focus:ring-[#0b1f3a] 
                           text-slate-900 placeholder:text-slate-300 font-medium transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2 ml-1">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Password</label>
              <Link
                to="/forgot-password"
                onClick={onSuccess}
                className="text-[10px] font-black uppercase tracking-widest hover:underline text-[#0b1f3a]"
              >
                Forgot password?
              </Link>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaLock className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-11 pr-12 py-3 bg-white border border-slate-200 rounded-lg 
                           focus:outline-none focus:ring-1 focus:ring-[#0b1f3a] 
                           text-slate-900 placeholder:text-slate-300 font-medium transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white py-3.5 rounded-lg font-black uppercase tracking-[0.1em] text-xs
                       transition-all shadow-md disabled:opacity-50 active:scale-[0.98]
                       bg-gradient-to-r from-amber-500 to-orange-600 hover:shadow-orange-500/20 shadow-lg"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <div className="mt-8 flex flex-col items-center gap-6">
          <div className="w-full">
            <div className="flex items-center justify-center gap-4 mb-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span className="h-px flex-1 bg-slate-100" />
              Social
              <span className="h-px flex-1 bg-slate-100" />
            </div>
            <div className="flex justify-center social-login-minimal">
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  fetch("/api/auth/google-login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ credential: credentialResponse.credential }),
                  })
                    .then(async res => {
                      const data = await res.json();
                      if (!res.ok) throw new Error(data.error || "Google login failed");
                      return data;
                    })
                    .then(data => {
                      if (data.success) {
                        sessionStorage.setItem("token", data.token);
                        sessionStorage.setItem("user", JSON.stringify(data.user));
                        if (onSuccess) onSuccess();
                        
                        if (data.user.role === 'admin') navigate("/admin");
                        else if (data.user.role === 'contributor') navigate("/contributor");
                        else if (data.user.role === 'guide') navigate("/guide/tours");
                        else navigate("/dashboard");
                      }
                    })
                    .catch(err => setErrors({ general: err.message }));
                }}
                onError={() => alert("Google login failed")}
              />
            </div>
          </div>

          <p className="text-[11px] font-medium text-slate-500 text-center">
            Don't have an account?{" "}
            <button onClick={onSignupClick} className="font-black text-[#0b1f3a] hover:underline uppercase tracking-widest ml-1">
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
