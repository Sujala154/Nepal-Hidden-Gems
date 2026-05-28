import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaStar,
  FaMapMarkerAlt,
  FaCompass,
  FaUsers,
  FaShieldAlt,
  FaCamera,
  FaMap,
  FaHeart,
  FaRegHeart
} from "react-icons/fa";
import { useFavorites } from "../../hooks/useFavorites";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import GemCard from "../../components/common/GemCard";

const LandingPage = () => {
  const { openAuthModal } = useAuth();
  const navigate = useNavigate();
  const [featuredGems, setFeaturedGems] = useState([]);

  // Load initial destinations to showcase on the landing page
  useEffect(() => {
    const loadFeaturedGems = async () => {
      try {
        const response = await api.get('/destinations');
        if (response.success && Array.isArray(response.data)) {
          setFeaturedGems(response.data.slice(0, 4));
        }
      } catch (err) {
        // If featured gems fail to load, we'll just display placeholders.
        // No critical error, so no console log needed here.
      }
    };
    loadFeaturedGems();
  }, []);

  const coreValuePillars = [
    { icon: FaCompass, title: "Curated Trails", desc: "Access secret paths and off-beat spots strictly verified by locals." },
    { icon: FaUsers, title: "Verified Local Guides", desc: "Connect with experts who bring the stories of Nepal to life." },
    { icon: FaShieldAlt, title: "Safety First", desc: "Every destination and guide undergoes a strict verification process." },
    { icon: FaCamera, title: "Contributor Network", desc: "A vibrant community sharing high-quality authentic media." },
    { icon: FaMap, title: "Contextual Maps", desc: "Navigation enhanced with cultural insights and offline availability." },
    { icon: FaHeart, title: "Responsible Impact", desc: "Our platform prioritizes sustainable and community-centric travel." },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Intro section with background and action button */}
      <section className="relative min-h-[45vh] flex items-center overflow-hidden bg-gradient-to-b from-[#020916] via-[#0b1f3a] to-[#101b34]">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
          style={{ backgroundImage: "url(https://images.unsplash.com/photo-1500534310686-2a0f4e58d1f3?w=1920)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b1f3a] via-[#0b1f3a]/80 to-transparent" />
        
        {/* Background visual effects */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-12 left-10 w-72 h-72 bg-amber-500 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-12 right-10 w-96 h-96 bg-blue-500 rounded-full blur-[100px] animate-pulse delay-1000" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-6 w-full animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="max-w-3xl z-10">
              <h1 className="text-3xl md:text-5xl font-black text-white leading-[0.9] mb-4 uppercase tracking-tighter">
                Explore the <br />
                <span className="text-white pr-4">Unseen</span>
                Nepal
              </h1>

              <p className="text-sm text-slate-300 max-w-md font-medium leading-relaxed mb-6 border-l-4 border-amber-500/50 pl-4">
                Nepal Hidden Gems is a community-driven sanctuary for travelers seeking genuine destinations, 
                verified local expertise, and stories that transcend maps.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link to="/explore" className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all">
                  Browse Gems
                </Link>
              </div>
            </div>

            <div className="hidden lg:block relative">
              <div className="absolute -inset-8 bg-gradient-to-r from-amber-500 to-orange-600 rounded-[3rem] blur-3xl opacity-10" />
              <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl transition-all duration-1000">
                <img
                  src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200"
                  alt="Nepal Hidden Gem"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b1f3a]/40 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights of available destinations */}
      <section className="py-6 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="mb-4 max-w-2xl mx-auto">
            <h2 className="text-xl md:text-2xl font-black text-[#0b1f3a] uppercase tracking-tighter">Featured Hidden Gems</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredGems.length > 0 ? (
              featuredGems.map(gem => (
                <div key={gem._id} className="block transform hover:-translate-y-2 transition-transform duration-500">
                  <GemCard gem={gem} />
                </div>
              ))
            ) : (
              [1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-[3/4] bg-slate-50 rounded-[2rem] animate-pulse border border-slate-100" />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Core focus areas of the platform */}
      <section className="py-8 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="mb-8">
            <h2 className="text-xl md:text-2xl font-black text-[#0b1f3a] uppercase tracking-tighter">Why We're Different</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
            {coreValuePillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="bg-white border border-slate-200 rounded-[1.5rem] p-6 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#0b1f3a] flex items-center justify-center text-amber-400 mb-6 group-hover:scale-110 transition-transform shadow-xl">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black text-[#0b1f3a] uppercase tracking-tight mb-4">{pillar.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed font-medium">{pillar.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to join the community */}
      <section className="py-10 bg-[#0b1f3a] text-white relative overflow-hidden text-center">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-[150px]" />
        </div>
        
        <div className="relative max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tighter uppercase leading-none text-white">
            Your Journey <br /> starts here.
          </h2>
          <p className="text-sm text-slate-400 mb-6 max-w-2xl mx-auto font-medium leading-relaxed">
            Stop dreaming and start exploring. Join a curated community that values 
            authenticity, preservation, and the thrill of the unknown.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => openAuthModal('signup')}
              className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 text-[#0b1f3a] rounded-xl font-black uppercase tracking-[0.2em] text-[10px] hover:scale-105 transition-all shadow-2xl shadow-orange-500/40"
            >
              Join the Community
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
