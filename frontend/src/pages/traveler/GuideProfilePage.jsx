import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaUser, 
  FaCalendarAlt, 
  FaStar, 
  FaEnvelope, 
  FaPhone, 
  FaCheckCircle, 
  FaArrowLeft, 
  FaSpinner, 
  FaShieldAlt,
  FaMountain,
  FaArrowRight,
  FaCommentDots,
  FaUsers
} from 'react-icons/fa';
import api from '../../services/api';
import { buildBackendUrl } from '../../utils/backendUrls';
import toast from 'react-hot-toast';

const GuideProfilePage = () => {
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const { guideId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [availableGroups, setAvailableGroups] = useState([]);
  const [searchingGroups, setSearchingGroups] = useState(false);
  const [invited, setInvited] = useState(false);
  const [inviting, setInviting] = useState(false);
  
  // Get destination data from navigation state if available
  const initialDest = location.state?.destinationName || 'Mount Everest';
  const initialAmount = location.state?.amount || 2500;

  // Get tomorrow's date as minimum (no same-day or past bookings)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const [bookingData, setBookingData] = useState({
    date: '',
    destinationName: initialDest,
    amount: initialAmount,
    type: 'private'
  });

  const fetchAvailableGroups = async (date) => {
    if (!guide?._id || !date) return;
    try {
      setSearchingGroups(true);
      const res = await api.get(`/groups/available?guideId=${guide._id}&date=${date}`);
      if (res.success) {
        setAvailableGroups(res.data);
      }
    } catch (err) {
      console.error('Error fetching available groups:', err);
    } finally {
      setSearchingGroups(false);
    }
  };

  useEffect(() => {
    if (bookingData.date && guide?._id) {
      fetchAvailableGroups(bookingData.date);
    }
  }, [bookingData.date, guide?._id]);

  const [tours, setTours] = useState([]);
  const [toursLoading, setToursLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [ratingInput, setRatingInput] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    const fetchGuideData = async () => {
      try {
        setLoading(true);
        // Correcting URLs: baseURL already includes '/api'
        const [guideRes, toursRes, reviewsRes] = await Promise.all([
          api.get(`/guides/${guideId}`),
          api.get(`/tours?guideId=${guideId}`),
          api.get(`/reviews/guide/${guideId}`)
        ]);

        if (guideRes.success) {
          setGuide(guideRes.data);
        } else {
          setError(guideRes.error || 'Guide not found');
        }

        if (toursRes.success) {
          setTours(toursRes.data);
        }

        if (reviewsRes.success) {
          setReviews(reviewsRes.data);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch guide details');
      } finally {
        setLoading(false);
        setToursLoading(false);
        setReviewsLoading(false);
      }
    };
    fetchGuideData();
  }, [guideId]);

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '0.0';

  const handleTourSelect = (tour) => {
    setBookingData({
        ...bookingData,
        destinationName: tour.title,
        amount: tour.price
    });
    setShowBookingModal(true);
  };

  const handleBooking = async () => {
    if (!bookingData.date) {
      toast.error('Please select a date');
      return;
    }

    // Validate selected date is not in the past or today
    const selectedDate = new Date(bookingData.date);
    selectedDate.setUTCHours(0, 0, 0, 0);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    
    if (selectedDate <= today) {
      toast.error('Booking date must be in the future. Please select tomorrow or later.');
      return;
    }

    try {
      let createdGroupId = null;

      // 1. Handle Group Joining if applicable
      if (bookingData.type === 'split' && availableGroups.length > 0) {
        const groupToJoin = availableGroups[0]; // Logic: join the first available group
        const joinRes = await api.post(`/groups/${groupToJoin._id}/join`);
        if (joinRes.success) {
          createdGroupId = groupToJoin._id;
        }
      } 
      // 2. Handle Group Creation if splitting but no group exists
      else if (bookingData.type === 'split') {
        const groupRes = await api.post('/groups', {
          guideId: guide._id,
          date: bookingData.date,
          destination: bookingData.destinationName,
          estimatedCost: 2500 // Total cost to be shared
        });
        if (groupRes.success) {
          createdGroupId = groupRes.data._id;
        }
      }

      // 3. Create the booking request (The "Record")
      const res = await api.post('/bookings', {
        guideId: guide._id,
        guideName: guide.name,
        destinationName: bookingData.destinationName,
        date: bookingData.date,
        amount: bookingData.amount,
        type: bookingData.type,
        groupId: createdGroupId, // Link to the group!
        status: 'Pending'
      });

      if (res.success) {
        toast.success(`Booking request sent to ${guide.name}!`);
        setShowBookingModal(false);
        navigate('/bookings');
      } else if (res.error && res.error.includes('future')) {
        toast.error('Booking date must be in the future. Please select tomorrow or a later date.');
      } else {
        toast.error(res.error || res.message || 'Failed to initiate booking');
      }
    } catch (err) {
      console.error('Booking error:', err);
      toast.error('Something went wrong during booking');
    }
  };

  const handleInvite = async () => {
    if (invited || inviting) return;
    
    try {
      setInviting(true);
      console.log(`[INVITE_DEBUG] Sending invitation to guideId: ${guide._id}`);
      const res = await api.post('/chats/invite', { guideId: guide._id });
      if (res.success) {
        setInvited(true);
        toast.success(`Invite sent successfully!`, {
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
      setInviting(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewText.trim()) {
      toast.error('Please write a review before submitting');
      return;
    }

    try {
      setReviewSubmitting(true);
      const res = await api.post('/reviews', {
        guideId: guide._id,
        rating: ratingInput,
        comment: reviewText.trim()
      });

      if (res.success) {
        toast.success('Thank you! Your review was submitted.');
        setReviews(prev => [res.data, ...prev]);
        setReviewText('');
        setRatingInput(5);
      } else {
        toast.error(res.message || res.error || 'Failed to submit review');
      }
    } catch (err) {
      console.error('Review submission failed:', err);
      toast.error('Unable to submit review. Please try again.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">Loading Guide Profile...</p>
      </div>
    );
  }

  if (error || !guide) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-3xl mb-6 shadow-sm">
           <FaUser />
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-2">Guide Not Found</h2>
        <p className="text-slate-500 mb-8 max-w-xs">{error || "We couldn't find the guide you're looking for."}</p>
        <button 
          onClick={() => navigate(-1)}
          className="px-8 py-3 bg-white text-slate-800 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 border border-slate-100"
        >
          <FaArrowLeft /> Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto animate-in fade-in duration-500 -mt-4">
      {/* Back Button */}
      <div className="mb-2 mt-2">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-slate-400 hover:text-amber-500 transition-colors duration-300 group"
        >
          <FaArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: Profile Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full -mt-16 -mr-16 blur-2xl group-hover:bg-amber-100 transition-colors duration-700" />
             
             <div className="relative text-center">
                <div className="w-32 h-32 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-xl mx-auto p-1 mb-6 shadow-xl transform group-hover:rotate-3 transition-transform">
                   <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center overflow-hidden">
                      <FaUser className="text-slate-200 text-6xl" />
                   </div>
                </div>
                
                 <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2 flex items-center justify-center gap-2">
                    {guide.name}
                    <FaCheckCircle className="text-emerald-500 text-xl" title="Verified Guide" />
                 </h2>
                <div className="flex items-center justify-center gap-2 text-amber-500 mb-6">
                   <FaStar />
                   <span className="font-black text-sm uppercase">4.9 • Top Rated Guide</span>
                </div>

                <div className="space-y-4 pt-6 border-t border-slate-50">
                  <a 
                    href={`mailto:${guide.email}`}
                    className="flex items-center gap-4 text-amber-600 text-sm font-black hover:scale-[1.02] transition-all group/link"
                  >
                     <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 group-hover/link:bg-amber-100 transition-colors shadow-sm">
                        <FaEnvelope />
                     </div>
                     <span className="truncate">{guide.email}</span>
                  </a>
                  <a 
                    href={`tel:${guide.phoneNumber || '+977 9841234567'}`}
                    className="flex items-center gap-4 text-[#0b1f3a] text-sm font-black hover:scale-[1.02] transition-all group/link"
                  >
                     <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover/link:bg-emerald-100 transition-colors shadow-sm">
                        <FaPhone />
                     </div>
                     {guide.phoneNumber || '+977 9841234567'}
                  </a>
                </div>
             </div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => setShowBookingModal(true)}
              className="flex-1 py-3.5 bg-[#0b1f3a] text-white rounded-lg font-black text-xs uppercase tracking-widest shadow-xl shadow-[#0b1f3a]/10 hover:bg-gradient-to-r hover:from-amber-500 hover:to-orange-600 hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center gap-2 group"
            >
              Book Now <FaArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </button>

            {user.role === 'traveler' && (
              <button 
                onClick={handleInvite}
                disabled={invited || inviting}
                className={`px-4 py-3.5 border-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 group ${
                  invited 
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                    : 'bg-white border-slate-100 text-[#0b1f3a] hover:border-amber-200 hover:bg-amber-50/30'
                }`}
                title="Invite to Chat"
              >
                {inviting ? (
                  <FaSpinner className="animate-spin text-amber-500" />
                ) : invited ? (
                   <FaCheckCircle className="text-emerald-500" />
                ) : (
                  <FaCommentDots className="text-amber-500 group-hover:scale-110 transition-transform" />
                )}
                {invited ? 'Invited' : 'Invite'}
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Details */}
         <div className="lg:col-span-2 space-y-6">
            <div className="space-y-4">
               {/* Bio Row */}
               <div className="flex gap-4 items-start pb-4 border-b border-slate-50">
                  <div className="w-24 shrink-0 text-[10px] font-black text-slate-400 uppercase tracking-widest pt-1">Overview</div>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">
                     {guide.bio || `Seasoned expert specializing in local Himalayan expeditions and cultural exchanges.`}
                  </p>
               </div>

               {/* Stats Row */}
               <div className="flex gap-4 items-center pb-4 border-b border-slate-50">
                  <div className="w-24 shrink-0 text-[10px] font-black text-slate-400 uppercase tracking-widest">Experience</div>
                  <div className="flex gap-8">
                     <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-[#0b1f3a]">{guide.experience || '5+ Years'}</span> 
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Field XP</span>
                     </div>
                     <div className="flex items-center gap-2"><span className="text-sm font-black text-[#0b1f3a]">TAAN</span> <span className="text-[10px] text-slate-400 font-bold uppercase">Certified</span></div>
                  </div>
               </div>

               {/* Specialties Row */}
               <div className="flex gap-4 items-start pb-4 border-b border-slate-50">
                  <div className="w-24 shrink-0 text-[10px] font-black text-slate-400 uppercase tracking-widest pt-1">Specialties</div>
                  <div className="flex flex-wrap gap-2">
                     {guide.specialty ? guide.specialty.map((s, idx) => (
                        <span key={idx} className="px-2 py-1 bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-tighter rounded-md border border-amber-100">
                           {s}
                        </span>
                     )) : <span className="text-sm font-bold text-slate-800">General Trekking</span>}
                  </div>
               </div>

               {/* Languages Row */}
               <div className="flex gap-4 items-start pb-6 border-b border-slate-50">
                  <div className="w-24 shrink-0 text-[10px] font-black text-slate-400 uppercase tracking-widest pt-1">Languages</div>
                  <div className="flex flex-wrap gap-4 mt-0.5">
                     {guide.languages ? guide.languages.map((l, idx) => (
                        <span key={idx} className="text-xs font-bold text-slate-800 flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {l}
                        </span>
                     )) : <span className="text-sm font-bold text-slate-800">Nepali, English</span>}
                  </div>
               </div>

               {/* Ratings & Reviews */}
               <div className="pt-4 border-t border-slate-200">
                  <div className="flex flex-col gap-4">
                     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                           <h3 className="text-sm font-black text-slate-900">Ratings & Reviews</h3>
                           <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 mt-1">Verified traveler feedback</p>
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 text-amber-700 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest border border-amber-100">
                           <FaShieldAlt className="w-3.5 h-3.5" /> Verified
                        </div>
                     </div>

                     <div className="flex flex-wrap items-center gap-3">
                        <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm font-black text-slate-900">
                           {avgRating}/5
                        </div>
                        <div className="flex items-center gap-1 text-amber-400">
                           {[...Array(5)].map((_, i) => (
                              <FaStar key={i} className={i < Math.round(avgRating) ? 'text-amber-400' : 'text-slate-200'} />
                           ))}
                        </div>
                        <span className="text-[10px] text-slate-500 uppercase tracking-[0.25em]">{reviews.length} reviews</span>
                     </div>

                     <div className="grid gap-3">
                        {(reviews.length > 0 ? reviews.slice(0, 2) : [
                           { _id: 'sample-1', comment: 'Manisha was an amazing guide for our Everest trek!', user: { name: 'Sujan' } },
                           { _id: 'sample-2', comment: 'Excellent local knowledge and very supportive throughout the journey.', user: { name: 'Asha' } }
                        ]).map((review) => (
                           <div key={review._id} className="rounded-[24px] border border-slate-100 bg-slate-50 p-4">
                              <p className="text-sm font-semibold text-slate-900 leading-relaxed">"{review.comment}"</p>
                              <p className="mt-2 text-[10px] text-slate-500 uppercase tracking-[0.3em]">— {review.user?.name || 'Traveler'}</p>
                           </div>
                        ))}
                     </div>

                     <div className="mt-6 rounded-[24px] border border-slate-100 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between gap-4 mb-4">
                           <div>
                              <h4 className="text-sm font-black text-slate-900">Leave a review</h4>
                              <p className="text-[10px] text-slate-400 uppercase tracking-[0.3em] mt-1">Share your experience with this guide</p>
                           </div>
                           <div className="flex items-center gap-1 text-amber-400">
                              {[...Array(5)].map((_, index) => (
                                 <button
                                    key={index}
                                    type="button"
                                    onClick={() => setRatingInput(index + 1)}
                                    className={
                                       `text-lg transition-colors ${index < ratingInput ? 'text-amber-400' : 'text-slate-200'}`
                                    }
                                 >
                                    <FaStar />
                                 </button>
                              ))}
                           </div>
                        </div>
                        <textarea
                           value={reviewText}
                           onChange={(e) => setReviewText(e.target.value)}
                           rows={4}
                           className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-100 transition-all"
                           placeholder="Tell other travelers what made this guide stand out..."
                        />
                        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                           <p className="text-[10px] text-slate-400">Rated: <span className="font-black text-slate-800">{ratingInput}.0</span> / 5</p>
                           <button
                              onClick={handleSubmitReview}
                              disabled={reviewSubmitting}
                              className="inline-flex items-center justify-center rounded-xl bg-[#0b1f3a] px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-[#0b1f3a]/20 hover:bg-[#0a1a2e] transition-all disabled:cursor-not-allowed disabled:opacity-60"
                           >
                              {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                           </button>
                        </div>
                     </div>
                  </div>
               </div>

               {/* OFFICIAL EXPERIENCES */}
               <div className="pt-4 animate-in slide-in-from-bottom duration-700">
                  <div className="flex items-center justify-between mb-6">
                     <h3 className="text-xs font-black text-[#0b1f3a] uppercase tracking-widest flex items-center gap-2">
                        <FaMountain className="text-amber-500" /> Official Experiences
                     </h3>
                     <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{tours.length} Verified Offers</span>
                  </div>

                  {tours.length > 0 ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {tours.map((tour) => (
                          <div 
                            key={tour._id} 
                            onClick={() => handleTourSelect(tour)}
                            className="bg-white rounded-3xl border border-slate-100 p-4 shadow-sm hover:shadow-xl hover:shadow-[#0b1f3a]/5 hover:border-blue-100 transition-all cursor-pointer group"
                          >
                             <div className="flex gap-4">
                                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
                                   {tour.photos && tour.photos.length > 0 ? (
                                      <img src={buildBackendUrl(tour.photos[0])} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={tour.title} />
                                   ) : <FaMountain className="text-slate-200 text-3xl mx-auto mt-6" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                   <div className="flex items-start justify-between">
                                      <h4 className="text-sm font-black text-[#0b1f3a] uppercase tracking-tighter truncate">{tour.title}</h4>
                                   </div>
                                   <div className="flex items-center gap-2 mt-1">
                                      <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg uppercase tracking-widest">{tour.currency} {tour.price}</span>
                                      <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400">
                                         <FaMountain className="text-[8px]" /> {tour.duration}
                                      </div>
                                   </div>
                                   <button className="mt-3 text-[9px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                      Select Experience <FaArrowRight className="text-[8px]" />
                                   </button>
                                </div>
                             </div>
                          </div>
                        ))}
                     </div>
                  ) : (
                     <div className="p-8 border-2 border-dashed border-slate-50 rounded-3xl text-center">
                        <FaMountain className="text-3xl text-slate-100 mx-auto mb-2" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase">This guide hasn't listed specific experiences yet</p>
                     </div>
                  )}
               </div>

            </div>
         </div>
      </div>
    </div>

  {showBookingModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-[#0b1f3a]/40 backdrop-blur-[8px]"
            onClick={() => setShowBookingModal(false)}
          />
          <div className="relative bg-white/90 backdrop-blur-xl rounded-[16px] w-full max-w-[450px] shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="px-7 pt-5 pb-2 text-center">
              <h3 className="text-2xl font-black text-[#0b1f3a] tracking-tight">Booking Details</h3>
            </div>

            <div className="px-7 pb-5 space-y-3">
              {/* Date Picker Row (Compact) */}
              <div className="bg-slate-50/50 p-3 rounded-[16px] border border-slate-100/50 flex items-center gap-3">
                <div className="p-3 bg-white rounded-2xl shadow-sm">
                  <FaCalendarAlt className="text-amber-500 text-sm" />
                </div>
                <div className="flex-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Select Date</p>
                  <input 
                    type="date" 
                    min={getMinDate()}
                    className="w-full bg-transparent border-none p-0 font-black text-slate-800 focus:outline-none text-sm cursor-pointer"
                    value={bookingData.date}
                    onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                  />
                </div>
              </div>

              {/* Two Booking Paths: Selection Cards */}
              <div className="grid grid-cols-1 gap-2">
                {/* Private Tour Option */}
                <button 
                  onClick={() => setBookingData({ ...bookingData, amount: 2500, type: 'private' })}
                  className={`flex items-center gap-3 p-3 rounded-[16px] border transition-all text-left group ${
                    bookingData.amount === 2500 
                      ? 'border-amber-500 bg-amber-50/50 shadow-lg shadow-amber-500/5' 
                      : 'border-slate-100 hover:border-slate-200 bg-white'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl transition-colors ${
                    bookingData.amount === 2500 ? 'bg-amber-500 text-white' : 'bg-slate-50 text-slate-300'
                  }`}>
                    <FaUser />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="text-sm font-black text-[#0b1f3a] uppercase tracking-tight">Private Tour</span>
                      <span className="text-sm font-black text-amber-600">NPR 2500</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium leading-tight">Book the guide exclusively for yourself.</p>
                  </div>
                </button>

                {/* Split & Save Option */}
                <button 
                  onClick={() => setBookingData({ ...bookingData, amount: 1250, type: 'split' })}
                  className={`flex items-center gap-3 p-3 rounded-[16px] border transition-all text-left group ${
                    bookingData.amount === 1250 
                      ? 'border-amber-500 bg-amber-50/50 shadow-lg shadow-amber-500/5' 
                      : 'border-slate-100 hover:border-slate-200 bg-white'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl transition-colors ${
                    bookingData.amount === 1250 ? 'bg-amber-500 text-white' : 'bg-slate-50 text-slate-300'
                  }`}>
                    <FaUsers />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="text-sm font-black text-[#0b1f3a] uppercase tracking-tight">Split & Save</span>
                      <span className="text-sm font-black text-amber-600">NPR 1250</span>
                    </div>
                    {searchingGroups ? (
                      <p className="text-[9px] text-amber-500 font-bold animate-pulse">Searching for partners...</p>
                    ) : availableGroups.length > 0 ? (
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                           {availableGroups[0].members.slice(0, 3).map((m, i) => (
                             <div key={i} className="w-5 h-5 rounded-full border border-white bg-slate-200 flex items-center justify-center overflow-hidden">
                                {m.user.profileImage ? <img src={m.user.profileImage} className="w-full h-full object-cover" /> : <FaUser className="text-[8px] text-slate-400"/>}
                             </div>
                           ))}
                        </div>
                        <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-tight">
                          Join {availableGroups[0].members[0].user.name.split(' ')[0]}'s Group
                        </p>
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400 font-medium leading-tight">No partners found. Create a new slot for matching!</p>
                    )}
                  </div>
                </button>
              </div>

              {/* Conditional Note for Split */}
              <div className="mx-auto max-w-[92%] bg-amber-50/50 border border-amber-200 p-3 rounded-[16px] mt-1">
                  <p className="text-[9px] font-medium text-amber-700 leading-snug text-center italic">
                    Request confirmed! You don't pay anything until <strong>{guide.name}</strong> accepts your booking.
                  </p>
              </div>

              {/* Confirm Button */}
              <div className="pt-1">
                <button 
                  onClick={handleBooking}
                  className="w-full py-4 bg-[#0b1f3a] text-white rounded-[16px] font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-[#0b1f3a]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 group"
                >
                  Book Now <FaArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => setShowBookingModal(false)}
                  className="w-full mt-1 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GuideProfilePage;
