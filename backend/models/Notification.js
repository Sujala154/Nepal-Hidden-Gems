const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional as per Prompt 1 "if applicable"
  },
  type: {
    type: String,
    enum: ['invite', 'booking', 'booking_update', 'destination_pending', 'destination_status', 'payment', 'system', 'other'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['unread', 'pending', 'accepted', 'declined', 'read'],
    default: 'unread'
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    // Flexible reference (can be a booking, chat, etc.)
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);
