/**
 * TravelerLayout.jsx
 *
 * Shell layout for all traveler-facing dashboard routes.
 * Renders a persistent sidebar, a context-aware top header with a search bar,
 * and an Outlet that passes the current search term down to child pages.
 *
 * The search bar is only shown on routes that opt in via `searchConfig`.
 * When the user navigates to a new page, the search term is automatically cleared.
 */
import React, { useState, useEffect, useMemo } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { FaSearch, FaCompass, FaTicketAlt, FaHeart } from 'react-icons/fa';
import Sidebar from '../components/common/Sidebar';
import NotificationBell from '../components/common/NotificationBell';

// Routes that display an inline search bar, keyed by their pathname.
// Pages not listed here render a plain header without a search input.
const SEARCH_CONFIG = {
  '/destinations': {
    placeholder: 'Search destinations by name or location...',
    icon: FaCompass,
    label: 'Destinations',
  },
  '/bookings': {
    placeholder: 'Search bookings by destination or guide...',
    icon: FaTicketAlt,
    label: 'Bookings',
  },
  '/favourites': {
    placeholder: 'Search your favourite destinations...',
    icon: FaHeart,
    label: 'Favourites',
  },
};

const DEFAULT_CONFIG = {
  placeholder: 'Search gems, destinations, and local guides...',
  icon: FaSearch,
  label: '',
};

const TravelerLayout = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();

  // Read user once from session — only needed for the avatar initials.
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');

  // Clear search input whenever the user navigates to a different page.
  useEffect(() => {
    setSearchTerm('');
  }, [location.pathname]);

  const config = SEARCH_CONFIG[location.pathname] || DEFAULT_CONFIG;
  const SearchIcon = config.icon;
  const isSearchableRoute = !!SEARCH_CONFIG[location.pathname];

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Derive initials from the user's display name (up to two parts).
  const getInitials = (name) => {
    if (!name) return '??';
    return name
      .split(' ')
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 md:ml-64 relative bg-slate-50 flex flex-col">
        {/* Context-aware sticky header — shows a search bar on eligible routes */}
        <header className="bg-white sticky top-0 z-50 px-4 py-3 border-b border-slate-100 flex items-center h-16 shadow-sm">
          <div className="flex-1 flex justify-center">
            {isSearchableRoute && (
              <div className="w-full max-w-2xl group">
                <div className="relative">
                  <SearchIcon
                    className={`absolute left-4 top-1/2 -translate-y-1/2 text-sm transition-colors ${
                      searchTerm ? 'text-amber-500' : 'text-slate-400 group-focus-within:text-amber-500'
                    }`}
                  />
                  <input
                    type="text"
                    placeholder={config.placeholder}
                    value={searchTerm}
                    onChange={handleSearch}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:bg-white focus:border-amber-500 transition-all font-medium text-sm placeholder:text-slate-400 shadow-sm"
                  />
                  {/* Active page label badge */}
                  {config.label && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase tracking-widest text-amber-500 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md hidden sm:block">
                      {config.label}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="ml-6 flex items-center gap-4">
            <NotificationBell />

            {/* Avatar link — highlights amber when on the profile route */}
            <Link
              to="/profile"
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-xs tracking-tighter shadow-lg transition-all ring-2 ring-white hover:scale-110 active:scale-95 ${
                location.pathname === '/profile'
                  ? 'bg-gradient-to-tr from-amber-500 to-orange-600 shadow-orange-500/20'
                  : 'bg-slate-400 shadow-slate-200'
              }`}
            >
              {getInitials(user.name)}
            </Link>
          </div>
        </header>

        {/* Page content — searchTerm is passed via Outlet context to child routes */}
        <div className="flex-1 min-h-0 p-4">
          <Outlet context={{ searchTerm }} />
        </div>
      </main>
    </div>
  );
};

export default TravelerLayout;
