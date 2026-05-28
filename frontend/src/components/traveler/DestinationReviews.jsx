import React, { useState, useEffect } from 'react';
import { FaStar, FaRegStar, FaUserCircle, FaReply } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { reviewService } from '../../services/reviewService';
import Rating from '../common/Rating';
import Loader from '../common/Loader';

const DestinationReviews = ({ destinationId }) => {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [submissionError, setSubmissionError] = useState(null);
  
  // Form state
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fallback mock reviews for demonstration/testing
  const mockReviews = [
    {
      _id: 'mock1',
      rating: 5,
      comment: 'Amazing experience in Bandipur! The local hospitality is unbeatable.',
      createdAt: new Date().toISOString(),
      user: { name: 'Sujala', avatar: null }
    },
    {
      _id: 'mock2',
      rating: 4,
      comment: 'Highly recommend visiting during the off-season for a peaceful getaway.',
      createdAt: new Date().toISOString(),
      user: { name: 'Aayush', avatar: null }
    }
  ];

  useEffect(() => {
    fetchReviews();
  }, [destinationId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      const data = await reviewService.getReviewsByDestination(destinationId);
      
      // If data is empty, use mock reviews as fallback
      if (!data || data.length === 0) {
        setReviews(mockReviews);
      } else {
        setReviews(data);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      // Even on error, show mock data for testing as requested
      setReviews(mockReviews);
      setFetchError('Using fallback data - could not reach the server.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentUser = sessionStorage.getItem('user');
    if (!isAuthenticated && !currentUser) {
      openAuthModal('login');
      return;
    }

    if (rating === 0) {
      setSubmissionError('Please select a star rating.');
      return;
    }

    try {
      setSubmitting(true);
      setSubmissionError(null);
      await reviewService.createReview({
        destinationId,
        rating,
        comment
      });
      
      setSuccessMsg('Thank you for your review!');
      setRating(0);
      setComment('');
      fetchReviews(); // Refresh list if possible
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setSubmissionError(err.response?.data?.message || err.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };



  return (
    <div className="mt-12 border-t pt-8">
      <h2 className="text-2xl font-bold mb-6">Reviews & Ratings</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left: Review List */}
        <div>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader />
            </div>
          ) : fetchError ? (
            <div className="mb-6 p-4 bg-orange-50 border border-orange-200 text-orange-700 rounded-xl text-sm flex items-center gap-3">
              <span>⚠️</span> {fetchError}
            </div>
          ) : reviews.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500">
              No reviews yet. Be the first to share your experience!
            </div>
          ) : (
            <div className="space-y-6 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
              {reviews.map((review) => (
                <div key={review._id} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {review.user?.avatar ? (
                        <img 
                          src={review.user.avatar} 
                          alt={review.user.name} 
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <FaUserCircle className="w-10 h-10 text-gray-300" />
                      )}
                      <div>
                        <p className="font-semibold text-gray-800">{review.user?.name || 'Anonymous'}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <Rating rating={review.rating} />
                  </div>
                  <p className="text-gray-600 leading-relaxed italic">"{review.comment}"</p>

                  {/* CONTRIBUTOR REPLY */}
                  {review.reply && (
                    <div className="mt-5 ml-4 p-5 bg-slate-50 border-l-4 border-amber-500 rounded-r-2xl relative overflow-hidden group/reply transition-all hover:bg-white hover:shadow-lg">
                      <div className="absolute top-2 right-4 opacity-5 pointer-events-none group-hover/reply:rotate-12 transition-transform duration-500"><FaReply className="text-4xl" /></div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600 shadow-sm"><FaReply className="w-3 h-3" /></div>
                        <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Official Response from Expert</p>
                      </div>
                      <p className="text-sm font-bold text-[#0b1f3a] leading-relaxed pr-6">"{review.reply}"</p>
                      {review.repliedAt && (
                        <p className="text-[9px] text-slate-400 font-bold uppercase mt-3 tracking-widest pl-1 italic">
                          Replied on {new Date(review.repliedAt).toLocaleDateString('en-US', {
                             month: 'long',
                             day: 'numeric',
                             year: 'numeric'
                          })}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Add Review Form */}
        <div>
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
            <h3 className="text-lg font-bold mb-4 text-slate-800">Leave a Review</h3>
            
            {successMsg && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
                {successMsg}
              </div>
            )}
            
            {submissionError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                {submissionError}
              </div>
            )}

            {(!isAuthenticated && !sessionStorage.getItem('user')) ? (
              <div className="text-center py-6">
                <p className="text-gray-500 mb-4">Please log in to share your experience.</p>
                <button
                  onClick={() => openAuthModal('login')}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-6 rounded-full transition-colors uppercase text-sm tracking-widest shadow-lg shadow-amber-500/20"
                >
                  Log In Now
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[...Array(5)].map((_, i) => {
                      const starValue = i + 1;
                      return (
                        <button
                          key={i}
                          type="button"
                          className="focus:outline-none transform hover:scale-110 transition-transform"
                          onClick={() => setRating(starValue)}
                          onMouseEnter={() => setHover(starValue)}
                          onMouseLeave={() => setHover(0)}
                        >
                          {starValue <= (hover || rating) ? (
                            <FaStar className="w-8 h-8 text-yellow-400" />
                          ) : (
                            <FaRegStar className="w-8 h-8 text-gray-300" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Comment</label>
                  <textarea
                    rows="4"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell us about your experience..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all placeholder:text-gray-300"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full py-3 rounded-full font-black uppercase text-xs tracking-widest transition-all ${
                    submitting 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-[#1a365d] hover:bg-[#0b1f3a] text-white shadow-xl shadow-blue-900/20 active:scale-95'
                  }`}
                >
                  {submitting ? 'Submitting...' : 'Post Review'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DestinationReviews;
