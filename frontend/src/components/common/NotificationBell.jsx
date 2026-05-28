import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import api from '../../services/api';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/profiles/notifications');
      if (res.success) {
        const data = res.data || [];
        console.log(`[DEBUG] Notifications fetched for user. Total: ${data.length}, Unread: ${data.filter(n => !n.isRead).length}`);
        setNotifications(data);
      }
    } catch (err) {
      console.error('Fetch notifications error:', err);
    }
  };

  const navigate = useNavigate();

  const handleNotifClick = (notif) => {
    setIsNotifOpen(false);
    
    const userStr = sessionStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : {};
    const role = user.role || 'traveler';
    
    // Determine the correct base path for chats based on role
    let chatPath = '/chats';
    if (role === 'guide') chatPath = '/guide/chats';
    if (role === 'contributor') chatPath = '/contributor/chats';

    if (notif.type === 'invite') {
      navigate(chatPath, { state: { chatId: notif.relatedId } });
    } else if (notif.type === 'booking' || notif.type === 'booking_update') {
      navigate(role === 'guide' ? '/guide/bookings' : '/bookings');
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const toggleNotifications = async () => {
    const nextOpen = !isNotifOpen;
    setIsNotifOpen(nextOpen);

    if (nextOpen && unreadCount > 0) {
      try {
        await api.put('/profiles/notifications/read');
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      } catch (err) {
        console.error('Mark notifications read error:', err);
      }
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };

    if (isNotifOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotifOpen]);

  useEffect(() => {
    fetchNotifications();
    // High-speed polling for live updates (5s)
    const interval = setInterval(fetchNotifications, 5000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleNotifications}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all relative ${
          isNotifOpen ? 'bg-amber-100 text-amber-600' : 'text-slate-600 bg-slate-100 hover:bg-amber-50'
        }`}
        title="Notifications"
      >
        <FaBell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 text-[10px] font-black text-white bg-red-500 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isNotifOpen && (
        <div className="absolute right-0 mt-3 w-80 max-h-[400px] bg-white border border-slate-200 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in slide-in-from-top-2 duration-200">
          <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
            <span className="font-black uppercase text-[10px] text-slate-400 tracking-widest">
              Notifications
            </span>
            {unreadCount > 0 && (
              <span className="bg-amber-100 text-amber-700 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">
                {unreadCount} New
              </span>
            )}
          </div>
          
          <div className="overflow-y-auto max-h-[320px] custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FaBell className="text-slate-200" />
                </div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No notifications yet</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-50">
                {notifications.map((notif) => (
                  <li 
                    key={notif._id} 
                    onClick={() => handleNotifClick(notif)}
                    className={`p-4 transition-colors hover:bg-slate-50 cursor-pointer ${
                      !notif.isRead ? 'bg-amber-50/30' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1 shrink-0 ${
                        !notif.isRead ? 'bg-amber-500' : 'bg-transparent'
                      }`} />
                      <div>
                        <div className="text-xs font-black text-slate-800 leading-tight mb-1">{notif.title}</div>
                        <div className="text-[11px] text-slate-600 leading-relaxed mb-2">{notif.message}</div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
                          {new Date(notif.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="p-1 bg-slate-50/30 border-t border-slate-50" />
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
