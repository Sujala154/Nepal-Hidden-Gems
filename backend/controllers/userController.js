const User = require('../models/User');
const Destination = require('../models/Destination');

// @desc    Toggle favorite destination
// @route   POST /api/favorites/toggle/:id
// @access  Private
const toggleFavorite = async (req, res) => {
  try {
    const userId = req.user._id;
    const destId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isFavorite = user.favorites.some(id => id.toString() === destId);
    
    let updatedUser;
    if (!isFavorite) {
      // Add to favorites
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { $addToSet: { favorites: destId } },
        { new: true }
      );
      res.json({ success: true, message: 'Added to favorites', isFavorite: true });
    } else {
      // Remove from favorites
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { $pull: { favorites: destId } },
        { new: true }
      );
      res.json({ success: true, message: 'Removed from favorites', isFavorite: false });
    }
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user favorites
// @route   GET /api/favorites
// @access  Private
const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user.favorites });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  toggleFavorite,
  getFavorites
};
