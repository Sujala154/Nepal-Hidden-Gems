const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const { 
  createTour, 
  getMyTours, 
  deleteTour,
  getTours
} = require('../controllers/tourController');

// Public routes
router.get('/', getTours);

// Protected routes (Require auth)
router.use(auth);

// Guide actions
router.post('/', roleMiddleware(['guide', 'admin']), upload.array('photos', 5), createTour);
router.get('/my', roleMiddleware(['guide']), getMyTours);
router.delete('/:id', roleMiddleware(['guide', 'admin']), deleteTour);

module.exports = router;
