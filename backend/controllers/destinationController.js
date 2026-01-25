const Destination = require('../models/Destination');

// Get destination by slug
exports.getDestinationBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    // Explicitly query by slug field to ensure we don't accidentally query by ID
    const destination = await Destination.findOne({ slug: slug, approved: true });

    if (!destination) {
      return res.status(404).json({
        success: false,
        error: 'Destination not found'
      });
    }

    res.json({
      success: true,
      data: destination
    });
  } catch (error) {
    console.error('Error fetching destination:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching destination'
    });
  }
};

// Get all destinations (for listing)
exports.getDestinations = async (req, res) => {
  try {
    const destinations = await Destination.find({ approved: true })
      .select('name slug location tagline description image')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: destinations.length,
      data: destinations
    });
  } catch (error) {
    console.error('Error fetching destinations:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching destinations'
    });
  }
};

// Create destination (for seeding/admin)
// Create destination (for contributors/admin)
exports.createDestination = async (req, res) => {
  try {
    // Generate slug from name
    const slug = req.body.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Handle image upload
    let imagePath = '';
    if (req.file) {
      imagePath = `/uploads/destinations/${req.file.filename}`;
    } else if (req.body.image) {
      // Fallback for URL-based images (e.g. from seed)
      imagePath = req.body.image;
    }

    const destinationData = {
      ...req.body,
      slug, // Force generated slug
      image: imagePath,
      createdBy: req.user.id, // Set creator
      approved: false // Default to pending
    };

    const destination = new Destination(destinationData);
    await destination.save();

    res.status(201).json({
      success: true,
      data: destination
    });
  } catch (error) {
    console.error('Error creating destination:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Destination with this name already exists'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server error while creating destination'
    });
  }
};

// Get content submitted by current user
exports.getMyDestinations = async (req, res) => {
  try {
    const destinations = await Destination.find({ createdBy: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: destinations.length,
      data: destinations
    });
  } catch (error) {
    console.error('Error fetching user destinations:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching your content'
    });
  }
};

// Update destination
exports.updateDestination = async (req, res) => {
  try {
    let destination = await Destination.findById(req.params.id);

    if (!destination) {
      return res.status(404).json({ success: false, error: 'Destination not found' });
    }

    // Check ownership
    if (destination.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to update this destination' });
    }

    // Handle image update
    if (req.file) {
      req.body.image = `/uploads/destinations/${req.file.filename}`;
    }

    // Prevent slug updates unless explicitly re-generated (simplification: don't allow slug update for now)
    delete req.body.slug;
    delete req.body.approved; // Prevent self-approval

    destination = await Destination.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      data: destination
    });
  } catch (error) {
    console.error('Error updating destination:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating destination'
    });
  }
};

// Delete destination
exports.deleteDestination = async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id);

    if (!destination) {
      return res.status(404).json({ success: false, error: 'Destination not found' });
    }

    // Check ownership
    if (destination.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this destination' });
    }

    await destination.deleteOne();

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting destination:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting destination'
    });
  }
};

