const mongoose = require('mongoose');

const GuideSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  contact: { type: String },
  email: { type: String },
  phone: { type: String },
  experience: { type: String },
  specialties: [{ type: String }]
}, { _id: false });

const DestinationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  location: { type: String, required: true },
  tagline: { type: String, required: true },
  description: { type: String, required: true },
  long_description: { type: String },
  specialty: { type: String },
  hospitality: { type: String },
  accommodation: { type: String },
  tips: { type: String },
  image: { type: String }, // Main image for card display
  multiple_images: [{ type: String }], // Array of image URLs for gallery
  guides: [GuideSchema],
  latitude: { type: Number },
  longitude: { type: Number },
  difficulty: { type: String, enum: ['easy', 'moderate', 'hard', 'extreme'] },
  bestSeason: { type: String },
  category: { type: String },
  visitors: { type: Number, default: 0 },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  numReviews: { type: Number, default: 0 },
  approved: { type: Boolean, default: false },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  rejectionTitle: { type: String },
  rejectionReason: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Index for faster slug lookups
DestinationSchema.index({ slug: 1 });

module.exports = mongoose.model('Destination', DestinationSchema);

