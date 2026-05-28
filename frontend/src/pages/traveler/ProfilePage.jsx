import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaCamera, FaCheckCircle, FaCalendarAlt, FaShieldAlt, FaSignOutAlt, FaExclamationTriangle, FaSave, FaEye, FaEyeSlash, FaGoogle } from 'react-icons/fa';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordLength, setPasswordLength] = useState(8);
  const [stats, setStats] = useState({ bookings: 0, favorites: 0 });

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    specialty: '',
    languages: '',
    phoneNumber: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: ''
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [profileRes, bookingsRes] = await Promise.all([
          api.get('/auth/me'),
          api.get('/bookings/my-bookings').catch(() => ({ success: false, data: [] }))
        ]);

        if (profileRes.success) {
          const userData = profileRes.user || profileRes.data;
          setProfile(userData);
          
          let newStats = {
            bookings: bookingsRes.success && bookingsRes.data ? bookingsRes.data.length : 0,
            favorites: userData.favorites ? userData.favorites.length : 0,
            submissions: 0,
            approved: 0
          };

          if (userData.role === 'contributor') {
            try {
              const destRes = await api.get('/destinations/user/my-destinations');
              const destList = Array.isArray(destRes) ? destRes : (destRes.data || destRes.destinations || []);
              newStats.submissions = destList.length;
              newStats.approved = destList.filter(d => d.status === 'approved' || d.approved).length;
            } catch (err) {
              console.error("Failed to fetch contributor stats", err);
            }
          }

          setStats(newStats);

          setFormData({
            name: userData.name || '',
            bio: userData.bio || '',
            specialty: userData.specialty ? userData.specialty.join(', ') : '',
            languages: userData.languages ? userData.languages.join(', ') : '',
            phoneNumber: userData.phoneNumber || ''
          });
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
        const localUser = JSON.parse(sessionStorage.getItem('user'));
        setProfile(localUser);
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

  const fileInputRef = React.useRef(null);
  const [uploading, setUploading] = useState(false);

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
      const res = await api.put('/auth/me', formData);
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
    : 'Recently';

  const isGuide = profile?.role === 'guide';
  const isContributor = profile?.role === 'contributor';

  return (
    <div className="max-w-7xl mx-auto h-full pb-20">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* LEFT SIDE: THE PROFILE CARDS */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Main Profile Card */}
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
                    <FaUser className="text-slate-300 text-4xl" />
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
            <p className="text-[9px] font-black text-amber-500 uppercase tracking-[0.3em] mt-1 mb-4">{profile?.role}</p>

            <div className="w-full flex justify-between px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl mb-3">
              <div className="text-center w-1/2">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                  {isGuide ? 'Tours' : isContributor ? 'Submissions' : 'Trips'}
                </p>
                <p className="text-xl font-black text-[#0b1f3a]">
                  {isGuide ? '-' : isContributor ? stats.submissions : stats.bookings}
                </p>
              </div>
              <div className="w-px bg-slate-200"></div>
              <div className="text-center w-1/2">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                  {isGuide ? 'Reviews' : isContributor ? 'Approved' : 'Saved'}
                </p>
                <p className="text-xl font-black text-[#0b1f3a]">
                  {isGuide ? '-' : isContributor ? stats.approved : stats.favorites}
                </p>
              </div>
            </div>

            {/* Status & Member Since block */}
            <div className="w-full flex justify-between px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl mb-4">
              {!isContributor && !isGuide ? (
                <div className="text-center w-full flex flex-col items-center justify-center">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Joined</p>
                  <p className="text-xs font-black text-[#0b1f3a]">{joinDate}</p>
                </div>
              ) : (
                <>
                  <div className="text-center w-1/2 flex flex-col items-center justify-center">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Status</p>
                    <p className="text-xs font-black text-[#0b1f3a] capitalize">{profile?.approvalStatus || 'Approved'}</p>
                  </div>
                  <div className="w-px bg-slate-200"></div>
                  <div className="text-center w-1/2 flex flex-col items-center justify-center">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Joined</p>
                    <p className="text-xs font-black text-[#0b1f3a]">{joinDate}</p>
                  </div>
                </>
              )}
            </div>

            {/* Logout Button */}
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full py-3 bg-white border-2 border-slate-100 text-slate-400 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-amber-500 hover:border-amber-500 hover:text-white transition-all flex items-center justify-center gap-2 group shadow-sm"
            >
              Logout <FaSignOutAlt className="text-[10px] group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>

        {/* RIGHT SIDE: DETAILS & UPDATE FORM */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-[24px] p-6 shadow-xl shadow-slate-200/40 border border-slate-100">
            <h2 className="text-xl font-black text-[#0b1f3a] uppercase tracking-tight mb-6 border-b border-slate-100 pb-4">Personal Information</h2>
            
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
                  <p className="text-[9px] text-slate-400 font-bold tracking-wide">Email cannot be changed directly.</p>
                </div>

                {/* Authentication Method / Password Display */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {profile?.googleId ? 'Authentication' : 'Password'}
                  </label>

                  {profile?.googleId ? (
                    <div className="flex items-center gap-3 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 cursor-not-allowed">
                      <FaGoogle className="text-[#4285F4] text-lg" />
                      <span>Linked with Google</span>
                    </div>
                  ) : (
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
                  )}
                </div>
              </div>

              {/* Role-Specific Details */}
              {(isGuide || isContributor) && (
                <>
                  <div className="pt-4 border-t border-slate-100 mt-6">
                    <h3 className="text-[11px] font-black text-[#0b1f3a] uppercase tracking-widest mb-4">Professional Details</h3>
                    
                    <div className="space-y-5">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bio / Description</label>
                        <textarea
                          name="bio"
                          value={formData.bio}
                          onChange={handleInputChange}
                          rows="4"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all text-sm font-bold text-slate-700"
                          placeholder="Tell travelers about yourself..."
                        />
                      </div>

                      {isGuide && (
                        <>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</label>
                            <input
                              type="text"
                              name="phoneNumber"
                              value={formData.phoneNumber}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all text-sm font-bold text-slate-700"
                              placeholder="+977-9800000000"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Specialties</label>
                              <input
                                type="text"
                                name="specialty"
                                value={formData.specialty}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all text-sm font-bold text-slate-700"
                                placeholder="Trekking, Culture, etc. (Comma separated)"
                              />
                            </div>
                            
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Languages</label>
                              <input
                                type="text"
                                name="languages"
                                value={formData.languages}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all text-sm font-bold text-slate-700"
                                placeholder="English, Nepali (Comma separated)"
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}

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

export default ProfilePage;
