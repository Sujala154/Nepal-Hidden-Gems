const express = require('express');
const router = express.Router();
const User = require('../models/User');

// @desc    Get all public guides
// @route   GET /api/guides
// @access  Public
router.get('/', async (req, res) => {
  try {
    const guides = await User.find({ role: 'guide' }).select('-password -email');
    res.json({ success: true, data: guides });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @desc    Get single guide
// @route   GET /api/guides/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const guide = await User.findOne({ _id: req.params.id, role: 'guide' }).select('-password');
    if (!guide) {
      return res.status(404).json({ success: false, error: 'Guide not found' });
    }
    res.json({ success: true, data: guide });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
