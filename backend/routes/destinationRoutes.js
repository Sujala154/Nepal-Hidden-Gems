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

// Public routes
router.get('/', getDestinations);
router.get('/:slug', getDestinationBySlug);

// All routes below also require login
router.use(auth);
router.post('/', upload.single('image'), createDestination);
router.put('/:id', upload.single('image'), updateDestination);
router.delete('/:id', deleteDestination);

module.exports = router;
