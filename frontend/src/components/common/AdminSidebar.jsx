import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaShieldAlt, FaMapMarkedAlt, FaUsers, FaUserTie, FaCompass, FaChartBar, FaWallet } from 'react-icons/fa';

const AdminSidebar = () => {
  const navItems = [
    { path: '/admin/analytics', label: 'Analytics', icon: FaChartBar },
    { path: '/admin/destinations', label: 'Content Moderation', icon: FaMapMarkedAlt },
    { path: '/admin/users', label: 'User Management', icon: FaUsers },
    { path: '/admin/financials', label: 'Financials', icon: FaWallet },
  ];

  return (
    <aside className="w-64 bg-[#0b1f3a] fixed h-full hidden md:flex flex-col z-30 shadow-2xl">
      <div className="p-8 pb-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <FaShieldAlt className="text-white text-base" />
          </div>
          <h2 className="text-base font-black text-white uppercase tracking-tighter leading-tight">
            Admin <br /> Control Panel
          </h2>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-6 space-y-1.5">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-4 px-5 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 group
              ${isActive
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-xl shadow-orange-500/20 scale-[1.02]'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`
            }
          >
            <item.icon className={`w-4 h-4 transition-transform duration-300 group-hover:scale-110 ${window.location.pathname === item.path ? 'animate-pulse' : ''}`} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer Branding */}
      <div className="p-6 mt-auto">
        <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800 shadow-sm">
          <p className="text-[9px] font-black text-slate-500 text-center uppercase tracking-tighter leading-relaxed">
            © 2026 Nepal Hidden Gems <br />
            <span className="text-orange-500/70">Central Admin v2.5</span>
          </p>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
