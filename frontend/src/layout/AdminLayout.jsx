import React from 'react';
import { Outlet, Link, Navigate, useLocation } from 'react-router-dom';

import AdminSidebar from '../components/common/AdminSidebar';
import NotificationBell from '../components/common/NotificationBell';

const AdminLayout = () => {
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const location = useLocation();

  // Security Check: Only allow admins
  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const getInitials = (name) => {
    if (!name) return 'AD';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />
      <main className="flex-1 md:ml-64 relative h-screen overflow-y-auto bg-slate-50 flex flex-col">
        {/* Simple Header - Icons Only */}
        <header className="bg-white sticky top-0 z-50 px-8 py-4 border-b border-slate-100 flex items-center justify-end h-20 shadow-sm">
          <div className="flex items-center gap-4">
            <NotificationBell />


            <Link
              to="/admin/profile"
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-xs tracking-tighter shadow-lg transition-all ring-2 ring-white hover:scale-110 active:scale-95 ${location.pathname === '/admin/profile'
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
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
