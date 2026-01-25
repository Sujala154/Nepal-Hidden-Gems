const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getProfile, updateProfile } = require('../controllers/profileController');

// @route   GET api/profiles/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', authMiddleware, getProfile);

// @route   PATCH api/profiles/update
// @desc    Update user profile
// @access  Private
router.patch('/update', authMiddleware, updateProfile);

module.exports = router;
