const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const Destination = require('../models/Destination');
const User = require('../models/User');

// @desc    Get admin statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {

    // Get user counts by role
    const totalUsers = await User.countDocuments();
    const travelers = await User.countDocuments({ role: 'traveler' });
    const contributors = await User.countDocuments({ role: 'contributor' });
    const guides = await User.countDocuments({ role: 'guide' });

    // Get destination stats
    const allDestinations = await Destination.find();
    const totalDestinations = allDestinations.length;
    const approvedDestinations = allDestinations.filter(d => d.status === 'approved').length;
    const pendingDestinations = allDestinations.filter(d => d.status === 'pending').length;
    const rejectedDestinations = allDestinations.filter(d => d.status === 'rejected').length;

    // Get top locations (group by location)
    const locationCounts = {};
    allDestinations.forEach(dest => {
      const loc = dest.location || 'Unknown';
      locationCounts[loc] = (locationCounts[loc] || 0) + 1;
    });

    const topLocations = Object.entries(locationCounts)
      .map(([_id, count]) => ({ _id, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Mock growth data (you can replace this with real data from your DB)
    const growth = [
      { month: 'Jan', users: 45 },
      { month: 'Feb', users: 52 },
      { month: 'Mar', users: 61 },
      { month: 'Apr', users: 58 },
      { month: 'May', users: 67 },
      { month: 'Jun', users: 73 },
    ];

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          travelers,
          contributors,
          guides,
        },
        destinations: {
          total: totalDestinations,
          approved: approvedDestinations,
          pending: pendingDestinations,
          rejected: rejectedDestinations,
          topLocations,
        },
        growth,
      },
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all guides
// @route   GET /api/admin/users/guides
// @access  Private/Admin
router.get('/users/guides', protect, authorize('admin'), async (req, res) => {
  try {

    const guides = await User.find({ role: 'guide' }).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: guides });
  } catch (error) {
    console.error('Error fetching guides:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all contributors
// @route   GET /api/admin/users/contributors
// @access  Private/Admin
router.get('/users/contributors', protect, authorize('admin'), async (req, res) => {
  try {

    const contributors = await User.find({ role: 'contributor' }).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: contributors });
  } catch (error) {
    console.error('Error fetching contributors:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all travelers
// @route   GET /api/admin/users/travelers
// @access  Private/Admin
router.get('/users/travelers', protect, authorize('admin'), async (req, res) => {
  try {

    const travelers = await User.find({ role: 'traveler' }).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: travelers });
  } catch (error) {
    console.error('Error fetching travelers:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all pending destinations
// @route   GET /api/admin/destinations/pending
// @access  Private/Admin
router.get('/destinations/pending', protect, authorize('admin'), async (req, res) => {
  try {

    const pending = await Destination.find({ status: 'pending' })
      .populate('contributor', 'name email')
      .sort({ createdAt: -1 });

    // Transform to match frontend if necessary (e.g., contributor -> createdBy)
    const transformed = pending.map(dest => ({
      ...dest._doc,
      createdBy: dest.contributor
    }));

    res.json({ success: true, data: transformed });
  } catch (error) {
    console.error('Error fetching pending destinations:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Approve a destination
// @route   PUT /api/admin/destinations/:id/approve
// @access  Private/Admin
router.put('/destinations/:id/approve', protect, authorize('admin'), async (req, res) => {
  try {

    const destination = await Destination.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', rejectionReason: '' },
      { new: true }
    );

    if (!destination) {
      return res.status(404).json({ message: 'Destination not found' });
    }

    res.json({ success: true, data: destination });
  } catch (error) {
    console.error('Error approving destination:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Reject a destination
// @route   PUT /api/admin/destinations/:id/reject
// @access  Private/Admin
router.put('/destinations/:id/reject', protect, authorize('admin'), async (req, res) => {
  try {

    const { rejectionReason } = req.body;

    const destination = await Destination.findByIdAndUpdate(
        req.params.id,
        { status: 'rejected', rejectionReason: rejectionReason || 'No reason provided' },
        { new: true }
    );

    if (!destination) {
      return res.status(404).json({ message: 'Destination not found' });
    }

    res.json({ success: true, data: destination });
  } catch (error) {
    console.error('Error rejecting destination:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete a destination (Permanently remove)
// @route   DELETE /api/admin/destinations/:id
// @access  Private/Admin
router.delete('/destinations/:id', protect, authorize('admin'), async (req, res) => {
    try {
  
      const destination = await Destination.findByIdAndDelete(req.params.id);
  
      if (!destination) {
        return res.status(404).json({ message: 'Destination not found' });
      }
  
      res.json({ success: true, message: 'Destination permanently deleted' });
    } catch (error) {
      console.error('Error deleting destination:', error);
      res.status(500).json({ message: error.message });
    }
  });

module.exports = router;
