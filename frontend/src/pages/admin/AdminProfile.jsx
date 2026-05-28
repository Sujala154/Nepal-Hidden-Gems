import React, { useEffect, useState, useRef } from 'react';
import { FaUserShield, FaShieldAlt, FaSignOutAlt, FaSave, FaEye, FaEyeSlash, FaUser, FaCamera } from 'react-icons/fa';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordLength, setPasswordLength] = useState(8);
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: ''
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const profileRes = await api.get('/auth/me');
        if (profileRes.success) {
          const userData = profileRes.user || profileRes.data;
          setProfile(userData);
          setFormData({
            name: userData.name || '',
            email: userData.email || ''
          });
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
        const localUser = JSON.parse(sessionStorage.getItem('user'));
        setProfile(localUser);
        setFormData({
          name: localUser?.name || '',
          email: localUser?.email || ''
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  const handleUpdateProfile = (updatedUser) => {
    setProfile(updatedUser);
    sessionStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    window.location.href = '/';
  };

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      setUploading(true);
      try {
        const response = await api.put('/auth/me', { profileImage: reader.result });
        if (response.success) {
          handleUpdateProfile(response.user);
        }
      } catch (err) {
        console.error("Failed to upload image", err);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await api.put('/auth/me', { name: formData.name });
      if (res.success) {
        handleUpdateProfile(res.user);
        toast.success('Profile updated successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setUpdatingPassword(true);
    try {
      const res = await api.put('/auth/change-password', passwordData);
      if (res.success) {
        toast.success('Password updated successfully!');
        setPasswordLength(passwordData.newPassword.length);
        setPasswordData({ currentPassword: '', newPassword: '' });
        setShowPasswordModal(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update password');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Loading Account Details...</p>
      </div>
    );
  }

  const joinDate = profile?.createdAt 
    ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'System Genesis';

  return (
    <div className="max-w-7xl mx-auto h-full pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* LEFT SIDE: THE PROFILE CARDS */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-[24px] p-4 shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col items-center text-center">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange}
            />
            <div 
              onClick={handleAvatarClick}
              className="group relative w-24 h-24 mb-3 cursor-pointer"
            >
              <div className={`w-full h-full rounded-full bg-white border-2 border-white overflow-hidden shadow-lg shadow-slate-200 flex items-center justify-center group-hover:border-amber-100 transition-all ${uploading ? 'opacity-50' : ''}`}>
                {profile?.profileImage ? (
                  <img src={profile.profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-slate-50 flex items-center justify-center">
                    <FaUserShield className="text-amber-500 text-4xl" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all rounded-full">
                   {uploading ? (
                     <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                   ) : (
                     <div className="flex flex-col items-center">
                        <FaCamera className="text-white text-base mb-0.5" />
                        <span className="text-[7px] text-white font-bold uppercase tracking-widest">Change</span>
                     </div>
                   )}
                </div>
              </div>
            </div>
            
            <h2 className="text-xl font-black text-[#0b1f3a] tracking-tight">{profile?.name}</h2>
            <p className="text-[9px] font-black text-amber-500 uppercase tracking-[0.3em] mt-1 mb-4 flex items-center gap-1 justify-center"><FaShieldAlt /> {profile?.role}</p>

            {/* Status & Member Since block */}
            <div className="w-full flex justify-between px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl mb-4">
              <div className="text-center w-1/2 flex flex-col items-center justify-center">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Status</p>
                <p className="text-xs font-black text-[#0b1f3a] capitalize">Active</p>
              </div>
              <div className="w-px bg-slate-200"></div>
              <div className="text-center w-1/2 flex flex-col items-center justify-center">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Appointed</p>
                <p className="text-xs font-black text-[#0b1f3a]">{joinDate}</p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full py-3 bg-white border-2 border-slate-100 text-slate-400 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-amber-500 hover:border-amber-500 hover:text-white transition-all flex items-center justify-center gap-2 group shadow-sm"
            >
              Logout <FaSignOutAlt className="text-[10px] group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="bg-white rounded-[24px] p-6 shadow-xl shadow-slate-200/40 border border-slate-100">
             <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                <FaShieldAlt className="text-amber-500" /> Admin Access
             </h3>
             <div className="flex flex-wrap gap-2">
                {['Approve Content', 'Manage Guides', 'User Oversight', 'Delete Data', 'System Logs'].map((perm, i) => (
                   <span key={i} className="text-[9px] font-black uppercase tracking-widest bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-100">
                      {perm}
                   </span>
                ))}
             </div>
          </div>
        </div>

        {/* RIGHT SIDE: DETAILS & UPDATE FORM */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-[24px] p-6 shadow-xl shadow-slate-200/40 border border-slate-100">
            <h2 className="text-xl font-black text-[#0b1f3a] uppercase tracking-tight mb-6 border-b border-slate-100 pb-4">Administrative Profile</h2>
            
            <form onSubmit={handleFormSubmit} className="space-y-5">
              
              <div className="space-y-5">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all text-sm font-bold text-slate-700"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                  <input
                    type="email"
                    value={profile?.email || ''}
                    disabled
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-400 cursor-not-allowed"
                  />
                  <p className="text-[9px] text-slate-400 font-bold tracking-wide">Administrator emails cannot be modified directly for security reasons.</p>
                </div>

                {/* Authentication Method / Password Display */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={'•'.repeat(passwordLength)}
                      disabled
                      className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-400 cursor-not-allowed tracking-[0.15em]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordModal(true)}
                      className="px-5 py-3 bg-slate-100 border border-slate-200 text-slate-600 hover:bg-amber-500 hover:border-amber-500 hover:text-white rounded-xl font-black uppercase tracking-widest text-[9px] transition-all whitespace-nowrap"
                    >
                      Change Password
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={updating}
                  className="w-full md:w-auto px-8 py-4 bg-amber-500 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-amber-500/30 hover:bg-amber-600 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                  {updating ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <FaSave className="text-sm" />
                  )}
                  Save Changes
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative animate-fadeIn">
            <h2 className="text-2xl font-black text-[#0b1f3a] uppercase tracking-tight mb-6">Change Password</h2>
            
            <form onSubmit={handleChangePassword} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all text-sm font-bold text-slate-700 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-500 transition-colors text-lg"
                  >
                    {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all text-sm font-bold text-slate-700 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-500 transition-colors text-lg"
                  >
                    {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingPassword}
                  className="flex-1 py-4 bg-amber-500 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-amber-600 transition-all flex items-center justify-center gap-2"
                >
                  {updatingPassword ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Save Password'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 transform transition-all">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mb-4">
                <FaSignOutAlt className="text-xl" />
              </div>
              <h3 className="text-lg font-bold text-[#0b1f3a] mb-2">Confirm Logout</h3>
              <p className="text-slate-500 text-sm mb-8">
                Are you sure you want to log out of your account?
              </p>

              <div className="flex w-full gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 py-3 bg-[#0b1f3a] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 transition-colors shadow-lg"
                >
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfile;
