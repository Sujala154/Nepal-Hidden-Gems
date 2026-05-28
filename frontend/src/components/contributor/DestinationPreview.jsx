import React from 'react';
import { FaMapMarkerAlt, FaWallet, FaLeaf, FaCompass, FaCalendarAlt } from 'react-icons/fa';

const DestinationPreview = ({ formData }) => {
    const {
        name,
        location,
        tagline,
        budgetLevel,
        description,
        long_description,
        category,
        difficulty,
        bestSeason,
        image
    } = formData;

    const imageUrl = image instanceof File
        ? URL.createObjectURL(image)
        : (image?.startsWith('http') ? image : (image ? `http://localhost:5000${image}` : null));

    return (
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden flex flex-col h-full transform transition-all hover:shadow-amber-100/50">
            {/* Image Preview */}
            <div className="relative h-64 md:h-80 bg-slate-100 overflow-hidden">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={name || 'Destination Preview'}
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-inner">
                            <FaCompass className="text-3xl opacity-20" />
                        </div>
                        <p className="text-sm font-medium">No image uploaded yet</p>
                    </div>
                )}
                <div className="absolute top-6 left-6 flex flex-wrap gap-2">
                    <span className="px-4 py-1.5 bg-white/90 backdrop-blur-md text-slate-800 text-xs font-black rounded-full shadow-lg border border-white/20 uppercase tracking-[0.2em]">
                        {category || 'Nature'}
                    </span>
                    <span className="px-4 py-1.5 bg-[#6366f1] text-white text-xs font-black rounded-full shadow-lg uppercase tracking-[0.2em] border border-white/20">
                        Preview
                    </span>
                </div>

                {budgetLevel && (
                    <div className="absolute bottom-6 right-6 px-4 py-2 bg-slate-900/80 backdrop-blur-md text-white text-xs font-black rounded-xl shadow-lg flex items-center gap-2 border border-white/10">
                        <FaWallet className="text-[#fbbf24]" />
                        {budgetLevel}
                    </div>
                )}
            </div>

            {/* Content Preview */}
            <div className="p-8 md:p-10 flex-1 flex flex-col">
                <div className="mb-6">
                    <div className="flex items-center gap-2 text-[#6366f1] font-black text-[10px] uppercase tracking-[0.3em] mb-4">
                        <FaMapMarkerAlt className="animate-pulse" />
                        {location || 'Location Not Specified'}
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 leading-tight mb-5 tracking-tighter">
                        {name || 'Destination Name'}
                    </h2>
                    <p className="text-xl text-slate-400 font-medium leading-relaxed italic opacity-80">
                        "{tagline || 'Your catchy tagline will appear here...'}"
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-8">
                    <div className="p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Difficulty</p>
                        <p className="text-sm font-black text-slate-700 capitalize">{difficulty || 'Moderate'}</p>
                    </div>
                    <div className="p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Best Season</p>
                        <p className="text-sm font-black text-slate-700 capitalize">{bestSeason || 'All Year'}</p>
                    </div>
                </div>

                <div className="space-y-8 flex-1">
                    <div>
                        <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#6366f1]"></div>
                            Narrative
                        </h3>
                        <p className="text-slate-600 leading-relaxed font-medium pl-4.5 border-l border-slate-100">
                            {description || 'Tell the story of this destination...'}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 pt-6 border-t border-slate-50">
                        {formData.specialty && (
                            <div className="flex gap-4">
                                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500 shrink-0">
                                    <FaCompass />
                                </div>
                                <div>
                                    <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-900 mb-1">Atmosphere</h4>
                                    <p className="text-xs text-slate-500 leading-relaxed">{formData.specialty}</p>
                                </div>
                            </div>
                        )}
                        {formData.hospitality && (
                            <div className="flex gap-4">
                                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500 shrink-0">
                                    <FaLeaf />
                                </div>
                                <div>
                                    <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-900 mb-1">Local Experience</h4>
                                    <p className="text-xs text-slate-500 leading-relaxed">{formData.hospitality}</p>
                                </div>
                            </div>
                        )}
                        {formData.accommodation && (
                            <div className="flex gap-4">
                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                                </div>
                                <div>
                                    <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-900 mb-1">Stay & Logistics</h4>
                                    <p className="text-xs text-slate-500 leading-relaxed">{formData.accommodation}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DestinationPreview;
