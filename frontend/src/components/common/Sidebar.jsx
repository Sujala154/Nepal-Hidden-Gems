import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaCompass, FaHeart, FaComments, FaUser, FaTicketAlt, FaMountain, FaUserTie } from 'react-icons/fa';

const Sidebar = ({ open, onClose }) => {
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const navItems = [
    { path: '/destinations', label: 'Destinations', icon: FaCompass },
    { path: '/favourites', label: 'Favourites', icon: FaHeart },
    { path: '/bookings', label: 'Bookings', icon: FaTicketAlt },
    { path: '/guides', label: 'Guides', icon: FaUserTie },
    { path: '/chats', label: 'Chats', icon: FaComments },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-[40] md:hidden transition-opacity duration-200 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden={!open}
      />

      {/* Mobile drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 max-w-full bg-white z-[60] md:hidden transform transition-transform duration-300 ease-in-out shadow-2xl border-r border-slate-200 overflow-y-auto ${open ? 'translate-x-0' : '-translate-x-full'}`}
        aria-hidden={!open}
      >
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-md">
            <FaMountain className="text-white" />
          </div>
          <h3 className="text-sm font-black">Traveller Dashboard</h3>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-md font-semibold text-sm transition-colors ${
                  isActive ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' : 'text-slate-600 hover:bg-slate-50'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 mt-auto">
          <p className="text-[10px] text-slate-400 text-center">© 2026 Nepal Hidden Gems</p>
        </div>
      </aside>

      {/* Desktop sidebar */}
      <aside className="w-64 bg-white/80 backdrop-blur-xl border-r border-slate-200 fixed h-full hidden md:flex flex-col z-20 shadow-2xl shadow-slate-200/50">
      <div className="p-8 pb-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <FaMountain className="text-white text-base" />
          </div>
          <h2 className="text-base font-black text-[#0b1f3a] uppercase tracking-tighter leading-tight">
            {user?.role === 'guide' ? 'Guide' : user?.role === 'admin' ? 'Admin' : user?.role === 'contributor' ? 'Expert' : 'Traveller'}'s <br /> DASHBOARD
          </h2>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-4 px-5 py-3.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all duration-300 group
              ${isActive
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-500/20'
                : 'text-slate-500 hover:bg-slate-50 hover:text-amber-600 border border-transparent hover:border-slate-100 font-bold'}`
            }
          >
            <item.icon className={`w-4 h-4 transition-transform group-hover:scale-110`} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer Branding */}
      <div className="p-6 mt-auto">
        <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <p className="text-[9px] font-black text-slate-400 text-center uppercase tracking-tighter leading-relaxed">
            © 2026 Nepal Hidden Gems <br />
            <span className="text-amber-500/70">Sustainable Travel Initiative</span>
          </p>
        </div>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;
