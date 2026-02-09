const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getFavorites, toggleFavorite } = require('../controllers/userController');

// Favorites endpoints
router.get('/favorites', protect, getFavorites);
router.post('/favorites/toggle/:id', protect, toggleFavorite);

module.exports = router;
