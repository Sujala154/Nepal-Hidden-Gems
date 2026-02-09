const mongoose = require('mongoose');
const Destination = require('../models/Destination');

// @desc    Get all destinations
// @route   GET /api/destinations
// @access  Public
const getDestinations = async (req, res) => {
  try {
    const destinations = await Destination.find({ status: 'approved' });
    res.json({ success: true, data: destinations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single destination
// @route   GET /api/destinations/:id
// @access  Public
const getDestination = async (req, res) => {
  try {
    const { id } = req.params;
    let destination;

    if (mongoose.Types.ObjectId.isValid(id)) {
      destination = await Destination.findById(id);
    } else {
      destination = await Destination.findOne({ slug: id });
    }

    if (destination) {
      res.json(destination);
    } else {
      res.status(404).json({ message: 'Destination not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new destination
// @route   POST /api/destinations
// @access  Private (Contributor)
const createDestination = async (req, res) => {
  try {
    const { name, description, location, category, tagline, difficulty, bestSeason, budgetLevel, specialty, hospitality, accommodation } = req.body;

    // Handle multiple image uploads
    let imagePaths = [];
    if (req.files && req.files.length > 0) {
      imagePaths = req.files.map(file => file.path);
    } else if (req.body.existingImages) {
      // If it's a single string or an array of strings
      imagePaths = Array.isArray(req.body.existingImages) ? req.body.existingImages : [req.body.existingImages];
    }

    const baseSlug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`;

    const destination = new Destination({
      name,
      slug,
      description,
      location,
      category,
      tagline,
      difficulty,
      bestSeason,
      budgetLevel,
      specialty,
      hospitality,
      accommodation,
      image: imagePaths[0] || '', // Use the first image as the main featured image
      images: imagePaths, // Store all images in the array
      contributor: req.user._id,
      status: 'pending' // Default status
    });

    const createdDestination = await destination.save();
    res.status(201).json(createdDestination);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a destination
// @route   PUT /api/destinations/:id
// @access  Private (Contributor/Admin)
const updateDestination = async (req, res) => {
  try {
    const { name, description, location, category, tagline, budgetLevel, specialty, hospitality, accommodation } = req.body;
    const destination = await Destination.findById(req.params.id);

    if (destination) {
      // Check ownership or admin status
      if (destination.contributor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(401).json({ message: 'Not authorized to update this destination' });
      }

      destination.name = name || destination.name;
      destination.description = description || destination.description;
      destination.location = location || destination.location;
      destination.category = category || destination.category;
      destination.tagline = tagline || destination.tagline;
      destination.difficulty = req.body.difficulty || destination.difficulty;
      destination.bestSeason = req.body.bestSeason || destination.bestSeason;
      destination.budgetLevel = budgetLevel || destination.budgetLevel;
      destination.specialty = specialty || destination.specialty;
      destination.hospitality = hospitality || destination.hospitality;
      destination.accommodation = accommodation || destination.accommodation;

      // Handle image updates
      let imagePaths = [];
      
      // Collect existing images that were kept
      if (req.body.existingImages) {
        imagePaths = Array.isArray(req.body.existingImages) 
          ? req.body.existingImages 
          : [req.body.existingImages];
      }

      // Add new uploaded files
      if (req.files && req.files.length > 0) {
        const newPaths = req.files.map(file => file.path);
        imagePaths = [...imagePaths, ...newPaths];
      }

      if (imagePaths.length > 0) {
        destination.images = imagePaths;
        destination.image = imagePaths[0]; // Update main image to the first in current list
      }

      const updatedDestination = await destination.save();
      res.json(updatedDestination);
    } else {
      res.status(404).json({ message: 'Destination not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a destination
// @route   DELETE /api/destinations/:id
// @access  Private (Contributor/Admin)
const deleteDestination = async (req, res) => {
    try {
      const destinationId = req.params.id;
      const destination = await Destination.findById(destinationId);
  
      if (destination) {
        // Check ownership or admin status
        if (destination.contributor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
          return res.status(401).json({ message: 'Not authorized to delete this destination' });
        }
  
        // 1. Remove from Destination collection
        await Destination.findByIdAndDelete(destinationId);
        
        // 2. Remove from all users' favorites (Clean up references)
        const User = require('../models/User'); // Import here to avoid circular dependency if any
        await User.updateMany(
          { favorites: destinationId },
          { $pull: { favorites: destinationId } }
        );

        console.log(`🗑️ Destination Deleted: ${destination.name} (${destinationId}) by ${req.user.name}`);
        
        res.json({ success: true, message: 'Destination removed from all locations' });
      } else {
        res.status(404).json({ message: 'Destination not found' });
      }
    } catch (error) {
      console.error('❌ Error deleting destination:', error);
      res.status(500).json({ message: error.message });
    }
  };

// @desc    Get user's destinations
// @route   GET /api/destinations/user/my-destinations
// @access  Private
const getUserDestinations = async (req, res) => {
  try {
    console.log('🔍 getUserDestinations called');
    console.log('📌 User ID from token:', req.user._id);
    const destinations = await Destination.find({ contributor: req.user._id });
    console.log('📦 Found destinations:', destinations.length);
    res.json({ success: true, data: destinations });
  } catch (error) {
    console.error('❌ Error in getUserDestinations:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDestinations,
  getDestination,
  createDestination,
  updateDestination,
  deleteDestination,
  getUserDestinations
};
