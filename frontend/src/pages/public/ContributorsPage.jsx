import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaMapMarkerAlt, FaStar, FaCamera, FaHiking, FaMountain, FaUtensils, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const ContributorsPage = () => {
  const navigate = useNavigate();
  const { openAuthModal } = useAuth();
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRealContributors = async () => {
      try {
        setLoading(true);
        // Use the public contributors endpoint
        const res = await api.get('/contributors');
        if (res.success) {
          setContributors(res.data);
        }
      } catch (err) {
        console.error('Error fetching real contributors:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRealContributors();
  }, []);


  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[40vh] flex items-center overflow-hidden bg-[#0b1f3a]">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay"
            style={{ backgroundImage: "url(https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1600)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0b1f3a]/80 via-transparent to-[#0b1f3a]/90" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 text-center text-white w-full py-12">
          <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700">
            <p className="text-amber-400 font-black uppercase tracking-[0.3em] text-[10px] mb-2">The People Behind the Journey</p>
            <h1 className="text-4xl lg:text-5xl font-black mb-4 tracking-tight uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-orange-500">
              Our Elite Contributors
            </h1>
            <p className="text-base lg:text-lg text-slate-300 font-medium leading-relaxed">
              Passionate explorers, cultural guardians, and storytelling masters dedicated to
              unveiling the authentic heart of Nepal.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Results Info */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 border-b border-slate-200 pb-4 gap-4">
          <div>
            <h2 className="text-2xl font-black text-[#0b1f3a] tracking-tight uppercase">
              Community Leaders
            </h2>
            <p className="text-slate-500 mt-1 font-medium text-sm">{contributors.length} verified active</p>
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 px-4 py-1.5 rounded-full border border-slate-200">
            Showing all {contributors.length} contributors
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <FaSpinner className="text-amber-500 text-4xl animate-spin mb-4" />
            <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">Loading Contributors...</p>
          </div>
        ) : (
          /* Contributors Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {contributors.map(contributor => (
              <div
                key={contributor._id}
                className="group bg-white rounded-2xl border-2 border-slate-200 overflow-hidden hover:shadow-[0_20px_50px_rgba(11,31,58,0.1)] transition-all duration-500 flex flex-col p-5"
              >
                {/* Empty Profile Placeholder */}
                <div className="mb-4 flex justify-center">
                  <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center text-slate-300">
                    <FaUser className="w-8 h-8" />
                  </div>
                </div>

                {/* Profile Info */}
                <div className="flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-lg font-black text-[#0b1f3a] mb-0.5 group-hover:text-amber-600 transition-colors uppercase tracking-tight">{contributor.name}</h3>
                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                      <FaStar className="h-2.5 w-2.5 text-amber-500" />
                      <span className="text-[10px] font-black text-[#0b1f3a]">{contributor.rating || '4.8'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-400 mb-3">
                    <span className="px-2 py-0.5 bg-slate-100 text-[#0b1f3a] text-[9px] font-black uppercase tracking-widest rounded">Contributor</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <div className="flex items-center gap-1">
                      <FaMapMarkerAlt className="h-2.5 w-2.5 text-amber-500" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{contributor.location || 'Nepal'}</span>
                    </div>
                  </div>

                  <p className="text-slate-500 text-xs mb-4 leading-relaxed line-clamp-3 font-medium">
                    {contributor.bio || 'Sharing the beauty of Nepal through hidden gems and local stories.'}
                  </p>

                  {/* Stats */}
                  <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                    <div>
                      <div className="text-base font-black text-[#0b1f3a]">{contributor.contributionsCount || '0'}</div>
                      <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none">Shared Gems</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>


      {/* CTA Section */}
      {/* CTA Section */}
      <section className="bg-[#0b1f3a] text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-500/10 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <p className="text-amber-400 font-black uppercase tracking-[0.3em] text-[10px] mb-4">Join the Inner Circle</p>
          <h2 className="text-3xl lg:text-4xl font-black mb-6 tracking-tighter uppercase leading-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-orange-500">
            Your Expertise <br />Deserves a Stage
          </h2>
          <p className="text-base opacity-70 max-w-2xl mx-auto mb-8 font-medium">
            Join Nepal's premier network of contributors. Share your journey, inspire
            thousands, and become a part of the legacy.
          </p>
          <button
            onClick={() => openAuthModal('signup')}
            className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-black uppercase tracking-[0.2em] text-xs hover:scale-105 transition-all shadow-2xl shadow-orange-500/20"
          >
            Apply to Join
          </button>
        </div>
      </section>
    </div>
  );
};

export default ContributorsPage;
