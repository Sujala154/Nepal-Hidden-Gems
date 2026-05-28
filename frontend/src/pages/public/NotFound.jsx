import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaCompass, FaMountain } from 'react-icons/fa';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-6">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-700" />
      </div>

      <div className="relative text-center max-w-lg">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl mb-8 shadow-2xl shadow-amber-500/30">
          <FaMountain className="w-12 h-12 text-white" />
        </div>

        {/* 404 */}
        <h1 className="text-8xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400 mb-4">
          404
        </h1>

        {/* Message */}
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Trail Not Found
        </h2>
        <p className="text-slate-400 text-lg mb-10 leading-relaxed">
          Looks like you've wandered off the beaten path. The destination you're looking for doesn't exist or has been moved.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 px-8 py-4 rounded-xl font-bold hover:from-amber-400 hover:to-orange-400 transition-all duration-300 shadow-lg shadow-amber-500/25"
          >
            <FaHome className="w-5 h-5" />
            Back to Home
          </Link>
          <Link
            to="/destinations"
            className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold border border-white/20 hover:bg-white/20 transition-all duration-300"
          >
            <FaCompass className="w-5 h-5" />
            Explore Destinations
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
