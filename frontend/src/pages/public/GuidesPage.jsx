import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { FaUser, FaStar, FaHiking, FaSpinner, FaSearch, FaLanguage, FaCompass } from 'react-icons/fa';
import api from '../../services/api';

const specialtyOptions = [
  "Trekking", "Cultural Tours", "Mountain Biking", "History", "Wildlife", "Photography",
  "Adventure Sports", "Religious Sites", "Local Cuisine", "Hiking", "Camping",
  "Backpacking", "Climbing", "River Rafting", "Yoga & Meditation", "Bird Watching",
  "Architecture", "Art & Crafts", "Folk Music"
];

const languageOptions = [
  "Nepali", "English", "Hindi", "French", "Spanish", "German", "Japanese",
  "Chinese", "Korean", "Italian", "Portuguese", "Russian", "Arabic", "Hebrew",
  "Thai", "Vietnamese", "Turkish", "Greek", "Tibetan", "Sherpa"
];

const GuidesPage = () => {
  const navigate = useNavigate();
  const { searchTerm = '' } = useOutletContext() || {};
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        setLoading(true);
        const res = await api.get('/guides');
        if (res.success) {
          setGuides(res.data);
        }
      } catch (err) {
        console.error('Error fetching guides:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGuides();
  }, []);

  const filteredGuides = guides.filter(guide => {
    const matchesSpecialty = !selectedSpecialty || (guide.specialty && guide.specialty.includes(selectedSpecialty));
    const matchesLanguage = !selectedLanguage || (guide.languages && guide.languages.includes(selectedLanguage));

    const term = searchTerm.toLowerCase();
    const matchesSearch = !term ||
      guide.name?.toLowerCase().includes(term) ||
      guide.bio?.toLowerCase().includes(term) ||
      guide.specialty?.some(s => s.toLowerCase().includes(term)) ||
      guide.languages?.some(l => l.toLowerCase().includes(term));

    return matchesSpecialty && matchesLanguage && matchesSearch;
  });


  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
        <FaSpinner className="text-amber-500 text-2xl animate-spin mb-4" />
        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Loading Experts...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-20">
        {/* Header Section - Clean & Minimal */}
        <div className="text-left mb-4">
          <h1 className="text-xl font-black text-[#0b1f3a] tracking-tighter uppercase">
            Local Guides
          </h1>
        </div>

        {/* Filters Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {/* Specialty */}
          <div className="relative group">
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-bold text-[10px] uppercase tracking-widest appearance-none cursor-pointer shadow-sm"
            >
              <option value="">All Specialities</option>
              {specialtyOptions.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>

          {/* Language */}
          <div className="relative group">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-bold text-[10px] uppercase tracking-widest appearance-none cursor-pointer shadow-sm"
            >
              <option value="">All Languages</option>
              {languageOptions.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Guides Grid */}
        {filteredGuides.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGuides.map(guide => (
              <div
                key={guide._id}
                className="bg-white rounded-2xl border border-slate-100 p-4 hover:border-amber-200 transition-all duration-300 flex flex-col group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 text-2xl overflow-hidden shrink-0 border border-slate-100 group-hover:scale-105 transition-transform duration-300">
                    {guide.profileImage ? (
                      <img src={guide.profileImage} alt={guide.name} className="w-full h-full object-cover" />
                    ) : (
                      <FaUser className="text-[#0b1f3a]/10" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-black text-[#0b1f3a] tracking-tighter leading-none mb-1.5 uppercase">{guide.name}</h3>
                    <div className="flex items-center gap-1 text-amber-500 text-[9px] font-black uppercase tracking-widest">
                      {guide.numReviews > 0 ? (
                        <>
                          <FaStar className="mb-0.5 text-[8px]" /> {guide.averageRating} • {guide.numReviews} Reviews
                        </>
                      ) : (
                        <span className="text-slate-300">New Expert • Verified</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {guide.specialty?.slice(0, 3).map((spec, i) => (
                    <span key={i} className="px-2 py-0.5 bg-slate-50 text-[#0b1f3a] text-[8px] font-black uppercase tracking-widest rounded-md border border-slate-100">{spec}</span>
                  ))}
                </div>

                <p className="text-slate-500 text-[11px] mb-4 line-clamp-3 leading-relaxed font-medium">
                  {guide.bio || "Passionate expert with extensive knowledge of Nepal's trails and local secrets."}
                </p>

                <div className="pt-4 border-t border-slate-50 flex items-center justify-between mt-auto">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Rate</span>
                    <span className="text-base font-black text-[#0b1f3a]">Rs. 3,500<span className="text-[9px] text-slate-400 font-bold tracking-normal">/day</span></span>
                  </div>
                  <button
                    onClick={() => navigate(`/guides/${guide._id}`)}
                    className="px-4 py-2 bg-[#0b1f3a] text-white rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-amber-600 transition-all active:scale-95 shadow-sm"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-2xl border-2 border-dashed border-slate-100 mb-20">
            <div className="w-24 h-24 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-8 text-slate-200 text-3xl shadow-inner">
              <FaSearch />
            </div>
            <h3 className="text-2xl font-black text-[#0b1f3a] tracking-tight uppercase">No Experts Found</h3>
            <p className="text-slate-500 mt-2 font-medium">Try broadening your search or adjusting your filters.</p>
          </div>
        )}
      </div>
  );
};

export default GuidesPage;
