const Review = require('../models/Review');
const Destination = require('../models/Destination');
const { createNotification } = require('../utils/notificationHelper');

exports.createReview = async (req, res) => {
  try {
    const { destinationId, rating, comment } = req.body;
    
    // Check if destination exists
    const destination = await Destination.findById(destinationId);
    if (!destination) {
      return res.status(404).json({ message: 'Destination not found' });
    }

    // Check if user is authenticated and is logged in as a traveler
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const review = await Review.create({
      destination: destinationId,
      user: req.user.id,
      rating: Number(rating),
      comment
    });

    // Populate user info for immediate display
    const populatedReview = await Review.findById(review._id).populate('user', 'name avatar');

    // Update destination rating
    const allReviews = await Review.find({ destination: destinationId });
    const avgRating = allReviews.reduce((sum, item) => sum + item.rating, 0) / allReviews.length;
    
    destination.rating = parseFloat(avgRating.toFixed(1));
    destination.numReviews = (destination.numReviews || 0) + 1; // Increment review count
    await destination.save();

    // Notify the contributor/owner of the destination
    await createNotification({
      recipientId: destination.createdBy,
      senderId: req.user.id,
      type: 'other',
      title: 'New Review!',
      message: `${req.user?.name || 'A traveler'} just rated your gem "${destination.name}" ${rating} stars.`,
      relatedId: review._id
    });

    res.status(201).json(populatedReview);
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getReviewsByDestination = async (req, res) => {
  try {
    const { destinationId } = req.params;
    const reviews = await Review.find({ destination: destinationId })
      .populate('user', 'name avatar')
      .sort('-createdAt');
    
    res.json(reviews || []);
  } catch (error) {
    console.error('Fetch reviews error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getContributorReviews = async (req, res) => {
  try {
    // 1. Find all destinations owned by this contributor
    const destinations = await Destination.find({ createdBy: req.user.id }).select('_id');
    const destIds = destinations.map(d => d._id);

    // 2. Find all reviews for those destinations
    const reviews = await Review.find({ destination: { $in: destIds } })
      .populate('destination', 'name location image')
      .populate('user', 'name avatar profileImage')
      .sort('-createdAt');
    
    res.json({ success: true, data: reviews || [] });
  } catch (error) {
    console.error('Contributor reviews error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.replyToReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;

    const review = await Review.findById(id).populate('destination');
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    // Verify ownership of the destination
    if (review.destination.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to reply' });
    }

    review.reply = reply;
    review.repliedAt = Date.now();
    await review.save();

    res.json({ success: true, data: review });
  } catch (error) {
    console.error('Reply review error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
