import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const AboutPage = () => {
  const { openAuthModal } = useAuth();
  const pillars = [
    {
      title: "Local-first",
      icon: "🏔️",
      description:
        "We prioritize local insights above all. Every destination on our platform is scouted or approved by locals who live and breathe the Himalayan air.",
    },
    {
      title: "Safe & Verified",
      icon: "🛡️",
      description:
        "Safety is our cornerstone. We verify every guide's credentials and perform regular spot-checks on destinations to ensure reliable information.",
    },
    {
      title: "Sustainable",
      icon: "🌱",
      description:
        "We champion low-impact travel. By directing tourism to less-visited areas, we help distribute wealth and minimize environmental footprints.",
    },
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden bg-[#0b1f3a]">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay"
            style={{ backgroundImage: "url(https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0b1f3a]/80 via-[#0b1f3a]/40 to-[#0b1f3a]" />
          <div className="absolute top-12 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-12 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 text-center text-white w-full animate-in fade-in slide-in-from-bottom-8 duration-1000 py-16">
          <p className="text-amber-400 font-black uppercase tracking-[0.4em] text-[10px] mb-4">Our Legacy & Mission</p>
          <h1 className="text-4xl lg:text-6xl font-black mb-6 tracking-tighter uppercase leading-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-orange-500">
            Beyond the <br />Beaten Path
          </h1>
          <p className="text-base lg:text-xl text-slate-300 font-medium leading-relaxed max-w-2xl mx-auto mb-8">
            Connecting global explorers with the authentic soul of Nepal through
            local expertise, community stories, and sustainable discovery.
          </p>
          <button
            onClick={() => openAuthModal('signup')}
            className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-black uppercase tracking-[0.2em] text-xs hover:scale-105 transition-all shadow-2xl shadow-orange-500/20"
          >
            Join the Movement
          </button>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="py-16 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-in fade-in slide-in-from-left-6 duration-700">
              <p className="text-amber-600 text-[10px] font-black uppercase tracking-[0.4em] mb-2">Foundation</p>
              <h3 className="text-3xl lg:text-4xl font-black text-[#0b1f3a] mb-6 tracking-tight uppercase leading-tight">Bridging Discovery <br />& Preservation</h3>
              <p className="text-base text-slate-500 leading-relaxed mb-6 font-medium">
                Modern tourism often misses the heartbeat of Nepal. While a few trails became
                overcrowded, thousands of pristine valleys and vibrant cultures remained unheard.
                <strong className="text-[#0b1f3a] block mt-2">Nepal Hidden Gems was engineered to restore this balance.</strong>
              </p>
              <p className="text-base text-slate-500 leading-relaxed font-medium">
                We utilize community-first data to map the unmapped, ensuring sustainable
                tourism that enriches local economies while protecting the natural sanctity
                of our mountains.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all group">
                <div className="w-12 h-12 bg-[#0b1f3a] rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">🏔️</div>
                <h4 className="text-lg font-black text-[#0b1f3a] mb-2 uppercase tracking-tight">Empowerment</h4>
                <p className="text-slate-500 text-xs font-medium leading-relaxed">Providing local experts with a premier global stage to showcase their profound heritage.</p>
              </div>
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all group">
                <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">🛡️</div>
                <h4 className="text-lg font-black text-[#0b1f3a] mb-2 uppercase tracking-tight">Safety First</h4>
                <p className="text-slate-500 text-xs font-medium leading-relaxed">Opening remote regions through rigorous verification and expert-led navigation systems.</p>
              </div>
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all group md:col-span-2">
                <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">✨</div>
                <h4 className="text-lg font-black text-[#0b1f3a] mb-2 uppercase tracking-tight">Authenticity</h4>
                <p className="text-slate-500 text-xs font-medium leading-relaxed">Every recommendation is distilled from real local experiences, standing firm against commercial trends.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Story Section */}
      <section className="py-16 max-w-7xl mx-auto px-6">
        <div className="bg-[#0b1f3a] rounded-[2.5rem] p-8 lg:p-16 text-white relative overflow-hidden shadow-[0_30px_60px_rgba(11,31,58,0.2)]">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-red-500/10 rounded-full blur-[120px]" />

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <p className="text-amber-500 font-black uppercase tracking-[0.4em] text-[10px] mb-6">The Genesis</p>
            <h2 className="text-3xl lg:text-5xl font-black mb-8 tracking-tighter uppercase leading-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-orange-500">
              The Heart of the <br />Journey
            </h2>
            <div className="space-y-6 text-lg text-slate-400 leading-relaxed font-medium">
              <p>
                Our journey began in the silent valleys of Karnali. We encountered a culture
                of such depth and landscapes so breathtaking, they challenged our perception
                of the world. Yet, these regions were invisible on the global map.
              </p>
              <p>
                We realized that mainstream travel platforms only scratched the superficial.
                There was a desperate need for a dedicated hub to verify and curate these
                forgotten gems, providing a professional stage for local guardians.
              </p>
              <p className="text-white text-xl font-black italic pt-6 border-t border-white/5">
                "Today, we are home to the most elite network of verified destinations
                and professional guides in the Himalayas."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars Section */}
      <section className="py-16 max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-amber-600 text-[10px] font-black uppercase tracking-[0.4em] mb-2">Core Values</p>
          <h2 className="text-3xl lg:text-4xl font-black text-[#0b1f3a] tracking-tight uppercase">The Pillars of Elite Exploration</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-12">
          {pillars.map((pillar) => (
            <div key={pillar.title} className="group text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner group-hover:bg-white group-hover:shadow-[0_40px_80px_rgba(0,0,0,0.1)] group-hover:-translate-y-4 transition-all duration-700">
                {pillar.icon}
              </div>
              <h3 className="text-xl font-black text-[#0b1f3a] mb-4 uppercase tracking-tight">{pillar.title}</h3>
              <p className="text-slate-500 leading-relaxed italic px-4 font-medium text-sm">{pillar.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-white py-16 text-center text-[#0b1f3a]">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-amber-600 font-black uppercase tracking-[0.4em] text-[10px] mb-6">Adventure Calls</p>
          <h2 className="text-3xl lg:text-5xl font-black mb-8 tracking-tighter uppercase leading-[0.9]">Ready to Find <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">Your Own Gem?</span></h2>
          <p className="text-base text-slate-500 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
            Every epic journey begins with a single act of curiosity. Start your era of
            authentic discovery today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <button
              onClick={() => openAuthModal('signup')}
              className="px-8 py-3 bg-[#0b1f3a] text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] hover:scale-105 transition-all shadow-2xl shadow-indigo-500/20"
            >
              Create Account
            </button>
            <button
              onClick={() => openAuthModal('login')}
              className="px-8 py-3 bg-white border-2 border-[#0b1f3a]/10 text-[#0b1f3a] rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-slate-50 transition-all"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;

