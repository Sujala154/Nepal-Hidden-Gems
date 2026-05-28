import React from 'react';
import { FaMapMarkerAlt, FaStar, FaMountain, FaUtensils, FaBed, FaTag, FaUsers, FaImage } from 'react-icons/fa';
import { buildBackendUrl } from '../../utils/backendUrls';

const UnifiedDestinationContainer = ({ destination }) => {
  if (!destination) return null;

  const galleryImages = destination.images || destination.multiple_images || [];

  return (
    <div className="space-y-6">
      {/* Photo Gallery / Main Image */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 text-sm">
            <FaImage />
          </div>
          <h3 className="text-base font-black text-slate-900 tracking-tight">Gallery</h3>
        </div>
        
        {galleryImages && galleryImages.length > 1 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Main large image */}
            <div className="h-64 md:h-auto min-h-[260px] rounded-2xl overflow-hidden shadow-sm border border-slate-100">
              <img 
                src={buildBackendUrl(galleryImages[0])} 
                alt={destination.name} 
                className="w-full h-full object-cover"
              />
            </div>
            {/* Thumbnail grid for other images */}
            <div className="grid grid-cols-2 gap-3">
              {galleryImages.slice(1, 5).map((img, idx) => (
                <div key={idx} className="h-32 rounded-xl overflow-hidden border border-slate-100 shadow-sm">
                  <img 
                    src={buildBackendUrl(img)} 
                    alt={`${destination.name} ${idx + 2}`} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              {/* Optional: Add a placeholder if less than 5 images but at least 2 */}
              {galleryImages.length < 5 && (
                <div className="h-32 rounded-xl bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 gap-1">
                   <FaImage className="text-sm" />
                   <span className="text-[8px] font-bold uppercase tracking-widest">More coming</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Single image layout */
          <div className="h-[280px] w-full rounded-3xl overflow-hidden shadow-xl border border-slate-100">
            <img 
               src={buildBackendUrl(destination.image)} 
               alt={destination.name} 
               className="w-full h-full object-cover"
            />
          </div>
        )}
      </section>

      {/* Primary Content */}
      <section className="bg-[#0b1f3a] rounded-[2rem] overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/5">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2 uppercase leading-none">
                {destination.name}
              </h2>
              <div className="flex items-center gap-3 text-amber-400 font-black uppercase text-[10px] tracking-[0.2em]">
                <FaMapMarkerAlt className="text-amber-500" /> {destination.location}
              </div>
            </div>
            <div className="px-6 py-2 bg-white/5 backdrop-blur-md border border-white/10 text-amber-500 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">
                {destination.category || 'Hidden Gem'}
            </div>
          </div>
          <p className="text-base text-slate-400 font-medium italic leading-relaxed border-l-4 border-amber-500/50 pl-5">
            "{destination.tagline || 'A journey beyond the ordinary.'}"
          </p>
        </div>

        <div className="p-4 bg-white">
          <div className="mb-4">
            <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-300 mb-1.5 px-1">Core Narrative</h4>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-slate-700 text-base whitespace-pre-line leading-relaxed font-medium italic">
                {destination.description || 'No detailed narrative provided.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
             {/* Specialty */}
             <div className="group">
                <div className="flex items-center gap-2 mb-1.5 px-1">
                  <FaMountain className="text-slate-900 text-[11px]" />
                  <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-900">Specialty</h4>
                </div>
                <div className="p-3.5 bg-white border border-slate-100 rounded-xl group-hover:border-indigo-100 transition-colors shadow-sm">
                   <p className="text-slate-600 text-sm leading-relaxed font-medium">
                      {destination.specialty || 'Characteristics and atmosphere details are coming soon.'}
                   </p>
                </div>
             </div>

             {/* Food & Hospitality */}
             <div className="group">
                <div className="flex items-center gap-2 mb-1.5 px-1">
                  <FaUtensils className="text-slate-900 text-[11px]" />
                  <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-900">Local Vibe</h4>
                </div>
                <div className="p-3.5 bg-white border border-slate-100 rounded-xl group-hover:border-indigo-100 transition-colors shadow-sm">
                   <p className="text-slate-600 text-sm leading-relaxed font-medium">
                      {destination.hospitality || 'Food and community hospitality details are coming soon.'}
                   </p>
                </div>
             </div>

             {/* Accommodation */}
             <div className="group md:col-span-2">
                <div className="flex items-center gap-2 mb-1.5 px-1">
                  <FaBed className="text-slate-900 text-[11px]" />
                  <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-900">Where to Stay</h4>
                </div>
                <div className="p-3.5 bg-white border border-slate-100 rounded-xl group-hover:border-indigo-100 transition-colors shadow-sm">
                   <p className="text-slate-600 text-sm leading-relaxed font-medium">
                      {destination.accommodation || 'Specific accommodation and residency options are not yet listed.'}
                   </p>
                </div>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default UnifiedDestinationContainer;
