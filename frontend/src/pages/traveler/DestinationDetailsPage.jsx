import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  FaMapMarkerAlt,
  FaArrowLeft,
  FaArrowRight,
  FaStar,
  FaEnvelope,
  FaPhone,
  FaUser,
  FaMountain,
  FaUtensils,
  FaUsers,
  FaBed,
  FaTag,
  FaHeart,
  FaRegHeart,
  FaCamera,
  FaWallet,
  FaCalendarAlt,
  FaCommentAlt,
  FaCheckCircle,
  FaSpinner
} from 'react-icons/fa';
import DestinationReviews from '../../components/traveler/DestinationReviews';
import { useFavorites } from '../../hooks/useFavorites';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { getImageUrl } from '../../utils/imageUtils';

const DestinationDetailsPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [destination, setDestination] = useState(null);
  const [allGuides, setAllGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [invitedGuides, setInvitedGuides] = useState({}); // { guideId: true/false }
  const [invitingGuides, setInvitingGuides] = useState({}); // { guideId: true/false }
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');

  // Handle Initial Scroll & Hash Scroll
  useEffect(() => {
    if (!loading) {
      if (location.hash) {
        const element = document.getElementById(location.hash.slice(1));
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth' });
          }, 300);
        }
      } else {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    }
  }, [loading, location.hash, location.pathname]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch destination primary data
        const destRes = await api.get(`/destinations/${slug}`);
        setDestination(destRes.data || destRes);

        // Fetch guides separately to avoid blocking the whole page
        try {
          const guidesRes = await api.get('/guides');
          if (guidesRes.success) {
            setAllGuides(guidesRes.data);
          }
        } catch (gErr) {
          console.error('Non-critical: Failed to load expert guides list', gErr);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching destination data:', err);
        setError(err.error || err.message || 'Failed to load gem details');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchData();
    }
  }, [slug]);

  // Helper to find real guide ID by name since embedded data lacks IDs
  const resolveGuideId = (guideName) => {
    if (!guideName) return null;
    const match = allGuides.find(g => g.name.toLowerCase().trim() === guideName.toLowerCase().trim());
    return match ? match._id : null;
  };

  const handleInvite = async (guide) => {
    const guideId = guide._id || resolveGuideId(guide.name);
    console.log(`[INVITE_DEBUG] Inviting Expert: ${guide.name} with resolved ID: ${guideId}`);
    if (!guideId) {
      toast.error(`Detail profile for ${guide.name} is not available.`);
      return;
    }

    if (invitedGuides[guideId] || invitingGuides[guideId]) return;
    
    try {
      setInvitingGuides(prev => ({ ...prev, [guideId]: true }));
      const res = await api.post('/chats/invite', { guideId });
      if (res.success) {
        setInvitedGuides(prev => ({ ...prev, [guideId]: true }));
        toast.success(`Invite sent to ${guide.name}!`, {
          icon: '📩',
          style: {
            borderRadius: '15px',
            background: '#0b1f3a',
            color: '#fff',
            fontSize: '12px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          },
        });
      } else {
        toast.error(res.error || 'Failed to send invitation');
      }
    } catch (err) {
      console.error('Invite error:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setInvitingGuides(prev => ({ ...prev, [guideId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading destination guide...</p>
        </div>
      </div>
    );
  }

  if (error || !destination) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Destination Not Found</h1>
          <p className="text-slate-600 mb-6">{error || 'The destination you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-semibold hover:from-amber-600 hover:to-orange-600 transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Flexible image selector - combining all possible image sources safely
  let allImages = [];
  if (destination.image) {
      allImages.push(destination.image);
  }
  if (destination.multiple_images && destination.multiple_images.length > 0) {
      destination.multiple_images.forEach(img => {
          if (!allImages.includes(img)) allImages.push(img);
      });
  } else if (destination.images && destination.images.length > 0) {
      destination.images.forEach(img => {
          if (!allImages.includes(img)) allImages.push(img);
      });
  }
  
  const mainImage = allImages.length > 0 ? allImages[0] : null;

  return (
    <div className="max-w-7xl mx-auto -mt-2 animate-in fade-in duration-500 space-y-6">

      {/* Hero Map Section */}
      <section className="relative w-full h-[450px] rounded-[24px] overflow-hidden shadow-sm bg-slate-100">
        {/* Back Button */}
        <div className="absolute top-6 left-6 z-40">
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 2) {
                navigate(-1);
              } else {
                navigate(location.pathname.startsWith('/contributor') ? '/contributor/submissions' : '/destinations');
              }
            }}
            className="w-10 h-10 flex items-center justify-center bg-slate-900/50 backdrop-blur-md border border-white/20 rounded-xl text-white hover:bg-white hover:text-[#0b1f3a] transition-all duration-300 shadow-lg group cursor-pointer"
          >
            <FaArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Favourites Button */}
        <div className="absolute top-6 right-6 z-40 group/heart">
          <button
            onClick={() => toggleFavorite(destination._id)}
            className={`w-12 h-12 relative z-50 ${isFavorite(destination?._id) ? 'bg-white text-red-500 shadow-red-500/20' : 'bg-slate-900/50 text-white'} backdrop-blur-md border border-white/20 rounded-xl flex items-center justify-center hover:bg-white hover:text-red-500 transition-all duration-300 shadow-lg active:scale-95`}
          >
            {isFavorite(destination?._id) ? <FaHeart className="w-5 h-5" /> : <FaRegHeart className="w-5 h-5" />}
          </button>
        </div>

        <iframe
          title={`Map of ${destination.name}`}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          src={`https://maps.google.com/maps?q=${encodeURIComponent(destination.name + ', ' + destination.location + ', Nepal')}&t=m&z=13&ie=UTF8&iwloc=&output=embed`}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Glassmorphism Overlay for Location */}
        <div className="absolute bottom-6 left-6 z-40 bg-white/30 backdrop-blur-lg border border-white/40 px-5 py-3 rounded-2xl shadow-xl pointer-events-none">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <FaMapMarkerAlt className="text-amber-500 text-sm" />
              </div>
              <span className="font-black text-[#0b1f3a] text-sm tracking-widest uppercase drop-shadow-sm">{destination.location}</span>
           </div>
        </div>
      </section>

      {/* Header Info */}
      <section className="px-2 mb-4">
        <h1 className="text-3xl md:text-4xl font-black text-[#0b1f3a] mb-3 tracking-tighter uppercase">{destination.name}</h1>
        <div className="flex flex-wrap items-center gap-4 text-slate-600">
          <div className="flex items-center gap-2">
            <FaMapMarkerAlt className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-bold">{destination.location}</span>
          </div>
          {destination.category && (
            <div className="bg-amber-500 text-white px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest shadow-sm">
              {destination.category}
            </div>
          )}
          <div className="flex items-center gap-2">
            <FaStar className={`w-4 h-4 ${destination.rating > 0 ? 'text-amber-500' : 'text-slate-300'}`} />
            <span className="text-sm font-black text-[#0b1f3a]">{Number(destination.rating || 0).toFixed(1)}</span>
            <span className="text-slate-300 text-xs">|</span>
            <div className="flex items-center gap-1.5 text-slate-500 text-xs cursor-pointer hover:text-amber-500 transition-colors uppercase font-bold tracking-wider" onClick={() => document.getElementById('reviews').scrollIntoView({ behavior: 'smooth' })}>
              <FaCommentAlt className="w-3.5 h-3.5" />
              <span>{destination.numReviews || 0} Reviews</span>
            </div>
          </div>
        </div>
      </section>

      {/* Image Gallery */}
      <section className="px-2">
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar items-stretch">
          {(allImages.length > 0 ? allImages : ['fallback-1', 'fallback-2', 'fallback-3']).map((image, index) => (
            <div key={index} className={`relative shrink-0 rounded-[20px] overflow-hidden group snap-start border border-slate-100 shadow-sm ${index === 0 ? 'w-[85vw] max-w-2xl h-64 md:h-80' : 'aspect-[4/3] h-64 md:h-80'}`}>
              <img
                src={typeof image === 'string' && image.startsWith('fallback') ? `https://placehold.co/800x600?text=No+Photo+Available` : getImageUrl(image)}
                alt={`${destination.name} - Image ${index + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                onError={(e) => { e.target.src = 'https://placehold.co/800x600?text=No+Photo+Available'; }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Tagline */}
      {destination.tagline && (
        <section className="px-2 mt-2 mb-2">
           <p className="text-lg text-slate-600 max-w-4xl font-medium leading-relaxed italic border-l-4 border-amber-500 pl-4 bg-amber-50/50 py-2 rounded-r-xl">{destination.tagline}</p>
        </section>
      )}

      {/* Main Content */}
      <main className="space-y-6 px-2">
        {/* Travel Info Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center gap-4 transition-all hover:border-amber-200 hover:shadow-md group shadow-sm">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-amber-500 text-sm shadow-sm group-hover:bg-amber-500 group-hover:text-white transition-all">
              <FaWallet />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Budget</p>
              <p className="text-sm font-black text-[#0b1f3a] tracking-tight uppercase">{destination.budgetLevel || 'Mid-Range'}</p>
            </div>
          </div>

          <div className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center gap-4 transition-all hover:border-amber-200 hover:shadow-md group shadow-sm">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-sky-500 text-sm shadow-sm group-hover:bg-sky-500 group-hover:text-white transition-all">
              <FaMountain />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Difficulty</p>
              <p className="text-sm font-black text-[#0b1f3a] tracking-tight uppercase">{destination.difficulty || 'Moderate'}</p>
            </div>
          </div>

          <div className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center gap-4 transition-all hover:border-amber-200 hover:shadow-md group shadow-sm">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-emerald-500 text-sm shadow-sm group-hover:bg-emerald-500 group-hover:text-white transition-all">
              <FaCalendarAlt />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Best Season</p>
              <p className="text-sm font-black text-[#0b1f3a] tracking-tight uppercase">{destination.bestSeason === 'all' ? 'All Year' : destination.bestSeason || 'Autumn'}</p>
            </div>
          </div>
        </section>

        {/* Detailed Description */}
        <section className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h2 className="text-lg font-black text-[#0b1f3a] mb-3 uppercase tracking-tight">About {destination.name}</h2>
          <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-line font-medium mb-8 max-w-4xl">
            {destination.description}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {destination.specialty && (
              <div className="bg-slate-50/50 p-5 rounded-xl border border-slate-100 group hover:border-amber-200 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center text-base">
                    <FaMountain />
                  </div>
                  <h3 className="font-bold text-sm text-[#0b1f3a] uppercase tracking-wide">Scenery & Atmosphere</h3>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">{destination.specialty}</p>
              </div>
            )}

            {destination.hospitality && (
              <div className="bg-slate-50/50 p-5 rounded-xl border border-slate-100 group hover:border-amber-200 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center text-base">
                    <FaUtensils />
                  </div>
                  <h3 className="font-bold text-sm text-[#0b1f3a] uppercase tracking-wide">Food & Hospitality</h3>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">{destination.hospitality}</p>
              </div>
            )}

            {destination.accommodation && (
              <div className="bg-slate-50/50 p-5 rounded-xl border border-slate-100 md:col-span-2 group hover:border-amber-200 transition-colors flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center text-base">
                      <FaBed />
                    </div>
                    <h3 className="font-bold text-sm text-[#0b1f3a] uppercase tracking-wide">Accommodation</h3>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">{destination.accommodation}</p>
                </div>
                <div className="md:w-1/3 bg-white p-4 rounded-xl border border-slate-100 flex flex-col justify-center">
                  <div className="flex items-center gap-2 text-slate-900 font-bold mb-2">
                    <FaTag className="text-amber-500 text-sm" />
                    <span className="text-xs uppercase tracking-wider">Costs</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">Prices vary by season. Local home-stays offer authentic budget options.</p>
                </div>
              </div>
            )}
          </div>
          
          {destination.tips && (
            <div className="mt-6 bg-[#0b1f3a] p-5 rounded-xl shadow-md text-white flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-lg shrink-0 border border-white/5">
                <FaTag className="text-amber-400" />
              </div>
              <div>
                 <h3 className="font-black text-[10px] uppercase tracking-widest text-amber-400 mb-1.5">Travel Tips</h3>
                 <p className="text-white/90 leading-relaxed text-sm italic">"{destination.tips}"</p>
              </div>
            </div>
          )}
        </section>

        {/* Local Guides Section */}
        {destination.guides && destination.guides.length > 0 && (
          <section id="guides" className="mb-12">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="text-xl font-black text-[#0b1f3a] tracking-tighter uppercase">Local Experts</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Verified guides for this gem</p>
              </div>
              <div className="bg-amber-50 text-amber-600 px-3 py-1.5 rounded-lg font-black text-[9px] uppercase tracking-widest border border-amber-100 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" /> {destination.guides.length} Online
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {destination.guides.map((guide, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl border border-slate-100 p-4 hover:border-amber-200 transition-all duration-300 group relative"
                >
                  <div
                    className="relative flex items-center gap-3 mb-4 cursor-pointer"
                    onClick={() => {
                      const navState = { destinationName: destination.name, amount: 2500 };
                      const realId = guide._id || resolveGuideId(guide.name);

                      if (realId) {
                        navigate(`/guides/${realId}`, { state: navState });
                      } else {
                        // Handle demo fallbacks for hardcoded seed data
                        const lowerName = guide.name.toLowerCase();
                        if (lowerName.includes('shyam')) navigate('/guides/6963ffa629a682e6a93a20f2', { state: navState });
                        else if (lowerName.includes('rita')) navigate('/guides/6963ffa629a682e6a93a20f6', { state: navState });
                        else {
                          // Stay on page and show info if guide profile is missing
                          toast.error(`Detail profile for ${guide.name} is not available.`);
                        }
                      }
                    }}
                  >
                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 text-xl border border-slate-100 group-hover:scale-105 transition-transform">
                      <FaUser />
                    </div>
                    {(() => {
                      const match = allGuides.find(g => (g._id === guide._id) || (g.name?.toLowerCase().trim() === guide.name?.toLowerCase().trim()));
                      return (
                        <div>
                          <h3 className="text-sm font-black text-[#0b1f3a] tracking-tight mb-1 uppercase leading-none">{guide.name}</h3>
                          <div className="flex items-center gap-1 text-amber-500 text-[8px] font-black uppercase tracking-widest">
                            {match?.numReviews > 0 ? (
                              <>
                                <FaStar className="mb-0.5" /> {match.averageRating} • {match.numReviews} Reviews
                              </>
                            ) : (
                              <span className="text-slate-300">New Expert</span>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  <p className="text-slate-500 text-[11px] mb-4 line-clamp-2 leading-relaxed font-medium">
                    {guide.experience || "Passionate expert with extensive knowledge of this region's trails and secrets."}
                  </p>

                  <div className="pt-4 border-t border-slate-50 flex gap-2">
                    <button
                      onClick={() => {
                        const navState = { destinationName: destination.name, amount: 2500 };
                        const realId = guide._id || resolveGuideId(guide.name);

                        if (realId) {
                          navigate(`/guides/${realId}`, { state: navState });
                        } else {
                          const lowerName = guide.name.toLowerCase();
                          if (lowerName.includes('shyam')) navigate('/guides/6963ffa629a682e6a93a20f2', { state: navState });
                          else if (lowerName.includes('rita')) navigate('/guides/6963ffa629a682e6a93a20f6', { state: navState });
                          else {
                            toast.error(`Detail profile for ${guide.name} is not available.`);
                          }
                        }
                      }}
                      className="flex-1 py-2.5 bg-[#0b1f3a] text-white rounded-lg font-black text-[9px] uppercase tracking-widest shadow-sm hover:bg-amber-600 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      Book Now
                    </button>

                    {user.role === 'traveler' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInvite(guide);
                        }}
                        disabled={invitedGuides[guide._id || resolveGuideId(guide.name)] || invitingGuides[guide._id || resolveGuideId(guide.name)]}
                        className={`px-4 py-3 border-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 group/invite ${
                          invitedGuides[guide._id || resolveGuideId(guide.name)]
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                            : 'bg-white border-slate-100 text-[#0b1f3a] hover:border-amber-200 hover:bg-amber-50/30'
                        }`}
                        title="Invite to Chat"
                      >
                        {invitingGuides[guide._id || resolveGuideId(guide.name)] ? (
                          <div className="w-3 h-3 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
                        ) : invitedGuides[guide._id || resolveGuideId(guide.name)] ? (
                           <FaCheckCircle className="text-emerald-500" />
                        ) : (
                          <FaCommentAlt className="w-3 h-3 text-amber-500 group-hover/invite:scale-110 transition-transform" />
                        )}
                        {invitedGuides[guide._id || resolveGuideId(guide.name)] ? 'Invited' : 'Invite'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}


        {/* Reviews Section */}
        <section id="reviews" className="mb-20 scroll-mt-20">
          <DestinationReviews destinationId={destination._id} />
        </section>

      </main>
    </div>
  );
};

export default DestinationDetailsPage;

