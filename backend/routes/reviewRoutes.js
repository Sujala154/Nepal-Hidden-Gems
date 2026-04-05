const express = require('express');
const router = express.Router();
const { createReview, getReviewsByDestination } = require('../controllers/reviewController');
const auth = require('../middleware/authMiddleware');

// Get reviews for a specific destination - Public
router.get('/:destinationId', getReviewsByDestination);

// Add a review - Private (Requires Auth)
router.post('/', auth, createReview);

module.exports = router;
