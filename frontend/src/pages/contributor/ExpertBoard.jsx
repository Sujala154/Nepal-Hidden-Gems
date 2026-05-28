import React, { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaMapMarkerAlt, FaQuoteLeft, FaStar, FaReply, FaSpinner, FaComments } from 'react-icons/fa';
import api from '../../services/api';
import toast from 'react-hot-toast';

  const ExpertBoard = () => {
  // REVIEWS state (Fetched real reviews)
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  
  // MODAL states
  const [activeItem, setActiveItem] = useState(null); // { type: 'review', data: obj }
  const [inputText, setInputText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReviews = async () => {
    try {
      setLoadingReviews(true);
      const res = await api.get('/reviews/owned/total');
      if (res.success) {
        setReviews(res.data || []);
      }
    } catch (err) {
      console.error('Fetch reviews error:', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleActionClick = (item) => {
    setActiveItem({ type: 'review', data: item });
    setInputText(item.reply || '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    setIsSubmitting(true);

    try {
      const res = await api.put(`/reviews/${activeItem.data._id}/reply`, { reply: inputText });
      if (res.success) {
        setReviews(prev => prev.map(r => r._id === activeItem.data._id ? { ...r, reply: inputText, repliedAt: new Date() } : r));
        toast.success('Reply published!');
        setActiveItem(null);
      }
    } catch (err) {
      toast.error('Failed to save reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-500 w-full">
      {/* RECENT REVIEWS SECTION - FULL WIDTH */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-black text-[#0b1f3a] uppercase tracking-tighter leading-none">Guest Ratings</h2>
          <FaStar className="text-amber-500 w-4 h-4 animate-pulse" />
        </div>
        {loadingReviews ? (
          <div className="flex justify-center py-10"><FaSpinner className="animate-spin text-amber-500" /></div>
        ) : (
          <div className="space-y-2">
            {reviews.map((rev) => (
              <div key={rev._id} className={`bg-white border border-slate-200 rounded-xl p-3 hover:border-emerald-300 transition-all shadow-sm flex items-center gap-4 group relative overflow-hidden ${rev.reply ? 'opacity-90' : ''}`}>
                 <div className={`absolute left-0 top-0 w-1 h-full ${rev.reply ? 'bg-emerald-500' : 'bg-orange-400'}`} />
                 
                 {/* LEFT: Destination & Rating */}
                 <div className="w-28 shrink-0 border-r border-slate-100 pr-3">
                    <div className="flex items-center gap-1.5 mb-1">
                       <FaStar className="text-amber-500 text-xs" />
                       <span className="text-xs font-black text-[#0b1f3a] uppercase tracking-widest truncate">{rev.destination?.name}</span>
                    </div>
                    <div className="flex gap-0.5">
                       {[...Array(5)].map((_, i) => (
                         <FaStar key={i} className={`text-[10px] ${i < rev.rating ? 'text-amber-400' : 'text-slate-100'}`} />
                       ))}
                    </div>
                 </div>

                 {/* MIDDLE: The Comment */}
                 <div className="flex-1 flex gap-3 min-w-0">
                    <FaQuoteLeft className="text-slate-100 text-3xl shrink-0" />
                    <p className="text-base font-bold text-slate-700 leading-tight italic pr-4 line-clamp-2 group-hover:line-clamp-none transition-all">"{rev.comment}"</p>
                 </div>

                 {/* RIGHT: User & Action */}
                 <div className="flex items-center gap-4 shrink-0 pl-4 border-l border-slate-100">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-xs font-black text-emerald-600 uppercase overflow-hidden border border-emerald-100 shadow-sm relative">
                          {rev.user?.avatar ? <img src={rev.user.avatar} className="w-full h-full object-cover" /> : rev.user?.name?.[0]}
                          {rev.reply && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border border-white rounded-full flex items-center justify-center"><FaCheck className="text-white text-[6px]" /></div>}
                       </div>
                       <div className="flex flex-col">
                          <span className="text-xs font-black text-slate-500 uppercase tracking-widest leading-none mb-1">{rev.user?.name}</span>
                          <span className="text-[10px] text-slate-300 font-bold uppercase">{new Date(rev.createdAt).toLocaleDateString()}</span>
                       </div>
                    </div>
                    <button
                      onClick={() => handleActionClick(rev)}
                      className={`px-5 py-2 rounded-lg font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-2 shadow-sm
                        ${rev.reply 
                          ? 'bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-100' 
                          : 'bg-[#0b1f3a] text-white hover:bg-emerald-600 shadow-blue-900/10 active:scale-95'}`}
                    >
                      <FaReply className="w-3 h-3" />
                      {rev.reply ? 'Edit' : 'Reply'}
                    </button>
                 </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ACTION MODAL (UNIFIED) */}
      {activeItem && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0b1f3a]/40 backdrop-blur-sm" onClick={() => setActiveItem(null)} />
          <div className="relative bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 text-left">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-sm font-black text-[#0b1f3a] uppercase tracking-widest mb-1">
                    {activeItem.type === 'review' ? 'Review Response' : 'Expert Guidance'}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{activeItem.data.destination?.name || activeItem.data.destination}</p>
                </div>
                <button onClick={() => setActiveItem(null)} className="text-slate-300 hover:text-red-500 transition-colors"><FaTimes /></button>
              </div>

              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-6 relative overflow-hidden shadow-inner">
                 <FaQuoteLeft className="absolute top-2 right-2 text-slate-200/40 text-4xl" />
                 <p className="text-sm text-slate-600 font-bold italic leading-relaxed relative z-10">"{activeItem.type === 'review' ? activeItem.data.comment : activeItem.data.question}"</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                 <div>
                   <textarea
                     rows="5"
                     required
                     placeholder="Type your expertise here..."
                     className="w-full bg-slate-50 border border-slate-200 rounded-xl p-5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-[#0b1f3a]/10 focus:bg-white focus:border-[#0b1f3a] transition-all placeholder:text-slate-300"
                     value={inputText}
                     onChange={(e) => setInputText(e.target.value)}
                   />
                 </div>
                 <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-[#0b1f3a] text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-blue-900/20 hover:bg-emerald-600 transition-all flex items-center justify-center gap-3">
                   {isSubmitting ? 'Publishing...' : <><FaCheck className="w-4 h-4" /> Publish Response</>}
                 </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpertBoard;
