import React, { useState, useEffect } from 'react';
import { FaStar, FaCalendarAlt, FaUserCircle, FaSpinner, FaCheckCircle } from 'react-icons/fa';
import api from '../../services/api';
import toast from 'react-hot-toast';

const GuideReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const res = await api.get('/reviews/guide/me');
            console.log('Fetched reviews:', res.data);
            if (res.success) {
                setReviews(res.data);
            }
        } catch (err) {
            console.error('Fetch reviews error:', err);
            toast.error('Failed to load reviews');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center">
                <FaSpinner className="text-4xl text-amber-500 animate-spin mb-4" />
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Gathering Traveler Feedback...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-4 w-full animate-in fade-in duration-700">
            <div className="flex items-center gap-2 mb-6">
                <h1 className="text-lg font-black text-[#0b1f3a] uppercase tracking-tighter leading-none">Guest Ratings</h1>
                <FaStar className="text-amber-500 text-lg" />
            </div>

            <div className="flex flex-col gap-3">
                {reviews.length > 0 ? reviews.map(review => (
                    <div key={review._id} className="bg-white rounded-xl border border-slate-100 relative overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${review.rating >= 4 ? 'bg-emerald-400' : 'bg-orange-400'}`} />
                        
                        <div className="flex items-center p-3 gap-4 pl-4 pr-6">
                            {/* Target Info */}
                            <div className="w-48 shrink-0 flex flex-col justify-center">
                                <div className="flex items-center gap-1.5 text-[10px] font-black text-[#0b1f3a] uppercase tracking-widest truncate">
                                    <FaStar className="text-amber-400 text-[10px] shrink-0" />
                                    <span className="truncate">{review.destination?.name || 'GUIDE EXPERIENCE'}</span>
                                </div>
                                <div className="flex text-amber-400 text-[8px] mt-1 ml-4">
                                    {[...Array(5)].map((_, i) => (
                                        <FaStar key={i} className={i < review.rating ? 'fill-current' : 'text-slate-200'} />
                                    ))}
                                </div>
                            </div>

                            {/* Comment */}
                            <div className="flex-1 flex items-start gap-3 border-l border-slate-100 pl-4">
                                <span className="text-slate-100 text-4xl leading-none font-serif shrink-0 mt-[-5px]">“</span>
                                <p className="text-sm text-slate-600 font-bold italic leading-snug line-clamp-2 mt-1">"{review.comment}"</p>
                            </div>

                            {/* Reviewer Info */}
                            <div className="shrink-0 flex items-center gap-3 w-48 border-l border-slate-100 pl-4">
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 font-black text-xs uppercase shrink-0">
                                    {review.user?.name ? review.user.name.charAt(0) : 'T'}
                                </div>
                                <div className="flex flex-col justify-center truncate">
                                    <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest truncate">{review.user?.name || 'TRAVELER'}</h4>
                                    <div className="text-[8px] font-bold text-slate-400 mt-0.5 flex items-center gap-1">
                                        <FaCheckCircle className="text-emerald-400 text-[8px]" /> {new Date(review.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/20">
                        <FaUserCircle className="text-3xl text-slate-200 mx-auto mb-3" />
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight mb-1">No reviews yet</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Feedback will appear here once travelers book your experiences</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GuideReviews;
