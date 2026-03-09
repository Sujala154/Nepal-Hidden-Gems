const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['pending', 'active', 'archived'],
    default: 'pending'
  },
  isGroup: {
    type: Boolean,
    default: false
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  // If it's related to a specific destination or booking
  metadata: {
    destinationName: String,
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    groupTitle: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Chat', ChatSchema);
