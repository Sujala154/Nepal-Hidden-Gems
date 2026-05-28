import React, { useState } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { FaSearch, FaUser } from 'react-icons/fa';
import ContributorSidebar from '../components/common/ContributorSidebar';
import NotificationBell from '../components/common/NotificationBell';

const ContributorLayout = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const showSearch = location.pathname === '/contributor/submissions';

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
      <ContributorSidebar />
      <main className="flex-1 md:ml-64 relative h-screen overflow-y-auto bg-slate-50 flex flex-col custom-scrollbar">
        {/* Clean Header - Search & Profile Icon */}
        <header className="bg-white sticky top-0 z-50 px-4 py-3 border-b border-slate-100 flex items-center h-16 shadow-sm">
          <div className="flex-1 flex justify-start pl-2">
            {showSearch ? (
              <div className="w-full group">
                <div className="relative">
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm transition-colors group-focus-within:text-amber-500" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:bg-white focus:border-amber-500 transition-all font-medium text-sm placeholder:text-slate-400 shadow-sm"
                  />
                </div>
              </div>
            ) : (
              <div className="flex-1" />
            )}
          </div>

          <div className="ml-6 flex items-center gap-4">
            <NotificationBell />

            <Link
              to="/contributor/profile"
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-xs tracking-tighter shadow-lg transition-all ring-2 ring-white hover:scale-110 active:scale-95 ${window.location.pathname === '/contributor/profile'
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

export default ContributorLayout;
