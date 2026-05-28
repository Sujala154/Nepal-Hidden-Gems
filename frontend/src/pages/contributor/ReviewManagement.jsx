import React, { useState, useEffect } from 'react';
import { FaStar, FaReply, FaMapMarkerAlt, FaQuoteLeft, FaTimes, FaCheck, FaSpinner } from 'react-icons/fa';
import { buildBackendUrl } from '../../utils/backendUrls';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ReviewManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeReview, setActiveReview] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reviews/owned/total');
      if (res.success) {
        setReviews(res.data || []);
      }
    } catch (err) {
      console.error('Fetch reviews error:', err);
      toast.error('Failed to load guest reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleReplyClick = (review) => {
    setActiveReview(review);
    setReplyText(review.reply || '');
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await api.put(`/reviews/${activeReview._id}/reply`, { reply: replyText });
      if (res.success) {
        setReviews(prev => prev.map(r => r._id === activeReview._id ? { ...r, reply: replyText, repliedAt: new Date() } : r));
        setActiveReview(null);
        toast.success('Your reply has been published!');
      }
    } catch (err) {
      console.error('Reply error:', err);
      toast.error('Failed to save your reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <FaSpinner className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-black text-[#0b1f3a] uppercase tracking-tighter leading-none">Respond to feedback from travelers who visited your gems</h2>
        <FaCommentDots className="text-amber-500 w-5 h-5 animate-pulse flex-shrink-0" />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {reviews.length > 0 ? (
          reviews.map((rev) => (
            <div
              key={rev._id}
              className="bg-white border border-slate-200 rounded-xl p-6 hover:border-amber-200 transition-all shadow-sm group relative overflow-hidden"
            >
              {/* Vertical line indicator */}
              <div className={`absolute top-0 left-0 w-1.5 h-full ${rev.reply ? 'bg-emerald-500' : 'bg-amber-500'}`} />

              <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Destination Preview */}
                <div className="w-full md:w-40 shrink-0">
                   <div className="relative h-28 rounded-lg overflow-hidden border border-slate-100 shadow-sm">
                      <img 
                        src={buildBackendUrl(rev.destination?.image)} 
                        alt={rev.destination?.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-3 text-center">
                         <span className="text-white text-[10px] font-black uppercase tracking-widest leading-tight">{rev.destination?.name}</span>
                      </div>
                   </div>
                   <div className="mt-3 flex items-center gap-1.5 text-slate-400">
                      <FaMapMarkerAlt className="w-2.5 h-2.5" />
                      <span className="text-[9px] font-bold uppercase tracking-widest truncate">{rev.destination?.location}</span>
                   </div>
                </div>

                {/* Review Content */}
                <div className="flex-1 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 ring-2 ring-white shadow-sm overflow-hidden">
                         {rev.user?.profileImage ? (
                           <img src={rev.user.profileImage} className="w-full h-full object-cover" alt={rev.user.name} />
                         ) : rev.user?.name?.[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-slate-700 uppercase tracking-widest">{rev.user?.name}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase">{new Date(rev.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
                       <FaStar className="text-amber-500 text-[10px]" />
                       <span className="text-xs font-black text-amber-600 tracking-tighter">{rev.rating}.0</span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <FaQuoteLeft className="text-slate-100 text-3xl shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-slate-700 leading-relaxed italic pr-4">
                        {rev.comment}
                      </p>
                      
                      {rev.reply && (
                        <div className="mt-4 p-4 bg-emerald-50/50 border border-emerald-100 rounded-lg relative">
                           <div className="flex items-center gap-2 mb-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm" />
                             <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Your Official Reply</span>
                           </div>
                           <p className="text-xs text-emerald-800 font-medium leading-relaxed italic">
                             "{rev.reply}"
                           </p>
                           <p className="text-[8px] text-emerald-400 font-bold uppercase mt-2 tracking-widest">Replied on {new Date(rev.repliedAt).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleReplyClick(rev)}
                  className={`px-6 py-3 rounded-lg font-black uppercase tracking-widest text-[9px] shadow-lg transition-all shrink-0 active:scale-95 flex items-center gap-2
                    ${rev.reply 
                      ? 'bg-slate-50 text-slate-400 hover:bg-slate-200 shadow-none' 
                      : 'bg-[#0b1f3a] text-white hover:bg-emerald-600 shadow-blue-900/10 hover:shadow-emerald-500/20'}`}
                >
                  <FaReply className="w-3 h-3" />
                  {rev.reply ? 'Edit Response' : 'Reply Now'}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-24 bg-white border border-dashed border-slate-200 rounded-xl">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-5">
               <FaStar className="text-slate-200 w-8 h-8" />
            </div>
            <p className="text-slate-400 font-black uppercase text-xs tracking-widest">You haven't received any reviews yet. Keep exploring!</p>
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {activeReview && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm shadow-2xl" onClick={() => setActiveReview(null)} />
          <div className="relative bg-white rounded-xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-sm font-black text-[#0b1f3a] uppercase tracking-widest mb-1">Reply to {activeReview.user?.name}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase italic tracking-wider">Your official response will be public on {activeReview.destination?.name}</p>
                </div>
                <button onClick={() => setActiveReview(null)} className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"><FaTimes /></button>
              </div>

              <div className="bg-slate-50 p-6 rounded-lg border border-slate-100 mb-6 relative">
                <div className="flex items-center gap-2 mb-3">
                   {[...Array(activeReview.rating)].map((_, i) => (
                     <FaStar key={i} className="text-amber-400 text-[10px]" />
                   ))}
                </div>
                <p className="text-xs text-slate-600 font-medium italic leading-relaxed">"{activeReview.comment}"</p>
              </div>

              <form onSubmit={handleSubmitReply} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Your Professional Response</label>
                  <textarea
                    rows="6"
                    required
                    placeholder="Thank the traveler or address their feedback professionally..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-5 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500 transition-all placeholder:text-slate-300"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setActiveReview(null)}
                    className="flex-1 py-4 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-4 px-10 bg-emerald-500 text-white rounded-lg font-black uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95"
                  >
                    {isSubmitting ? 'Publishing...' : <><FaCheck className="w-3 h-3" /> Publish Reply</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewManagement;
