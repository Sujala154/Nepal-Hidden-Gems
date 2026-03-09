const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
  groupName: {
    type: String,
    required: true,
    trim: true,
    default: function() {
      return `Trip to ${this.destination}`;
    }
  },
  destination: {
    type: String,
    required: true
  },
  guide: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  maxMembers: {
    type: Number,
    required: true,
    default: 4 // Default max for a split group
  },
  estimatedCost: {
    type: Number,
    required: true
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
  status: {
    type: String,
    enum: ['open', 'full', 'closed'],
    default: 'open'
  }
}, { timestamps: true });

// Ensure we don't have multiple groups for the SAME guide on the SAME day
// This simplifies the logic: one guide can only do one group trip per day
GroupSchema.index({ guide: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Group', GroupSchema);
