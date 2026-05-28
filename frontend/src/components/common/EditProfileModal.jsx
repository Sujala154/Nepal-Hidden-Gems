import React, { useState, useRef } from 'react';
import { FaUser, FaLock, FaTimes, FaEye, FaEyeSlash, FaEdit, FaCamera } from 'react-icons/fa';
import api from '../../services/api';

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

const EditProfileModal = ({ profile, onClose, onUpdate }) => {
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    profileImage: profile?.profileImage || '',
    bio: profile?.bio || '',
    specialty: profile?.specialty || [],
    languages: profile?.languages || [],
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("Image size should be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, profileImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleCheckboxChange = (field, value, checked) => {
    setFormData(prev => {
        const currentArray = prev[field] || [];
        const newArray = checked ? [...currentArray, value] : currentArray.filter(item => item !== value);
        return { ...prev, [field]: newArray };
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const updates = {};
      
      // Update Name if changed
      if (formData.name !== profile.name) {
        updates.name = formData.name;
      }

      // Update Bio if changed
      if (formData.bio !== profile.bio) {
        updates.bio = formData.bio;
      }

      // Update Profile Image if changed
      if (formData.profileImage !== profile.profileImage) {
        updates.profileImage = formData.profileImage;
      }

      // Update Specialty and Languages if guide
      if (profile?.role === 'guide') {
          if (JSON.stringify(formData.specialty) !== JSON.stringify(profile.specialty)) {
              updates.specialty = formData.specialty;
          }
          if (JSON.stringify(formData.languages) !== JSON.stringify(profile.languages)) {
              updates.languages = formData.languages;
          }
      }

      if (Object.keys(updates).length > 0) {
        const profileRes = await api.put('/auth/me', updates);
        if (!profileRes.success) throw new Error(profileRes.error || 'Failed to update profile');
        onUpdate(profileRes.user);
      }

      // Update Password if requested
      if (showPasswordSection && formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error("New passwords don't match");
        }
        const passRes = await api.put('/auth/change-password', {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        });
        if (!passRes.success) throw new Error(passRes.error || 'Failed to update password');
      }

      setSuccess('Profile updated successfully!');
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100">
        <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 uppercase tracking-tight text-sm">Edit Profile</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleUpdate} className="p-6 space-y-5">
          {error && <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100">{error}</div>}
          {success && <div className="p-3 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-xl border border-emerald-100">{success}</div>}

          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-3">
             <div 
               onClick={() => fileInputRef.current.click()}
               className="relative w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center cursor-pointer group overflow-hidden border-2 border-slate-100 hover:border-amber-500 transition-all"
             >
                {formData.profileImage ? (
                  <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <FaUser className="text-slate-300 text-2xl" />
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <FaCamera className="text-white" />
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept="image/*" 
                />
             </div>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Click to change photo</span>
          </div>

          {/* Name Field */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-amber-500 outline-none font-bold text-sm"
              placeholder="Your full name"
              required
            />
          </div>

          {/* Bio Field - Only for Contributor & Guide */}
          {(profile?.role === 'contributor' || profile?.role === 'guide') && (
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bio / Experience Summary</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-amber-500 outline-none font-bold text-sm min-h-[100px] resize-none"
                placeholder="Share your story and expertise..."
              />
            </div>
          )}

          {/* Guide Specific Fields */}
          {profile?.role === 'guide' && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Specialties</label>
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 border border-slate-100 rounded-lg max-h-32 overflow-y-auto custom-scrollbar">
                  {specialtyOptions.map(opt => (
                    <label key={opt} className="flex items-center gap-2 p-1.5 hover:bg-white rounded transition-colors cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.specialty.includes(opt)} 
                        onChange={(e) => handleCheckboxChange('specialty', opt, e.target.checked)} 
                        className="w-3.5 h-3.5 rounded-sm text-amber-500 focus:ring-0 border-slate-300" 
                      />
                      <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Languages</label>
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 border border-slate-100 rounded-lg max-h-32 overflow-y-auto custom-scrollbar">
                  {languageOptions.map(opt => (
                    <label key={opt} className="flex items-center gap-2 p-1.5 hover:bg-white rounded transition-colors cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.languages.includes(opt)} 
                        onChange={(e) => handleCheckboxChange('languages', opt, e.target.checked)} 
                        className="w-3.5 h-3.5 rounded-sm text-amber-500 focus:ring-0 border-slate-300" 
                      />
                      <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Unified Password Toggle */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowPasswordSection(!showPasswordSection)}
              className="flex items-center gap-2 text-[10px] font-black text-amber-600 uppercase tracking-widest hover:text-amber-700"
            >
              {showPasswordSection ? <FaTimes /> : <FaLock />}
              {showPasswordSection ? 'Cancel Password Change' : 'Change Password'}
            </button>
          </div>

          {showPasswordSection && (
            <div className="space-y-3 pt-2 animate-in slide-in-from-top-2 duration-300">
               <input
                 type={showPasswords.current ? "text" : "password"}
                 placeholder="Current Password"
                 value={formData.currentPassword}
                 onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                 className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm"
                 required={showPasswordSection}
               />
               <input
                 type={showPasswords.new ? "text" : "password"}
                 placeholder="New Password"
                 value={formData.newPassword}
                 onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                 className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm"
                 required={showPasswordSection}
               />
               <input
                 type={showPasswords.confirm ? "text" : "password"}
                 placeholder="Confirm New Password"
                 value={formData.confirmPassword}
                 onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                 className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm"
                 required={showPasswordSection}
               />
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-slate-50">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-slate-200 text-slate-500 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[1.5] px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-orange-500/20 disabled:opacity-70"
            >
              {loading ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
