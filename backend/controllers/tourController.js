const Tour = require('../models/Tour');

// Create a new tour
exports.createTour = async (req, res) => {
  try {
    const tourData = {
      ...req.body,
      guide: req.user.id
    };

    // Split category string if it's coming from form-data
    if (typeof req.body.categories === 'string') {
        tourData.categories = req.body.categories.split(',');
    }

    // Handle photos if any are uploaded via multer
    if (req.files && req.files.length > 0) {
      tourData.photos = req.files.map(file => file.path);
    }

    const tour = await Tour.create(tourData);

    res.status(201).json({
      success: true,
      data: tour
    });
  } catch (error) {
    console.error('Error creating tour:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while creating tour'
    });
  }
};

// Get tours for a specific guide (My Tours)
exports.getMyTours = async (req, res) => {
  try {
    const tours = await Tour.find({ guide: req.user.id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: tours.length,
      data: tours
    });
  } catch (error) {
    console.error('Error fetching guide tours:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching your tours'
    });
  }
};

// Get all tours (optional filter by guideId)
exports.getTours = async (req, res) => {
  try {
    const query = {};
    if (req.query.guideId) {
      query.guide = req.query.guideId;
    }
    
    const tours = await Tour.find(query)
      .populate('guide', 'name profileImage')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: tours.length,
      data: tours
    });
  } catch (error) {
    console.error('Error fetching tours:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching tours'
    });
  }
};

// Delete a tour
exports.deleteTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);

    if (!tour) {
      return res.status(404).json({ success: false, error: 'Tour not found' });
    }

    // Auth check: ownership or admin
    if (tour.guide.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    await tour.deleteOne();

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting tour:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting tour'
    });
  }
};
