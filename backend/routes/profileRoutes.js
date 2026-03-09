const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { 
    getProfile, 
    updateProfile, 
    getNotifications, 
    markNotificationsRead 
} = require('../controllers/profileController');

// @route   GET api/profiles/me
router.get('/me', authMiddleware, getProfile);

// @route   PATCH api/profiles/update
router.patch('/update', authMiddleware, updateProfile);

// @route   GET api/profiles/notifications
router.get('/notifications', authMiddleware, getNotifications);

// @route   PUT api/profiles/notifications/read
router.put('/notifications/read', authMiddleware, markNotificationsRead);

module.exports = router;
