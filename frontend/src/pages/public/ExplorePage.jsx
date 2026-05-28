import React, { useState, useEffect } from 'react';
import DestinationCard from "../../components/traveler/DestinationCard";
import Loader from '../../components/common/Loader';
import { useDestinations } from '../../hooks/useDestinations';

const ExplorePage = () => {
  const { destinations, loading, fetchDestinations } = useDestinations();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupError, setSignupError] = useState('');

  useEffect(() => {
    fetchDestinations();
  }, []);

  const openSignupModal = () => {
    setSignupError('');
    setIsSignupModalOpen(true);
  };

  const closeSignupModal = () => {
    setIsSignupModalOpen(false);
    setSignupEmail('');
    setSignupPassword('');
    setSignupError('');
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    if (!signupEmail.trim() || !signupPassword.trim()) {
      setSignupError('Please enter both email and password.');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(signupEmail.trim())) {
      setSignupError('Please enter a valid email address.');
      return;
    }

    // Modal is currently a UI-only signup experience.
    closeSignupModal();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[40vh] flex items-center overflow-hidden bg-gradient-to-r from-[#0b1f3a] via-[#0f2a50] to-[#0b1f3a]">
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-10 left-10 w-72 h-72 bg-amber-400 rounded-full mix-blend-multiply filter blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-sky-700 rounded-full mix-blend-multiply filter blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 text-center text-white">
          <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter mb-2">
            Explore Nepal
          </h1>
          <p className="text-base md:text-lg mb-4 font-medium opacity-90">
            Search and discover hidden gems, temples, lakes, mountains and more
          </p>
          {/* Search Bar */}
          <div className="max-w-xl mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search destinations..."
              className="w-full px-6 py-2.5 rounded-full text-gray-900 font-bold text-sm shadow-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
        </div>
      </section>

      {/* Destinations Grid */}
      <section className="py-10 bg-slate-50/50">
        <div className="w-full px-4">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Handpicked Hidden Gems</h2>
            <p className="text-slate-500 mt-1 font-bold text-xs uppercase tracking-widest opacity-60">Verified by our local community</p>
          </div>
          {loading && destinations.length === 0 ? (
            <div className="flex justify-center items-center min-h-[20vh]">
              <Loader />
            </div>
          ) : destinations.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Be the first to contribute a hidden gem!
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {destinations
                  .filter(dest => 
                    dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    dest.location.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((destination) => (
                    <DestinationCard key={destination._id} destination={destination} />
                  ))}
              </div>

            </>
          )}
        </div>
      </section>

      {isSignupModalOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[#020916d9] backdrop-blur-[8px] px-4 py-6"
          onClick={closeSignupModal}
        >
          <div
            className="relative w-full max-w-xl rounded-[28px] border border-white/10 bg-gradient-to-br from-[#08142d] via-[#071226] to-[#0b1f3a] p-8 shadow-2xl shadow-black/40"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeSignupModal}
              className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white transition-all duration-300 hover:bg-white/20"
            >
              ×
            </button>

            <div className="mb-6 text-center">
              <p className="text-sm uppercase tracking-[0.3em] text-amber-300 mb-3">Join the adventure</p>
              <h2 className="text-3xl font-black text-white">Sign up to unlock hidden gems</h2>
              <p className="text-sm text-slate-300 mt-3">Enter your details below to create your account and continue exploring.</p>
            </div>

            <form onSubmit={handleSignupSubmit} className="space-y-5">
              {signupError && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
                  {signupError}
                </div>
              )}

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Email</label>
                <input
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Password</label>
                <input
                  type="password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
                  placeholder="Create a password"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-amber-500 px-5 py-3 text-sm font-black uppercase tracking-[0.2em] text-[#0b1f3a] transition-all duration-300 hover:bg-amber-400"
              >
                Sign Up
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExplorePage;
