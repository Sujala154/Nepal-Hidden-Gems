const mongoose = require('mongoose');

const TourSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a tour title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price']
  },
  currency: {
    type: String,
    default: 'NPR'
  },
  duration: {
    type: String,
    required: [true, 'Please add duration']
  },
  categories: [{
    type: String
  }],
  photos: [{
    type: String
  }],
  guide: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Tour', TourSchema);
