const express = require('express');
const router = express.Router();
const { 
  createReview, 
  getReviewsByDestination, 
  getReviewsByGuide,
  getGuideDashboardReviews,
  getContributorReviews, 
  replyToReview 
} = require('../controllers/reviewController');
const auth = require('../middleware/authMiddleware');

// Get reviews for a specific destination - Public
router.get('/:destinationId', getReviewsByDestination);

// Get reviews for a specific guide profile - Public
router.get('/guide/:guideId', getReviewsByGuide);

// Get all reviews for current guide's dashboard - Private
router.get('/guide/me', auth, getGuideDashboardReviews);

// Add a review - Private (Requires Auth)
router.post('/', auth, createReview);

// Get all reviews for contributor's destinations
router.get('/owned/total', auth, getContributorReviews);

// Reply to a specific review
router.put('/:id/reply', auth, replyToReview);

module.exports = router;
