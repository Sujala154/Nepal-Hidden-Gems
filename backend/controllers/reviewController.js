const Review = require('../models/Review');
const Destination = require('../models/Destination');

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
  try {
    const { destinationId, rating, comment } = req.body;

    // Validate inputs
    if (!destinationId || !rating || !comment) {
      return res.status(400).json({ message: 'Please provide destination, rating, and comment.' });
    }

    // Check if destination exists
    const destination = await Destination.findById(destinationId);
    if (!destination) {
      return res.status(404).json({ message: 'Destination not found.' });
    }

    // Create the review
    const review = await Review.create({
      destination: destinationId,
      user: req.user.id,
      rating: Number(rating),
      comment
    });

    res.status(201).json({
      message: 'Review added successfully!',
      review
    });
  } catch (error) {
    // 11000 is MongoDB's unique constraint violation error code
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already reviewed this destination.' });
    }
    console.error('Create Review Error:', error);
    res.status(500).json({ message: 'Server error while creating review.' });
  }
};

// @desc    Get all reviews for a destination
// @route   GET /api/reviews/:destinationId
// @access  Public
const getReviews = async (req, res) => {
  try {
    const { destinationId } = req.params;

    const reviews = await Review.find({ destination: destinationId })
      .populate('user', 'name avatar') // populate the user fields
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    console.error('Get Reviews Error:', error);
    res.status(500).json({ message: 'Server error while fetching reviews.' });
  }
};

module.exports = {
  createReview,
  getReviews
};
