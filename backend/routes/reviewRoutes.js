const express = require('express');
const router = express.Router();
const { createReview, getReviews } = require('../controllers/reviewController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, createReview);
router.get('/:destinationId', getReviews);

module.exports = router;
