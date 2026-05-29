import React, { useState } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import GuideSidebar from '../components/guide/GuideSidebar';
import NotificationBell from '../components/common/NotificationBell';

const GuideLayout = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
  };

  const getInitials = (name) => {
    if (!name) return '??';
    return name
      .split(' ')
      .slice(0, 2)
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <GuideSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <main className="flex-1 md:ml-64 bg-slate-50 flex flex-col">
        {/* Clean Header - Search & Profile Icon */}
        <header className="bg-white sticky top-0 z-50 px-6 py-2 border-b border-slate-200 flex items-center justify-between h-14 shadow-sm">
          {/* Mobile burger button */}
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="mr-4 inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-slate-100 shadow-sm text-slate-700 md:hidden"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex-1">
            {/* Empty space where search was */}
          </div>

          <div className="ml-6 flex items-center gap-4">
            <NotificationBell />

            <Link
              to="/guide/profile"
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-xs tracking-tighter shadow-lg transition-all ring-2 ring-white hover:scale-110 active:scale-95 ${window.location.pathname.includes('/profile')
                ? 'bg-gradient-to-tr from-amber-500 to-orange-600 shadow-orange-500/20'
                : 'bg-slate-400 shadow-slate-200'
                }`}
            >
              {getInitials(user.name)}
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4">
          <Outlet context={{ searchTerm }} />
        </div>
      </main>
    </div>
  );
};

export default GuideLayout;
