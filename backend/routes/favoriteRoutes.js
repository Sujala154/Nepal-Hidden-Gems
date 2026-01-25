const express = require('express');
const router = express.Router();
const { toggleFavorite, getFavorites } = require('../controllers/favoriteController');
const auth = require('../middleware/authMiddleware');

// All favorite routes require authentication
router.use(auth);

router.get('/', getFavorites);
router.post('/toggle/:destinationId', toggleFavorite);

module.exports = router;
