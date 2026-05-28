import { GoogleLogin } from '@react-oauth/google';
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaUser,
  FaCompass,
  FaCamera,
  FaMapMarkedAlt,
  FaGoogle,
  FaFileUpload,
  FaTimes,
  FaShieldAlt,
  FaMountain,
  FaPhone,
} from "react-icons/fa";

const roleOptions = [
  { value: "traveler", label: "Traveler", icon: FaCompass, description: "Discover hidden gems" },
  { value: "contributor", label: "Contributor", icon: FaCamera, description: "Share your discoveries" },
  { value: "guide", label: "Guide", icon: FaMapMarkedAlt, description: "Lead amazing adventures" },
];

const specialtyOptions = [
  "Trekking", "Cultural Tours", "Mountain Biking", "History", "Wildlife", "Photography",
  "Adventure Sports", "Religious Sites", "Local Cuisine", "Hiking", "Camping",
  "Backpacking", "Climbing", "River Rafting", "Yoga & Meditation", "Bird Watching",
  "Architecture", "Art & Crafts", "Folk Music"
];
const languageOptions = [
  "Nepali", "English", "Hindi", "French", "Spanish", "German", "Japanese",
  "Chinese", "Korean", "Italian", "Portuguese", "Russian", "Arabic", "Hebrew",
  "Thai", "Vietnamese", "Turkish", "Greek", "Tibetan", "Sherpa"
];

