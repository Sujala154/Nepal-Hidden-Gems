import { NavLink } from 'react-router-dom';
import { FaList, FaPlus, FaComments, FaMountain, FaChartLine, FaStar } from 'react-icons/fa';

const ContributorSidebar = () => {
  const navItems = [
    { path: '/contributor/submissions', label: 'My Destinations', icon: FaList },
    { path: '/contributor/upload', label: 'Add Destinations', icon: FaPlus },
    { path: '/contributor/analytics', label: 'Analytics', icon: FaChartLine },
    { path: '/contributor/expert-board', label: 'Expert Advice Board', icon: FaComments },
  ];

  return (
    <aside className="w-64 bg-white/80 backdrop-blur-xl border-r border-slate-100 fixed h-full hidden md:flex flex-col z-30 shadow-sm">
      <div className="p-8 pb-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <FaMountain className="text-white text-base" />
          </div>
          <h2 className="text-base font-black text-[#0b1f3a] uppercase tracking-tighter leading-tight">
            Contributor <br/> Dashboard
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
                : 'text-slate-500 hover:bg-slate-50 hover:text-amber-600 border border-transparent hover:border-slate-100 font-bold'}`
            }
          >
            <item.icon className={`w-4 h-4 transition-transform duration-300 group-hover:scale-110 ${window.location.pathname === item.path ? 'animate-pulse' : ''}`} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer Branding */}
      <div className="p-6 mt-auto">
        <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <p className="text-[9px] font-black text-slate-400 text-center uppercase tracking-tighter leading-relaxed">
            © 2026 Nepal Hidden Gems <br /> 
            <span className="text-amber-500/70">Contributor Network v2</span>
          </p>
        </div>
      </div>
    </aside>
  );
};

export default ContributorSidebar;
