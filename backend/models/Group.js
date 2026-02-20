const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
  groupName: {
    type: String,
    required: true,
    trim: true
  },
  destination: {
    type: String, // Can be a specific destination name or general location
    required: true
  },
  // Optional: Link to a Destination document if it exists in our DB
  destinationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Destination'
  },
  date: {
    type: Date,
    required: true
  },
  maxMembers: {
    type: Number,
    required: true,
    min: 2
  },
  estimatedCost: {
    type: Number,
    required: true,
    min: 0
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['accepted', 'pending'], default: 'accepted' },
    joinedAt: { type: Date, default: Date.now }
  }],
  // We can store messages here or just query them by groupId
}, { timestamps: true });

module.exports = mongoose.model('Group', GroupSchema);