const SignupForm = ({ onLoginClick, onSuccess, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "traveler",
    bio: "",
    specialty: [],
    languages: [],
    phoneNumber: "",
    verification_documents: [],
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedFiles, setSelectedFiles] = useState([]);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = e.target.checked;
      const fieldName = name.includes("specialty") ? "specialty" : "languages";
      const optionValue = name.split("_")[1];
      setFormData((prev) => {
        const currentArray = prev[fieldName] || [];
        const newArray = checked ? [...currentArray, optionValue] : currentArray.filter((item) => item !== optionValue);
        return { ...prev, [fieldName]: newArray };
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name] || errors.general) setErrors({ ...errors, [name]: "", general: "" });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => file.size <= 5 * 1024 * 1024);
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index) => setSelectedFiles(prev => prev.filter((_, i) => i !== index));

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      let docs = [];
      if (selectedFiles.length > 0) {
        docs = await Promise.all(selectedFiles.map(async (f) => ({
          filename: f.name,
          url: await convertFileToBase64(f),
          uploadedAt: new Date().toISOString(),
        })));
      }

      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, verification_documents: docs.length ? docs : undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      if (onSuccess) onSuccess();
      navigate("/verify-otp", { state: { email: formData.email, message: data.message } });
    } catch (error) {
      setErrors({ general: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[500px] bg-white rounded-lg border border-slate-200 overflow-hidden relative shadow-lg h-fit max-h-[90vh]">
      {/* Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 w-8 h-8 bg-slate-50 hover:bg-slate-100 text-slate-400 border border-slate-100 rounded-lg flex items-center justify-center transition-all active:scale-95"
        >
          <FaTimes className="text-xs" />
        </button>
      )}

      {/* Form Content */}
      <div className="p-8 md:p-10 flex flex-col custom-scrollbar overflow-y-auto max-h-[90vh]">
        <div className="flex flex-col items-center text-center mb-8 pt-4">
          <div>
            <h1 className="text-2xl font-black text-[#0b1f3a] tracking-tight">Create Account</h1>
          </div>
        </div>

        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm font-bold animate-in slide-in-from-top-2">
            {errors.general}
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 mb-8">
          {roleOptions.map((role) => {
            const Icon = role.icon;
            const active = formData.role === role.value;
            return (
              <button
                key={role.value}
                type="button"
                onClick={() => setFormData({ ...formData, role: role.value })}
                className={`p-3 rounded-lg border text-center transition-all group ${active
                  ? "border-[#0b1f3a] bg-slate-50 shadow-sm"
                  : "border-slate-100 bg-white hover:border-slate-200"
                  }`}
              >
                <div className={`w-8 h-8 rounded-md flex items-center justify-center mx-auto mb-2 transition-colors ${active ? "bg-[#0b1f3a]" : "bg-slate-50 group-hover:bg-slate-100"}`}>
                  <Icon className={`w-3.5 h-3.5 ${active ? "text-white" : "text-slate-400"}`} />
                </div>
                <div className="font-black text-[9px] uppercase tracking-widest text-slate-900">{role.label}</div>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Full name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaUser className="h-4 w-4 text-slate-400" />
                </div>
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="First Last" className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0b1f3a] text-slate-900 placeholder:text-slate-300 font-medium transition-all" required />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaEnvelope className="h-4 w-4 text-slate-400" />
                </div>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0b1f3a] text-slate-900 placeholder:text-slate-300 font-medium transition-all" required />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaLock className="h-4 w-4 text-slate-400" />
              </div>
              <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="Min 8 characters" className="w-full pl-11 pr-12 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0b1f3a] text-slate-900 placeholder:text-slate-300 font-medium transition-all" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400">
                {showPassword ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {(formData.role === 'guide' || formData.role === 'contributor') && (
            <div className="space-y-4">
              {formData.role === 'guide' && (
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Phone Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaPhone className="h-3.5 w-3.5 text-slate-400" />
                    </div>
                    <input type="tel" name="phoneNumber" value={formData.phoneNumber || ''} onChange={handleChange} placeholder="+977 98XXXXXXXX" className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0b1f3a] text-slate-900 placeholder:text-slate-300 font-medium transition-all" required={formData.role === 'guide'} />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Bio / Experience</label>
                <textarea name="bio" value={formData.bio} onChange={handleChange} rows={2} placeholder="Describe your expertise..." className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0b1f3a] text-slate-900 placeholder:text-slate-300 font-medium transition-all resize-none" required />
              </div>
            </div>
          )}

          {formData.role === 'guide' && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Specialties</label>
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 border border-slate-100 rounded-lg max-h-32 overflow-y-auto custom-scrollbar">
                  {specialtyOptions.map(opt => (
                    <label key={opt} className="flex items-center gap-2 p-1.5 hover:bg-white rounded transition-colors cursor-pointer">
                      <input type="checkbox" name={`specialty_${opt}`} checked={formData.specialty.includes(opt)} onChange={handleChange} className="w-3.5 h-3.5 rounded-sm text-[#0b1f3a] focus:ring-0 border-slate-300" />
                      <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Languages</label>
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 border border-slate-100 rounded-lg max-h-32 overflow-y-auto custom-scrollbar">
                  {languageOptions.map(opt => (
                    <label key={opt} className="flex items-center gap-2 p-1.5 hover:bg-white rounded transition-colors cursor-pointer">
                      <input type="checkbox" name={`languages_${opt}`} checked={formData.languages.includes(opt)} onChange={handleChange} className="w-3.5 h-3.5 rounded-sm text-[#0b1f3a] focus:ring-0 border-slate-300" />
                      <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Verification</label>
                <div className="relative h-20 border border-slate-200 border-dashed rounded-lg flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer text-center px-4">
                  <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" multiple />
                  <FaFileUpload className="text-sm text-slate-400 mb-1" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Upload ID / License</span>
                </div>
                {selectedFiles.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedFiles.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 px-2 py-1 bg-slate-100 rounded-md text-[9px] font-black uppercase text-slate-600">
                        <span className="truncate max-w-[80px]">{f.name}</span>
                        <button type="button" onClick={() => removeFile(i)} className="text-slate-400 hover:text-red-500 transition-colors"><FaTimes className="w-2 h-2" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3.5 rounded-lg font-black uppercase tracking-[0.1em] text-xs hover:shadow-lg hover:shadow-orange-500/20 transition-all shadow-md disabled:opacity-50 active:scale-[0.98]">
            {loading ? "Processing..." : "Create Account"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-50 text-center">
          <div className="flex items-center justify-center gap-4 mb-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <span className="h-px flex-1 bg-slate-100" />
            Social
            <span className="h-px flex-1 bg-slate-100" />
          </div>
          <div className="flex justify-center social-login-minimal mb-6">
            {formData.role !== 'guide' ? (
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  fetch("/api/auth/google-login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ credential: credentialResponse.credential, role: formData.role }),
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
                onError={() => alert("Google signup failed")}
              />
            ) : (
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">
                Guides must use standard registration
              </p>
            )}
          </div>

          <p className="text-[11px] font-medium text-slate-500">
            Already registered?{" "}
            <button onClick={onLoginClick} className="font-black text-[#0b1f3a] hover:underline uppercase tracking-widest ml-1">
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
