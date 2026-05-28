import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { openAuthModal } = useAuth();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Contributors", path: "/contributors" },
    { name: "About", path: "/about" },
  ];

  const isActive = (path) => location.pathname === path;
  const closeMobile = () => setIsMobileOpen(false);

  return (
    <header className="bg-[#0b1f3a] text-white border-b border-[#11284c] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2" onClick={closeMobile}>
          <div className="w-10 h-10 bg-gradient-to-br from-[#1f3b6b] to-[#0b1f3a] rounded-lg flex items-center justify-center shadow-sm border border-[#1f3b6b]">
            <svg
              className="w-6 h-6 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2L2 12h3v8h6v-6h2v6h6v-8h3L12 2z" />
            </svg>
          </div>
          <span className="text-xl font-semibold text-white">
            <span className="text-white">Nepal</span>{" "}
            <span className="text-amber-300">Hidden Gems</span>
          </span>
        </Link>

        {/* Mobile menu button */}
        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center p-2 rounded-lg border border-[#1f3b6b] text-white hover:bg-[#132a4d]"
          onClick={() => setIsMobileOpen((prev) => !prev)}
          aria-label="Toggle navigation"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Navigation Links - Desktop */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`text-sm font-medium transition-colors duration-200 ${isActive(link.path)
                ? "text-amber-300 border-b-2 border-amber-300 pb-1"
                : "text-slate-100 hover:text-amber-200"
                }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={() => openAuthModal('login')}
            className="text-sm font-medium text-slate-100 hover:text-amber-200 transition-colors duration-200"
          >
            Sign In
          </button>
          <button
            onClick={() => openAuthModal('signup')}
            className="px-5 py-2.5 bg-amber-400 text-[#0b1f3a] text-sm font-semibold rounded-lg hover:bg-amber-300 transition-colors duration-200 shadow-sm"
          >
            Get Started
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {isMobileOpen && (
        <div className="md:hidden border-t border-[#11284c] bg-[#0b1f3a] shadow-lg">
          <div className="px-6 py-4 flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={closeMobile}
                className={`text-base font-medium transition-colors duration-200 ${isActive(link.path)
                  ? "text-amber-300"
                  : "text-slate-100 hover:text-amber-200"
                  }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-3 flex flex-col gap-2 border-t border-white/10">
              <button
                onClick={() => {
                  closeMobile();
                  openAuthModal('login');
                }}
                className="text-sm font-medium text-slate-100 hover:text-amber-200 transition-colors duration-200 text-left"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  closeMobile();
                  openAuthModal('signup');
                }}
                className="px-4 py-2 bg-amber-400 text-[#0b1f3a] text-sm font-semibold rounded-lg hover:bg-amber-300 transition-colors duration-200 text-center"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
