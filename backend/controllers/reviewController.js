const Review = require('../models/Review');
const Destination = require('../models/Destination');

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
    await destination.save();

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
