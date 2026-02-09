const express = require('express');
const router = express.Router();
const {
  getDestinations,
  getDestination,
  createDestination,
  updateDestination,
  deleteDestination,
  getUserDestinations
} = require('../controllers/destinationController');

const { protect, authorize } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

// Public routes
router.get('/', getDestinations);

// Protected routes
router.post('/', protect, authorize('contributor', 'admin'), upload.array('images', 5), createDestination);
router.put('/:id', protect, authorize('contributor', 'admin'), upload.array('images', 5), updateDestination);
router.delete('/:id', protect, deleteDestination);
router.get('/user/my-destinations', protect, getUserDestinations);

router.get('/:id', getDestination);

module.exports = router;