const mongoose = require('mongoose');

const DestinationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  description: { type: String, required: true },
  tagline: { type: String },
  location: { type: String, required: true },
  difficulty: { 
    type: String, 
    enum: ['easy', 'moderate', 'hard', 'extreme'],
    default: 'moderate'
  },
  bestSeason: { type: String, default: 'all' },
  image: { type: String }, // Main display image
  images: [{ type: String }], // Array of additional image URLs
  category: { 
    type: String, 
    enum: ['Adventure', 'Culture', 'Food', 'Hiking', 'Nature', 'Wildlife', 'Spiritual', 'History'],
    default: 'Nature'
  },
  rating: { type: Number, default: 0 },
  contributor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: { type: String, default: '' },
  budgetLevel: {
    type: String,
    enum: ['Budget-Friendly', 'Mid-Range', 'Luxury', 'Ultra-Luxury'],
    default: 'Mid-Range'
  },
  specialty: { type: String },
  hospitality: { type: String },
  accommodation: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Destination', DestinationSchema);
