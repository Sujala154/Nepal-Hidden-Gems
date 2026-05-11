const Destination = require('../models/Destination');
const { createNotification, notifyAdmins } = require('../utils/notificationHelper');

// Get destination by slug
exports.getDestinationBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    // Find destination by slug
    const destination = await Destination.findOne({ slug: slug });

    if (!destination) {
      return res.status(404).json({
        success: false,
        error: 'Destination not found'
      });
    }

    // Authorization check: 
    // Allow if approved OR if user is the creator OR if user is an admin
    const isApproved = destination.approved === true;
    const isCreator = req.user && destination.createdBy && destination.createdBy.toString() === req.user.id.toString();
    const isAdmin = req.user && req.user.role === 'admin';

    if (!isApproved && !isCreator && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'This destination is pending approval and is not yet public.'
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
      .select('name slug location tagline description image approved rating category visitors')
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

    // Strict validation for all required fields
    const requiredFields = [
      'name', 'location', 'tagline', 'description', 
      'category', 'difficulty', 'bestSeason', 
      'specialty', 'hospitality', 'accommodation', 'tips'
    ];

    const missingFields = requiredFields.filter(field => !req.body[field] || req.body[field].trim() === '');
    
    // 1. Combine all possible image sources (Files or JSON URLs)
    let images = [];
    
    // [X-RAY DEBUG] - Let's see exactly what the server receives
    console.log('\n--- [X-RAY DEBUG: START] ---');
    console.log('Method:', req.method);
    console.log('Headers Content-Type:', req.headers['content-type']);
    console.log('Body Keys:', Object.keys(req.body));
    console.log('Body Images Value:', req.body.images);
    console.log('Files Count:', req.files ? req.files.length : 0);
    
    // Check Multer files
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => file.path);
    } 
    
    // Check JSON body (images array or singular image)
    const bodyImages = req.body.images || req.body.image;
    if (images.length === 0 && bodyImages) {
      images = Array.isArray(bodyImages) ? bodyImages : [bodyImages];
    }

    // Clean up empty strings or nulls
    images = images.filter(img => img && typeof img === 'string' && img.trim() !== '');
    console.log('Final Images Array:', images);
    console.log('--- [X-RAY DEBUG: END] ---\n');

    // 2. Validation
    if (missingFields.length > 0 || images.length === 0) {
      return res.status(400).json({
        success: false,
        error: missingFields.length > 0 
          ? `Please provide all required fields: ${missingFields.join(', ')}`
          : "Please upload at least one image for the destination"
      });
    }

    // 3. Prepare data for saving
    const destinationData = {
      ...req.body,
      slug,
      image: images[0], // Primary image
      images: images,   // Full array for original schema
      multiple_images: images, // For gallery compatibility
      long_description: req.body.long_description || req.body.description,
      contributor: req.user.id,
      createdBy: req.user.id,
      approved: false, // Must be approved by admin
      status: 'pending'
    };

    const destination = new Destination(destinationData);
    await destination.save();

    // Trigger notification to admins
    await notifyAdmins({
      senderId: req.user.id,
      type: 'destination_pending',
      title: 'New Destination Pending Approval',
      message: `A new destination "${destination.name}" has been submitted for review.`,
      relatedId: destination._id
    });

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

    console.log(`DEBUG: Found ${destinations.length} destinations for user ${req.user.id}`);

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

    // Check ownership (Robust check)
    const isOwner = destination.createdBy ? destination.createdBy.toString() === req.user.id.toString() : false;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, error: 'Not authorized to update this destination' });
    }

    // Handle multiple image update
    let updatedImages = [];
    
    // 1. Keep existing images that were sent back
    if (req.body.existingImages) {
      updatedImages = Array.isArray(req.body.existingImages) 
        ? req.body.existingImages 
        : [req.body.existingImages];
    }
    
    // 2. Add new uploaded files
    if (req.files && req.files.length > 0) {
      const newPaths = req.files.map(file => file.path);
      updatedImages = [...updatedImages, ...newPaths];
    }

    // Update image fields in body
    if (updatedImages.length > 0) {
      req.body.image = updatedImages[0]; // First one as main
      req.body.multiple_images = updatedImages; // All for gallery
    }

    // Prevent slug updates unless explicitly re-generated (simplification: don't allow slug update for now)
    delete req.body.slug;
    
    // Manage status and approval
    if (req.user.role !== 'admin') {
      delete req.body.approved;
      delete req.body.status;
      
      // If it's being updated by owner, and it was rejected or approved, 
      // maybe we should send it back for review?
      // For now, let's specifically handle the "rejected -> pending" flow as requested
      if (destination.status === 'rejected') {
        req.body.status = 'pending';
        req.body.approved = false;
        req.body.rejectionTitle = ''; // Clear rejection title
        req.body.rejectionReason = ''; // Clear rejection reason
      }
    }

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

    // Check ownership (Robust check)
    const isOwner = destination.createdBy ? destination.createdBy.toString() === req.user.id.toString() : false;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
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

