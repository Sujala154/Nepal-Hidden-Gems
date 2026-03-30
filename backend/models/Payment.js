const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  traveler: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  guide: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  transactionId: {
    type: String,
    required: true
  },
  totalPaid: {
    type: Number,
    required: true
  },
  appFee: {
    type: Number,
    default: 500
  },
  guideShare: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Released'],
    default: 'Pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);
