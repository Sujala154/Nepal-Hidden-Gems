const User = require('../models/User');
const Destination = require('../models/Destination');

// Toggle a destination in user's favorites
exports.toggleFavorite = async (req, res) => {
    try {
        const { destinationId } = req.params;
        const userId = req.user.id;

        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(destinationId)) {
            return res.status(400).json({ success: false, error: 'Invalid destination ID' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const isFavorite = user.favorites.includes(destinationId);

        if (isFavorite) {
            // Remove from favorites
            user.favorites = user.favorites.filter(id => id.toString() !== destinationId);
        } else {
            // Add to favorites
            user.favorites.push(destinationId);
        }

        await user.save();

        res.json({
            success: true,
            isFavorite: !isFavorite,
            message: isFavorite ? 'Removed from favorites' : 'Added to favorites'
        });
    } catch (error) {
        console.error('Error toggling favorite:', error);
        res.status(500).json({ success: false, error: 'Server error while updating favorites' });
    }
};

// Get all favorite destinations for a user
exports.getFavorites = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).populate({
            path: 'favorites',
            select: 'name slug image location tagline rating description'
        });

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.json({
            success: true,
            data: user.favorites
        });
    } catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({ success: false, error: 'Server error while fetching favorites' });
    }
};
