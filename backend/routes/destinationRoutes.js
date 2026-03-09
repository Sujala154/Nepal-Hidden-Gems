const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const {
  getDestinations,
  getDestinationBySlug,
  createDestination,
  getMyDestinations,
  updateDestination,
  deleteDestination
} = require('../controllers/destinationController');

// Protected routes (require auth)
router.get('/my-content', auth, getMyDestinations);
router.get('/user/my-destinations', auth, getMyDestinations);

const optionalAuth = require('../middleware/optionalAuth');

// Public routes (with optional auth for creator access)
router.get('/', getDestinations);
router.get('/:slug', optionalAuth, getDestinationBySlug);

// All routes below also require login
router.use(auth);
router.post('/', upload.array('images', 5), createDestination);
router.put('/:id', upload.array('images', 5), updateDestination);
router.delete('/:id', deleteDestination);

module.exports = router;
