const Review = require('../models/Review');
const Destination = require('../models/Destination');
const User = require('../models/User');
const { createNotification } = require('../utils/notificationHelper');

exports.createReview = async (req, res) => {
  try {
    const { destinationId, guideId, rating, comment } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    let reviewData = {
      user: req.user.id,
      rating: Number(rating),
      comment
    };

    if (destinationId) {
      const destination = await Destination.findById(destinationId);
      if (!destination) return res.status(404).json({ message: 'Destination not found' });
      reviewData.destination = destinationId;
    } else if (guideId) {
      const guide = await User.findById(guideId);
      if (!guide) return res.status(404).json({ message: 'Guide not found' });
      reviewData.guide = guideId;
    } else {
      return res.status(400).json({ message: 'Review must target a destination or a guide' });
    }

    const review = await Review.create(reviewData);
    const populatedReview = await Review.findById(review._id).populate('user', 'name avatar profileImage');

    // Update Average Rating
    if (destinationId) {
      const allReviews = await Review.find({ destination: destinationId });
      const avgRating = allReviews.reduce((sum, item) => sum + item.rating, 0) / allReviews.length;
      await Destination.findByIdAndUpdate(destinationId, {
        rating: parseFloat(avgRating.toFixed(1)),
        $inc: { numReviews: 1 }
      });
    } else if (guideId) {
      const allReviews = await Review.find({ guide: guideId });
      const avgRating = allReviews.reduce((sum, item) => sum + item.rating, 0) / allReviews.length;
      await User.findByIdAndUpdate(guideId, {
        averageRating: parseFloat(avgRating.toFixed(1)),
        $inc: { numReviews: 1 }
      });
    }

    res.status(201).json({ success: true, data: populatedReview });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getReviewsByDestination = async (req, res) => {
  try {
    const { destinationId } = req.params;
    const reviews = await Review.find({ destination: destinationId })
      .populate('user', 'name avatar profileImage')
      .sort('-createdAt');
    res.json(reviews || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getReviewsByGuide = async (req, res) => {
  try {
    const { guideId } = req.params;
    const reviews = await Review.find({ guide: guideId })
      .populate('user', 'name avatar profileImage')
      .sort('-createdAt');
    res.json({ success: true, data: reviews || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getGuideDashboardReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ guide: req.user.id })
      .populate('user', 'name avatar profileImage')
      .sort('-createdAt');
    console.log('Guide dashboard reviews:', reviews);
    res.json({ success: true, data: reviews || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getContributorReviews = async (req, res) => {
  try {
    const destinations = await Destination.find({ createdBy: req.user.id }).select('_id');
    const destIds = destinations.map(d => d._id);
    const reviews = await Review.find({ destination: { $in: destIds } })
      .populate('destination', 'name location image')
      .populate('user', 'name avatar profileImage')
      .sort('-createdAt');
    res.json({ success: true, data: reviews || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.replyToReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;

    const review = await Review.findById(id).populate('destination');
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    // Verify ownership (either destination owner or the guide themselves)
    const isDestOwner = review.destination && review.destination.createdBy.toString() === req.user.id.toString();
    const isTheGuide = review.guide && review.guide.toString() === req.user.id.toString();

    if (!isDestOwner && !isTheGuide) {
      return res.status(403).json({ success: false, message: 'Unauthorized to reply' });
    }

    review.reply = reply;
    review.repliedAt = Date.now();
    await review.save();

    res.json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
