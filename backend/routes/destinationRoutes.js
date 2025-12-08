// const express = require('express');
// const router = express.Router();
// const {
//   getDestinations,
//   getDestination,
//   createDestination,
//   updateDestination,
//   deleteDestination,
//   searchDestinations,
//   filterDestinations,
//   saveDestination,
//   unsaveDestination,
//   getUserDestinations,
//   getPendingDestinations,
//   approveDestination,
//   rejectDestination,
//   getPopularDestinations,
//   getNearbyDestinations,
//   getByCategory,
//   uploadImages
// } = require('../controllers/destinationController');
// const { protect, authorize } = require('../middleware/authMiddleware');
// const { upload } = require('../middleware/uploadMiddleware');

// // Public routes
// router.get('/', getDestinations);
// router.get('/search', searchDestinations);
// router.get('/filter', filterDestinations);
// router.get('/popular', getPopularDestinations);
// router.get('/nearby', getNearbyDestinations);
// router.get('/category/:category', getByCategory);
// router.get('/:id', getDestination);

// // Protected routes - require authentication
// router.use(protect);

// // User-specific routes
// router.post('/:id/save', authorize('traveler'), saveDestination);
// router.delete('/:id/unsave', authorize('traveler'), unsaveDestination);
// router.get('/user/my-destinations', authorize('contributor', 'admin'), getUserDestinations);

// // Contributor & Admin routes for destination management
// router.post('/', authorize('contributor', 'admin'), createDestination);
// router.put('/:id', authorize('contributor', 'admin'), updateDestination);
// router.delete('/:id', authorize('contributor', 'admin'), deleteDestination);

// // Image upload route
// router.post('/upload/images', authorize('contributor', 'admin'), upload.array('images', 10), uploadImages);

// // Admin-only routes
// router.get('/admin/pending', authorize('admin'), getPendingDestinations);
// router.put('/admin/approve/:id', authorize('admin'), approveDestination);
// router.put('/admin/reject/:id', authorize('admin'), rejectDestination);

// module.exports = router;